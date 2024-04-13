const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.signup = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const name = req.body.name;

  try {
    const exUser = await User.findOne({ email: email });
    if (exUser) {
      const error = new Error("User have already existed");
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

  //   try {
  const user = await User.findOne({ email: email });
  if (!user) {
    const error = new Error("Username or password is wrong!");
    error.statusCode = 401;
    throw error;
  }
  loadedUser = user;
  const isEqual = await bcrypt.compare(password, loadedUser.password);
  if (!isEqual) {
    const error = new Error("Username or password is wrong!");
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    {
      email: loadedUser.email,
      userId: loadedUser._id.toString(),
    },
    "somesupersecretsecret",
    { expiresIn: "1h" }
  );

  res.status(200).json({ token, userId: loadedUser._id.toString() });
  //   } catch (err) {
  //     if (!err.statusCode) {
  //       err.statusCode = 500;
  //     }
  //     next(err);
  //   }
};
