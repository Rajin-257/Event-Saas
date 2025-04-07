const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const eventController = require('../controllers/eventController');
const { ensureAuthenticated, ensureOrganizer, ensureEventOwner } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// Get all events
router.get('/', eventController.getAllEvents);

// Get event details
router.get('/:id', eventController.getEventById);

// Create event form
router.get('/create/e', ensureOrganizer, eventController.getCreateEvent);

// Create event submit
router.post('/create', [
  ensureOrganizer,
  upload.single('eventBanner'),
  handleUploadError,
  check('title', 'Title is required').notEmpty(),
  check('description', 'Description is required').notEmpty(),
  check('category', 'Category is required').notEmpty(),
  check('startDate', 'Start date is required').notEmpty(),
  check('endDate', 'End date is required').notEmpty(),
  check('venue', 'Venue is required').notEmpty(),
  check('venueAddress', 'Venue address is required').notEmpty()
], eventController.createEvent);

// Edit event form
router.get('/:id/edit', ensureEventOwner, eventController.getEditEvent);

// Update event
router.post('/:id/edit', [
  ensureEventOwner,
  upload.single('eventBanner'),
  handleUploadError,
  check('title', 'Title is required').notEmpty(),
  check('description', 'Description is required').notEmpty(),
  check('category', 'Category is required').notEmpty(),
  check('startDate', 'Start date is required').notEmpty(),
  check('endDate', 'End date is required').notEmpty(),
  check('venue', 'Venue is required').notEmpty(),
  check('venueAddress', 'Venue address is required').notEmpty()
], eventController.updateEvent);

// Delete event
router.delete('/:id', ensureEventOwner, eventController.deleteEvent);

// Publish/unpublish event
router.post('/:id/publish', ensureEventOwner, eventController.togglePublishEvent);

// Manage speakers
router.get('/:id/speakers', ensureEventOwner, eventController.getManageSpeakers);


// Add speaker
router.post('/:id/speakers', [
  ensureEventOwner,
  upload.single('speakerPhoto'),
  handleUploadError,
  check('name', 'Speaker name is required').notEmpty(),
  check('speakerType', 'Speaker type is required').notEmpty()
], eventController.addSpeaker);

// Edit speaker
router.post('/:id/speakers/:speakerId', [
  ensureEventOwner,
  upload.single('speakerPhoto'),
  handleUploadError,
  check('name', 'Speaker name is required').notEmpty(),
  check('speakerType', 'Speaker type is required').notEmpty()
], eventController.updateSpeaker);

// Delete speaker
router.post('delete/:id/speakers/:speakerId', ensureEventOwner, eventController.deleteSpeaker);

// Management of ticket types is handled by the ticketController and ticketRoutes

module.exports = router;