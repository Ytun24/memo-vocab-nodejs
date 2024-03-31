const bcrypt = require("bcryptjs");
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require("../models/user");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        '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'
    }
  })
);

exports.getLogin = (req, res, next) => {
  console.log(req.session.user);
  console.log(req.session.isLoggedIn);
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: false,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        res.redirect("/login");
      }

      bcrypt
      .compare(password, user.password)
      .then(doMatch => {
        if (doMatch) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save((error) => {
            console.log(error);
            res.redirect("/member/vocabs");
          });
        }

        res.redirect('/login');
      });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/showcase");
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ where: { email: email } })
    .then((user) => {
      if (user) {
        return res.redirect("/signup");
      }

      return bcrypt
        .hash(password, 12)
        .then((encryptPassword) => {
          const user = new User({ email: email, password: encryptPassword });
          user.save().then((user) => {
            user.createFavorite().then(() => {
              res.redirect("/login");
              return transporter.sendMail({
                to: email, // Change to your recipient
                from: 'nanying@windowslive.com', // Change to your verified sender
                subject: 'Sending with SendGrid is Fun',
                text: 'and easy to do anywhere, even with Node.js',
                html: '<strong>and easy to do anywhere, even with Node.js</strong>',
              });
            });
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.getReset = (req, res, next) => {
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password'
  });
};
