const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { ensureAuthenticated, ensureOrganizer, ensureAdmin, ensureEventOwner } = require('../middleware/auth');

// Dashboard statistics (AJAX endpoint)
router.get('/dashboard-stats', ensureAuthenticated, reportController.getDashboardStats);

// Sales report
router.get('/sales', ensureOrganizer, reportController.getSalesReport);

// Referral report
router.get('/referrals', ensureAuthenticated, reportController.getReferralReport);

// Check-in report for a specific event
router.get('/check-ins/:eventId', ensureEventOwner, reportController.getCheckInReport);

module.exports = router;