const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

// Profile routes
router.get('/profile', auth, userController.getUserProfile);
router.get('/profile/:id', auth, roleCheck(['SuperAdmin', 'Admin']), userController.getUserProfile);

// Edit profile routes
router.get('/edit-profile', auth, userController.getEditProfile);
router.post('/edit-profile', auth, upload.single('profileImage'), userController.postUpdateProfile);

// Change password routes
router.get('/change-password', auth, userController.getChangePassword);
router.post('/change-password', auth, userController.postChangePassword);

// Referral routes
router.get('/referral', auth, userController.getUserReferral);

// Admin user management routes
router.get('/', auth, roleCheck(['SuperAdmin', 'Admin']), userController.getAllUsers);
router.get('/create', auth, roleCheck(['SuperAdmin', 'Admin']), userController.getCreateUser);
router.post('/create', auth, roleCheck(['SuperAdmin', 'Admin']), upload.single('profileImage'), userController.postCreateUser);
router.post('/:id/toggle-status', auth, roleCheck(['SuperAdmin', 'Admin']), userController.toggleUserStatus);

module.exports = router;