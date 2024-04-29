const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const authController = require("../controllers/auth");
const User = require("../models/user");

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .custom(async (value) => {
        const existingUser = await User.findOne({ email: value });
        if (existingUser) {
          throw new Error("User have already existed");
        }
        return true;
      }),
    body("name").isAlpha("en-US", { ignore: " " }),
    body("password").isLength({ min: 5 }),
    body("confirmPassword").custom((value, { req }) => {
      return value === req.body.password;
    }),
  ],
  authController.signup
);
router.post(
  "/login",
  [body("email").isEmail(), body("password").isLength({ min: 5 })],
  authController.login
);
router.post("/forgot-password", authController.forgotPassword);
router.post(
  "/reset-password",
  [
    body("password").isLength({ min: 5 }),
    body("confirmPassword").custom((value, { req }) => {
      return value === req.body.password;
    }),
  ],
  authController.resetPassword
);

module.exports = router;
