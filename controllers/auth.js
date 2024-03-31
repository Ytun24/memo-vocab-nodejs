const bcrypt = require("bcryptjs");

const User = require("../models/user");

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
  User.findByPk(1)
    .then((user) => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save((error) => {
        console.log(error);
        res.redirect("/member/vocabs");
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
            });
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};
