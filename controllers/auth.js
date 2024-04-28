const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const sgMail = require("@sendgrid/mail");
const crypto = require("crypto");

const User = require("../models/user");
const Token = require("../models/token");

exports.signup = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("validation result: ", errors.array());
      const error = new Error("Invalid input");
      error.statusCode = 422;
      throw error;
    }

    const hashPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashPassword,
      name: name,
    });
    const newUser = await user.save();

    res.status(201).json({ id: newUser._id.toString(), email: newUser.email });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("validation result: ", errors.array());
      const error = new Error("Invalid input");
      error.statusCode = 422;
      throw error;
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("Email or password is wrong!");
      error.statusCode = 401;
      throw error;
    }
    loadedUser = user;
    const isEqual = await bcrypt.compare(password, loadedUser.password);
    if (!isEqual) {
      const error = new Error("Email or password is wrong!");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        email: loadedUser.email,
        userId: loadedUser._id.toString(),
      },
      "somesupersecretsecret",
      { expiresIn: "3h" }
    );

    res.status(200).json({ token, userId: loadedUser._id.toString() });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  const email = req.body.email;
  try {
    const user = await User.findOne({ email: email });
    if (!user) throw new Error("Email is not exist");

    let token = await Token.findOne({ userId: user._id });
    if (token) await token.deleteOne();
    let resetToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(resetToken, 12);

    await new Token({
      userId: user._id,
      token: hash,
      createdAt: Date.now(),
    }).save();

    const link = `http://localhost:4200/reset-password?token=${resetToken}&id=${user._id}`;

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: email,
      from: "nanying@windowslive.com",
      subject: "[Memo Vocab] Reset Password",
      html: `<p>You requested a password reset</p><a href="${link}">Reset Password</a>`,
    };

    // for testing
    // sgMail
    //   .send(msg)
    //   .then((response) => {
    //     console.log(response[0].statusCode);
    //     console.log(response[0].headers);
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //     next(error);
    //   });

    res.status(200).json({ message: "success", url: link });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const newPassword = req.body.password;
    const resetToken = req.body.resetToken;
    const userId = req.body.userId;
    const token = await Token.findOne({ userId: userId });
    if (!token) throw new Error("Invalid token!");

    const isEqual = await bcrypt.compare(resetToken, token.token);
    if (!isEqual) throw new Error("Invalid token! 2");

    let user = await User.findById(userId);
    if (!user) throw new Error("Invalid user");

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();
    await token.deleteOne();

    res.status(200).json({ message: "success" });
  } catch (err) {
    console.error(err);
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
