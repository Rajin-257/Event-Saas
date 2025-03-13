/**
 * User Routes
 */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { ensureAuthenticated } = require('../middlewares/auth');
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

// API Routes
router.get('/api/profile', ensureAuthenticated, userController.getProfile);
router.put('/api/profile', ensureAuthenticated, upload.single('profile_image'), validators.updateUserRules, validators.validate, userController.updateProfile);
router.get('/api/stats', ensureAuthenticated, userController.getUserStats);
router.get('/api/transactions', ensureAuthenticated, validators.paginationRules, validators.validate, userController.getUserTransactions);

// Web Routes
router.get('/profile', ensureAuthenticated, userController.renderProfilePage);
router.get('/transactions', ensureAuthenticated, userController.renderTransactionsPage);
router.get('/referrals', ensureAuthenticated, userController.renderReferralsPage);

module.exports = router;