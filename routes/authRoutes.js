const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const { ensureAuthenticated, forwardAuthenticated, ensureAdmin } = require('../middleware/auth');

// Public landing page
router.get('/', (req, res) => {
  res.render('index', { title: 'Event Management System' });
});

// Login page
router.get('/login', forwardAuthenticated, authController.getLogin);

// Login submit
router.post('/login', forwardAuthenticated, authController.postLogin);

// Register page
router.get('/register', forwardAuthenticated, authController.getRegister);

// Register submit
router.post('/register', forwardAuthenticated, [
  check('name', 'Name is required').notEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  check('password2', 'Passwords do not match').custom((value, { req }) => value === req.body.password)
], authController.postRegister);

// Email verification
router.get('/verify-email/:token', authController.verifyEmail);

router.get('/resend-verification-link/:email', authController.resendVerification);

// Password reset request form
router.get('/password-reset', forwardAuthenticated, authController.getPasswordReset);

// Password reset request submit
router.post('/password-reset', forwardAuthenticated, [
  check('email', 'Please include a valid email').isEmail()
], authController.postPasswordReset);

// Password reset form
router.get('/password-reset/:token', forwardAuthenticated, authController.getPasswordResetForm);

// Password reset submit
router.post('/password-create/:token', forwardAuthenticated, [
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  check('password2', 'Passwords do not match').custom((value, { req }) => value === req.body.password)
], authController.postPasswordResetForm);

// Logout
router.get('/logout', authController.logout);

// Dashboard redirect based on role
router.get('/dashboard', ensureAuthenticated, authController.getDashboard);

// Admin dashboard
router.get('/dashboard/admin', ensureAdmin, (req, res) => {
  res.render('dashboard/admin', { title: 'Admin Dashboard' });
});

// Organizer dashboard
router.get('/dashboard/organizer', ensureAuthenticated, (req, res) => {
  if (req.user.role !== 'organizer' && req.user.role !== 'super_admin') {
    req.flash('error_msg', 'You are not authorized to access this page');
    return res.redirect('/dashboard');
  }
  res.render('dashboard/organizer', { title: 'Organizer Dashboard' });
});

// Attendee dashboard
router.get('/dashboard/attendee', ensureAuthenticated, (req, res) => {
  res.render('dashboard/attendee', { title: 'Attendee Dashboard' });
});

module.exports = router;