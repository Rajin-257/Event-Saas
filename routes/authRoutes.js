/**
 * Authentication Routes
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { ensureAuthenticated, ensureNotAuthenticated } = require('../middlewares/auth');
const validators = require('../utils/validators');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Ensure upload directory exists
const profileUploadDir = 'public/uploads/profiles';
if (!fs.existsSync(profileUploadDir)){
  fs.mkdirSync(profileUploadDir, { recursive: true });
}

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = file.originalname.split('.').pop();
    cb(null, `profile-${req.user.id}-${uniqueSuffix}.${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Public routes
router.post('/register', authController.register);
router.post('/login', validators.loginRules, validators.validate, authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/forgot-password', validators.resetPasswordRequestRules, validators.validate, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.post('/logout', ensureAuthenticated, authController.logout);
router.get('/profile', ensureAuthenticated, authController.getProfile);
router.post('/profile', ensureAuthenticated, upload.single('profile_image'), validators.validate, authController.updateProfile);
router.post('/change-password', ensureAuthenticated, authController.changePassword);

// Web routes
router.get('/login', ensureNotAuthenticated, (req, res) => {
  res.render('auth/login', { title: 'Login' });
});

router.get('/register', ensureNotAuthenticated, (req, res) => {
  res.render('auth/register', { title: 'Register' });
});

router.get('/forgot-password', ensureNotAuthenticated, (req, res) => {
  res.render('auth/forgot-password', { title: 'Forgot Password' });
});

router.get('/reset-password', ensureNotAuthenticated, (req, res) => {
  const { token } = req.query;
  if (!token) {
    req.flash('error_msg', 'Invalid reset token');
    return res.redirect('/login');
  }
  res.render('auth/reset-password', { title: 'Reset Password', token });
});

router.get('/verify-email', (req, res) => {
  const { token } = req.query;
  if (!token) {
    req.flash('error_msg', 'Invalid verification token');
    return res.redirect('/login');
  }
  res.render('auth/verify-email', { title: 'Verify Email', token });
});
router.get('/resend-verification', (req, res) => {
  res.render('auth/resend-verification', { title: 'Resend Verification Email' });
});

// Dashboard route
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard/index', { 
    title: 'Dashboard',
    user: req.user,
  });
});

module.exports = router;