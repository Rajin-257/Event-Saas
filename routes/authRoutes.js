const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const {
  validate,
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require("../middlewares/validation");
const {
  redirectIfAuthenticated,
  isAuthenticated,
} = require("../middlewares/auth");

// Apply isAuthenticated middleware to all routes for setting locals
router.use(isAuthenticated);

// Login routes
router.get("/login", redirectIfAuthenticated, authController.getLogin);
router.post(
  "/login",
  redirectIfAuthenticated,
  validate(loginValidation),
  authController.loginWithJWT,
);

// Register routes
router.get("/register", redirectIfAuthenticated, authController.getRegister);
router.post(
  "/register",
  redirectIfAuthenticated,
  validate(registerValidation),
  authController.postRegister,
);

// Email verification
router.get("/verify-email/:id/:token", authController.verifyEmail);

// Forgot password routes
router.get(
  "/forgot-password",
  redirectIfAuthenticated,
  authController.getForgotPassword,
);
router.post(
  "/forgot-password",
  redirectIfAuthenticated,
  validate(forgotPasswordValidation),
  authController.postForgotPassword,
);

// Reset password routes
router.get(
  "/reset-password",
  redirectIfAuthenticated,
  authController.getResetPassword,
);
router.post(
  "/reset-password",
  redirectIfAuthenticated,
  validate(resetPasswordValidation),
  authController.postResetPassword,
);

// Logout route
router.get("/logout", authController.logout);

module.exports = router;
