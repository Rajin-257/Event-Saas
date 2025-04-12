const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Import controllers
const dashboardController = require('../controllers/dashboardController');
const reportController = require('../controllers/reportController');

// Dashboard route
router.get('/dashboard', auth, roleCheck(['SuperAdmin', 'Admin']), dashboardController.getAdminDashboard);

// Settings route
router.get('/settings', auth, roleCheck(['SuperAdmin', 'Admin']), require('../controllers/settingsController').getSettings);
router.post('/settings', auth, roleCheck(['SuperAdmin', 'Admin']), require('../controllers/settingsController').updateSettings);

// Admin booking actions
router.post('/bookings/:id/payment-status', auth, roleCheck(['SuperAdmin', 'Admin', 'Office Staff']), require('../controllers/bookingController').updatePaymentStatus);
router.post('/bookings/:id/check-in', auth, roleCheck(['SuperAdmin', 'Admin', 'Ticket Checker']), require('../controllers/bookingController').adminCheckIn);
router.post('/bookings/:id/notes', auth, roleCheck(['SuperAdmin', 'Admin', 'Office Staff']), require('../controllers/bookingController').updateNotes);

module.exports = router;