const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middleware/upload');

// Login routes
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

// Register routes
router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);

// Logout route
router.get('/logout', authController.logout);

// Forgot password routes
router.get('/forgot-password', authController.getForgotPassword);
router.post('/forgot-password', authController.postForgotPassword);

// Reset password routes
router.get('/reset-password', authController.getResetPassword);
router.post('/reset-password', authController.postResetPassword);

// OTP routes
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);

module.exports = router;