const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const { ensureAuthenticated, ensureAdmin, ensureOrganizer } = require('../middleware/auth');

// View payment history
router.get('/history', ensureAuthenticated, paymentController.getPaymentHistory);

// View invoice
router.get('/invoice/:invoiceNumber', ensureAuthenticated, paymentController.getInvoice);

// Confirm manual payment (admin/organizer)
router.post('/:id/confirm', ensureAuthenticated, paymentController.confirmManualPayment);

// View refund form
router.get('/:id/refund', ensureOrganizer, (req, res) => {
  res.render('payments/refund', { 
    title: 'Process Refund',
    paymentId: req.params.id
  });
});

// Process refund
router.post('/:id/refund', [
  ensureOrganizer,
  check('refundAmount', 'Refund amount is required').isNumeric(),
  check('refundReason', 'Refund reason is required').notEmpty()
], paymentController.processRefund);

// User wallet
router.get('/wallet', ensureAuthenticated, paymentController.getUserWallet);

// Request payout
router.post('/payout-request', [
  ensureAuthenticated,
  check('amount', 'Amount is required').isNumeric(),
  check('paymentMethod', 'Payment method is required').notEmpty(),
  check('accountDetails', 'Account details are required').notEmpty()
], paymentController.requestPayout);

// Admin routes for managing payouts
router.get('/payout-requests', ensureAdmin, paymentController.getPayoutRequests);

router.post('/payout/:id/process', [
  ensureAdmin,
  check('transactionId', 'Transaction ID is required').notEmpty()
], paymentController.processPayout);

// Payment gateway configuration
router.get('/payment-config', ensureAdmin, paymentController.getPaymentConfig);

router.post('/payment-config', ensureAdmin, paymentController.updatePaymentConfig);

module.exports = router;