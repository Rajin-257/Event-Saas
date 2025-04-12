const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// User booking routes
router.get('/', auth, bookingController.getUserBookings);
router.get('/event/:eventId', auth, bookingController.getBookingForm);
router.post('/event/:eventId', auth, bookingController.postInitiateBooking);
router.get('/checkout', auth, bookingController.getCheckout);
router.post('/complete', auth, bookingController.postCompleteBooking);
router.get('/:id', auth, bookingController.getBookingDetails);
router.post('/:id/cancel', auth, bookingController.cancelBooking);

// Admin booking routes
router.get('/admin/all', auth, roleCheck(['SuperAdmin', 'Admin', 'Office Staff']), bookingController.getAllBookings);

module.exports = router;