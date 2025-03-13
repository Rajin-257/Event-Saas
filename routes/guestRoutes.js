/**
 * Guest Routes
 */
const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guestController');
const { ensureAuthenticated, ensureRole } = require('../middlewares/auth');
const validators = require('../utils/validators');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Ensure upload directory exists
const guestUploadDir = 'public/uploads/guests';
if (!fs.existsSync(guestUploadDir)){
  fs.mkdirSync(guestUploadDir, { recursive: true });
}

// Configure multer for guest profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, guestUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = file.originalname.split('.').pop();
    cb(null, `guest-${uniqueSuffix}.${ext}`);
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
router.get('/api', ensureAuthenticated, ensureRole(['admin', 'organizer']), validators.paginationRules, validators.validate, guestController.getAllGuests);
router.get('/api/:id', ensureAuthenticated, ensureRole(['admin', 'organizer']), guestController.getGuestById);
router.post('/api', ensureAuthenticated, ensureRole(['admin', 'organizer']), upload.single('profile_image'),  validators.validate, guestController.createGuest);
router.put('/api/:id', ensureAuthenticated, ensureRole(['admin', 'organizer']), upload.single('profile_image'),  validators.validate, guestController.updateGuest);
router.delete('/api/:id', ensureAuthenticated, ensureRole(['admin', 'organizer']), guestController.deleteGuest);

// Guest event management
router.get('/api/:id/events', ensureAuthenticated, ensureRole(['admin', 'organizer']), guestController.getGuestEvents);
router.post('/api/:id/events', ensureAuthenticated, ensureRole(['admin', 'organizer']), guestController.addGuestToEvent);
router.delete('/api/:id/events/:event_id', ensureAuthenticated, ensureRole(['admin', 'organizer']), guestController.removeGuestFromEvent);

// Web Routes
router.get('/', ensureAuthenticated, ensureRole(['admin', 'organizer']), guestController.renderGuestsPage);
router.get('/create', ensureAuthenticated, ensureRole(['admin', 'organizer']), guestController.renderCreateGuestPage);
router.get('/:id', ensureAuthenticated, ensureRole(['admin', 'organizer']), guestController.renderGuestDetailsPage);
router.get('/:id/edit', ensureAuthenticated, ensureRole(['admin', 'organizer']), guestController.renderEditGuestPage);

module.exports = router;