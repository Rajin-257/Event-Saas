/**
 * Ticket Routes
 */
const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { ensureAuthenticated, ensureRole } = require('../middlewares/auth');
const validators = require('../utils/validators');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Ensure upload directories exist
const ticketUploadDir = 'public/uploads/tickets';
const attendeeUploadDir = 'public/uploads/attendees';

if (!fs.existsSync(ticketUploadDir)){
  fs.mkdirSync(ticketUploadDir, { recursive: true });
}

if (!fs.existsSync(attendeeUploadDir)){
  fs.mkdirSync(attendeeUploadDir, { recursive: true });
}

// Configure multer for attendee photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, attendeeUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = file.originalname.split('.').pop();
    cb(null, `attendee-${req.params.code}-${uniqueSuffix}.${ext}`);
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
// Ticket Type Management
router.post('/api/types', ensureAuthenticated, ensureRole(['admin', 'organizer']), validators.createTicketTypeRules, validators.validate, ticketController.createTicketType);
router.put('/api/types/:id', ensureAuthenticated, ensureRole(['admin', 'organizer']), ticketController.updateTicketType);
router.delete('/api/types/:id', ensureAuthenticated, ensureRole(['admin', 'organizer']), ticketController.deleteTicketType);

// Ticket Management
router.post('/api/purchase', ensureAuthenticated, validators.createTicketRules, validators.validate, ticketController.purchaseTicket);
router.get('/api/user/:userId?', ensureAuthenticated, validators.paginationRules, validators.validate, ticketController.getUserTickets);
router.get('/api/event/:eventId', ensureAuthenticated, ensureRole(['admin', 'organizer']), validators.paginationRules, validators.validate, ticketController.getEventTickets);
router.get('/api/:code', ensureAuthenticated, ticketController.getTicketByCode);
router.post('/api/:code/verify', ensureAuthenticated, ensureRole(['admin', 'organizer']), ticketController.verifyTicket);
router.post('/api/:code/checkin', ensureAuthenticated, ensureRole(['admin', 'organizer']), upload.single('attendee_photo'), ticketController.checkInTicket);
router.post('/api/:code/cancel', ensureAuthenticated, ticketController.cancelTicket);
router.post('/api/:code/payment', ensureAuthenticated, validators.paymentRules, validators.validate, ticketController.processPayment);

// Web Routes
router.get('/verify', ensureAuthenticated, ensureRole(['admin', 'organizer']), ticketController.renderVerifyPage);
router.get('/view/:code', ensureAuthenticated, ticketController.renderTicketDetails);
router.get('/purchase/:eventId', ensureAuthenticated, ticketController.renderPurchasePage);

module.exports = router;