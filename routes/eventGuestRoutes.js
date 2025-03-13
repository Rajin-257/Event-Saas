/**
 * Event Guest Routes
 */
const express = require('express');
const router = express.Router();
const eventGuestController = require('../controllers/eventGuestController');
const { ensureAuthenticated, ensureRole } = require('../middlewares/auth');
const validators = require('../utils/validators');


// All routes require authentication
router.use(ensureAuthenticated);

// API Routes
router.get('/api/events/:eventId/guests', ensureRole(['admin', 'organizer']), validators.paginationRules, validators.validate, eventGuestController.getAllEventGuests);
router.post('/api/events/:eventId/guests', ensureRole(['admin', 'organizer']),  validators.validate, eventGuestController.addGuestToEvent);
router.put('/api/events/:eventId/guests/:guestId', ensureRole(['admin', 'organizer']), eventGuestController.updateEventGuest);
router.delete('/api/events/:eventId/guests/:guestId', ensureRole(['admin', 'organizer']), eventGuestController.removeGuestFromEvent);

// Web Routes
router.get('/events/:id/guests', ensureRole(['admin', 'organizer']), eventGuestController.renderEventGuestsPage);

module.exports = router;