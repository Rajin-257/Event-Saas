const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Ticket routes
router.get('/event/:eventId', auth, ticketController.getEventTickets);
router.get('/event/:eventId/create', auth, roleCheck(['SuperAdmin', 'Admin']), ticketController.getCreateTicket);
router.post('/event/:eventId/create', auth, roleCheck(['SuperAdmin', 'Admin']), ticketController.postCreateTicket);
router.get('/:id/edit', auth, roleCheck(['SuperAdmin', 'Admin']), ticketController.getEditTicket);
router.post('/:id/update', auth, roleCheck(['SuperAdmin', 'Admin']), ticketController.postUpdateTicket);
router.post('/:id/delete', auth, roleCheck(['SuperAdmin', 'Admin']), ticketController.deleteTicket);

// Ticket checker routes
router.get('/checker', auth, roleCheck(['SuperAdmin', 'Admin', 'Ticket Checker']), ticketController.getTicketCheckerDashboard);
router.post('/verify', auth, roleCheck(['SuperAdmin', 'Admin', 'Ticket Checker']), ticketController.verifyTicket);

module.exports = router;