/**
 * Payment Routes
 */
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { ensureAuthenticated, ensureRole } = require('../middlewares/auth');
const validators = require('../utils/validators');

// All routes require authentication
router.use(ensureAuthenticated);

// API Routes
router.get('/api/:id', paymentController.getPaymentById);
router.get('/api/user/:userId?', validators.paginationRules, validators.validate, paymentController.getUserPayments);
router.post('/api/process/:code', validators.paymentRules, validators.validate, paymentController.processPayment);
router.post('/api/:id/refund', paymentController.requestRefund);
router.get('/api/stats', ensureRole('admin'), paymentController.getPaymentStats);

// Web Routes
router.get('/', paymentController.renderPaymentsPage);
router.get('/:id', paymentController.renderPaymentDetailsPage);

module.exports = router;