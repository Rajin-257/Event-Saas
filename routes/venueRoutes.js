const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venueController');
const { ensureAuthenticated, ensureRole } = require('../middlewares/auth');

// API Routes
router.get('/api', ensureAuthenticated,   venueController.getAllVenues);
router.get('/api/:id', ensureAuthenticated, venueController.getVenueById);
router.post('/api', ensureAuthenticated, ensureRole(['admin', 'organizer']),   venueController.createVenue);
router.post('/api/update', ensureAuthenticated, ensureRole(['admin', 'organizer']),   venueController.updateVenue);
router.post('/api/delete/', ensureAuthenticated, ensureRole(['admin', 'organizer']), venueController.deleteVenue);
router.get('/api/:id/events', ensureAuthenticated,  venueController.getVenueEvents);

// Web Routes
router.get('/', ensureAuthenticated, venueController.renderVenuesPage);
router.get('/create', ensureAuthenticated, ensureRole(['admin', 'organizer']), venueController.renderCreateVenuePage);
router.get('/:id', ensureAuthenticated, venueController.renderVenueDetailsPage);
router.get('/:id/edit', ensureAuthenticated, ensureRole(['admin', 'organizer']), venueController.renderEditVenuePage);

module.exports = router;