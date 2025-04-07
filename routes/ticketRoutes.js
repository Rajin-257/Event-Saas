const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const ticketController = require('../controllers/ticketController');
const { ensureAuthenticated, ensureOrganizer, ensureEventOwner } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// Manage ticket types for an event
router.get('/events/:id/tickets', ensureEventOwner, ticketController.getManageTicketTypes);
 
// Add ticket type
router.post('/events/:id/ticketss', [
  ensureEventOwner,
  check('name', 'Ticket name is required').notEmpty(),
  check('price', 'Price is required').isNumeric(),
  check('quantity', 'Quantity is required').isInt({ min: 1 }),
  check('saleStartDate', 'Sale start date is required').notEmpty(),
  check('saleEndDate', 'Sale end date is required').notEmpty()
], ticketController.addTicketType);

// Update ticket type
router.post('/events/:id/tickets/:ticketTypeId', [
  ensureEventOwner,
  check('name', 'Ticket name is required').notEmpty(),
  check('price', 'Price is required').isNumeric(),
  check('quantity', 'Quantity is required').isInt({ min: 1 }),
  check('saleStartDate', 'Sale start date is required').notEmpty(),
  check('saleEndDate', 'Sale end date is required').notEmpty()
], ticketController.updateTicketType);

// Delete ticket type
router.post('/delete/:id/tickets/:ticketTypeId', ensureEventOwner, ticketController.deleteTicketType);

// Book tickets (step 1)
router.get('/events/:id/book', ensureAuthenticated, ticketController.getBookTickets);

// Checkout (step 2)
router.get('/events/:id/tickets/:ticketTypeId/checkout', ensureAuthenticated, ticketController.getCheckout);

// Apply coupon code
router.post('/apply-coupon', ensureAuthenticated, ticketController.applyCoupon);

// Process booking and payment
router.post('/complete-booking', ensureAuthenticated, ticketController.completeBooking);

// View my tickets
router.get('/my-tickets', ensureAuthenticated, ticketController.getMyTickets);

// View single ticket
router.get('/ticket/:id', ensureAuthenticated, ticketController.getTicketDetails);

// Check-in with QR code scan
router.post('/events/:id/check-in', ensureOrganizer, ticketController.checkInTicket);

// Manual check-in by ticket number
router.post('/events/:id/manual-check-in', [
  ensureOrganizer,
  check('ticketNumber', 'Ticket number is required').notEmpty(),
  upload.single('attendeePhoto'),
  handleUploadError
], ticketController.checkInTicket);

module.exports = router;