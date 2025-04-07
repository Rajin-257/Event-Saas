const { check, validationResult } = require('express-validator');
const authConfig = require('../config/auth');

/**
 * Validation helper functions for different form types
 */
module.exports = {
  // Form validation result handler
  validateForm: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return { success: false, errors: errors.array() };
    }
    return { success: true };
  },

  // User registration validation
  registerValidation: [
    check('name', 'Name is required').notEmpty().trim(),
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', `Password must be at least ${authConfig.passwordRequirements.minLength} characters`)
      .isLength({ min: authConfig.passwordRequirements.minLength }),
    check('password2', 'Passwords do not match').custom((value, { req }) => value === req.body.password),
    check('phone', 'Please enter a valid phone number').optional().isMobilePhone()
  ],

  // User profile update validation
  profileValidation: [
    check('name', 'Name is required').notEmpty().trim(),
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('phone', 'Please enter a valid phone number').optional().isMobilePhone()
  ],

  // Password change validation
  passwordValidation: [
    check('currentPassword', 'Current password is required').notEmpty(),
    check('newPassword', `Password must be at least ${authConfig.passwordRequirements.minLength} characters`)
      .isLength({ min: authConfig.passwordRequirements.minLength }),
    check('confirmPassword', 'Passwords do not match').custom((value, { req }) => value === req.body.newPassword)
  ],

  // Event creation/update validation
  eventValidation: [
    check('title', 'Title is required').notEmpty().trim(),
    check('description', 'Description is required').notEmpty(),
    check('category', 'Category is required').notEmpty().isIn(['concert', 'seminar', 'workshop', 'conference', 'exhibition', 'other']),
    check('startDate', 'Start date is required').notEmpty().isISO8601(),
    check('endDate', 'End date is required').notEmpty().isISO8601(),
    check('venue', 'Venue is required').notEmpty().trim(),
    check('venueAddress', 'Venue address is required').notEmpty().trim(),
    check('maxAttendees', 'Maximum attendees must be a positive number').optional().isInt({ min: 1 })
  ],

  // Ticket type validation
  ticketTypeValidation: [
    check('name', 'Ticket name is required').notEmpty().trim(),
    check('price', 'Price must be a positive number').isFloat({ min: 0 }),
    check('quantity', 'Quantity must be a positive number').isInt({ min: 1 }),
    check('type', 'Ticket type is required').notEmpty().isIn(['vip', 'general', 'premium', 'early_bird', 'other']),
    check('saleStartDate', 'Sale start date is required').notEmpty().isISO8601(),
    check('saleEndDate', 'Sale end date is required').notEmpty().isISO8601()
  ],

  // Speaker validation
  speakerValidation: [
    check('name', 'Speaker name is required').notEmpty().trim(),
    check('speakerType', 'Speaker type is required').notEmpty().isIn(['keynote', 'guest', 'regular', 'panel']),
    check('sessionTopic', 'Session topic is required').optional(),
    check('sessionTime', 'Session time must be a valid date').optional().isISO8601(),
    check('sessionDuration', 'Session duration must be a positive number').optional().isInt({ min: 1 })
  ],

  // Coupon validation
  couponValidation: [
    check('code', 'Coupon code is required').notEmpty().trim(),
    check('discountType', 'Discount type is required').notEmpty().isIn(['percentage', 'fixed']),
    check('discountValue', 'Discount value must be a positive number').isFloat({ min: 0 }),
    check('startDate', 'Start date is required').notEmpty().isISO8601(),
    check('endDate', 'End date is required').notEmpty().isISO8601(),
    check('minPurchaseAmount', 'Minimum purchase amount must be a positive number').optional().isFloat({ min: 0 }),
    check('usageLimit', 'Usage limit must be a positive number').optional().isInt({ min: 1 })
  ],

  // Payment validation
  paymentValidation: [
    check('paymentMethod', 'Payment method is required').notEmpty().isIn(['bkash', 'nagad', 'rocket', 'card', 'manual']),
    check('amount', 'Amount must be a positive number').isFloat({ min: 0 }),
    check('transactionId', 'Transaction ID is required for manual payments').if((value, { req }) => req.body.paymentMethod === 'manual').notEmpty()
  ],

  // Refund validation
  refundValidation: [
    check('refundReason', 'Reason is required').notEmpty(),
    check('refundAmount', 'Refund amount must be a positive number').isFloat({ min: 0 })
  ],

  // Payout request validation
  payoutValidation: [
    check('amount', 'Amount must be a positive number').isFloat({ min: 0 }),
    check('paymentMethod', 'Payment method is required').notEmpty(),
    check('accountDetails', 'Account details are required').notEmpty()
  ]
};