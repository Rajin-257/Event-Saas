/**
 * Event Routes
 */
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { ensureAuthenticated, ensureRole } = require('../middlewares/auth');
const validators = require('../utils/validators');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Ensure upload directory exists
const eventUploadDir = 'public/uploads/events';
if (!fs.existsSync(eventUploadDir)){
  fs.mkdirSync(eventUploadDir, { recursive: true });
}

// Configure multer for event banner uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, eventUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = file.originalname.split('.').pop();
    cb(null, `event-${uniqueSuffix}.${ext}`);
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
// Public routes
router.get('/api', validators.paginationRules, validators.validate, eventController.getAllEvents);
router.get('/api/:id', eventController.getEventById);

// Protected routes
router.post('/api', ensureAuthenticated, ensureRole(['admin', 'organizer']), upload.single('banner_image'), validators.createEventRules, validators.validate, eventController.createEvent);
router.put('/api/:id', ensureAuthenticated, ensureRole(['admin', 'organizer']), upload.single('banner_image'), eventController.updateEvent);
router.delete('/api/:id', ensureAuthenticated, ensureRole(['admin', 'organizer']), eventController.deleteEvent);

// Event guests
router.get('/api/:id/guests', ensureAuthenticated, eventController.getEventGuests);
router.post('/api/:id/guests', ensureAuthenticated, ensureRole(['admin', 'organizer']), eventController.addEventGuest);
router.delete('/api/:id/guests/:guest_id', ensureAuthenticated, ensureRole(['admin', 'organizer']), eventController.removeEventGuest);

// Event statistics
router.get('/api/:id/stats', ensureAuthenticated, ensureRole(['admin', 'organizer']), eventController.getEventStats);

// Web Routes
router.get('/', eventController.renderEventsPage);
router.get('/:id', eventController.renderEventDetailsPage);

// Event management (Admin/Organizer)
router.get('/manage/create', ensureAuthenticated, ensureRole(['admin', 'organizer']), (req, res) => {
  res.render('events/create', { title: 'Create Event' });
});

router.get('/manage/:id/edit', ensureAuthenticated, ensureRole(['admin', 'organizer']), async (req, res) => {
  try {
    const event = await db.Event.findByPk(req.params.id, {
      include: [{ model: db.Venue }]
    });
    
    if (!event) {
      req.flash('error_msg', 'Event not found');
      return res.redirect('/events');
    }
    
    // Check if user is authorized (creator or admin)
    const isAdmin = req.user.Roles.some(role => role.name === 'admin');
    if (event.created_by !== req.user.id && !isAdmin) {
      req.flash('error_msg', 'Not authorized to edit this event');
      return res.redirect('/events');
    }
    
    // Get venues for dropdown
    const venues = await db.Venue.findAll();
    
    res.render('events/edit', { 
      title: 'Edit Event',
      event,
      venues
    });
  } catch (error) {
    req.flash('error_msg', 'Error loading event');
    res.redirect('/events');
  }
});

router.get('/manage/:id/tickets', ensureAuthenticated, ensureRole(['admin', 'organizer']), async (req, res) => {
  try {
    const event = await db.Event.findByPk(req.params.id, {
      include: [{ model: db.TicketType }]
    });
    
    if (!event) {
      req.flash('error_msg', 'Event not found');
      return res.redirect('/events');
    }
    
    // Check if user is authorized (creator or admin)
    const isAdmin = req.user.Roles.some(role => role.name === 'admin');
    if (event.created_by !== req.user.id && !isAdmin) {
      req.flash('error_msg', 'Not authorized to manage tickets for this event');
      return res.redirect('/events');
    }
    
    res.render('events/tickets', { 
      title: 'Manage Tickets',
      event
    });
  } catch (error) {
    req.flash('error_msg', 'Error loading event tickets');
    res.redirect('/events');
  }
});

module.exports = router;