const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// Profile
router.get('/profile', ensureAuthenticated, userController.getProfile);

// Update profile
router.post('/profile', [
  ensureAuthenticated,
  upload.single('profileImage'),
  handleUploadError,
  check('name', 'Name is required').notEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('phone', 'Please include a valid phone number').optional().isMobilePhone()
], userController.updateProfile);

// Change password
router.post('/change-password', [
  ensureAuthenticated,
  check('currentPassword', 'Current password is required').notEmpty(),
  check('newPassword', 'Password must be at least 6 characters').isLength({ min: 6 }),
  check('confirmPassword', 'Passwords do not match').custom((value, { req }) => value === req.body.newPassword)
], userController.changePassword);

// Admin routes for user management
router.get('/admin/users', ensureAdmin, userController.getAllUsers);

router.get('/admin/users/:id', ensureAdmin, userController.getUserById);

router.post('/admin/users/:id/role', [
  ensureAdmin,
  check('role', 'Role is required').isIn(['super_admin', 'organizer', 'attendee'])
], userController.updateUserRole);

router.post('/admin/users/:id/status', [
  ensureAdmin,
  check('status', 'Status is required').isIn(['active', 'inactive', 'blocked'])
], userController.updateUserStatus);

// Get referral code and stats
router.get('/referrals', ensureAuthenticated, userController.getReferrals);

module.exports = router;