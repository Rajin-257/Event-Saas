/**
 * Validation utilities
 */
const { body, param, query, validationResult } = require('express-validator');
const db = require('../models');
const User = db.User;

/**
 * Process validation results
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {function} next - Express next function
 * @returns {void|Response} - Call next or return validation error response
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (errors.isEmpty()) {
    return next();
  }
  
  // Format errors for response
  const extractedErrors = {};
  errors.array().forEach(err => {
    extractedErrors[err.param] = err.msg;
  });
  
  return res.status(422).json({
    status: 'error',
    message: 'Validation failed',
    errors: extractedErrors
  });
};

/**
 * Registration validation rules
 */


/**
 * Login validation rules
 */
exports.loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
    
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
];

/**
 * Password reset request validation rules
 */
exports.resetPasswordRequestRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .custom(async (value) => {
      const user = await User.findOne({ where: { email: value } });
      if (!user) {
        return Promise.reject('No account found with this email');
      }
      return true;
    })
];


/**
 * Create event validation rules
 */
exports.createEventRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Event title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Event title must be between 3 and 200 characters'),
    
  body('description')
    .trim()
    .optional(),
    
  body('start_date')
    .trim()
    .notEmpty().withMessage('Start date is required')
    .isDate().withMessage('Start date must be a valid date'),
    
  body('end_date')
    .trim()
    .notEmpty().withMessage('End date is required')
    .isDate().withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.start_date)) {
        throw new Error('End date cannot be before start date');
      }
      return true;
    }),
      
  body('start_time')
    .trim()
    .notEmpty().withMessage('Start time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Start time must be in format HH:MM'),
    
  body('end_time')
    .trim()
    .notEmpty().withMessage('End time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('End time must be in format HH:MM'),
    
  body('venue_id')
    .isInt().withMessage('Venue ID must be an integer')
    .notEmpty().withMessage('Venue is required'),
    
  body('banner_image')
    .optional(),
    
  body('status')
    .trim()
    .isIn(['draft', 'published', 'cancelled', 'completed']).withMessage('Invalid status value')
];

/**
 * Create ticket type validation rules
 */
exports.createTicketTypeRules = [
  body('event_id')
    .isInt().withMessage('Event ID must be an integer')
    .notEmpty().withMessage('Event is required'),
    
  body('name')
    .trim()
    .notEmpty().withMessage('Ticket type name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Ticket type name must be between 2 and 100 characters'),
    
  body('description')
    .trim()
    .optional(),
    
  body('price')
    .isNumeric().withMessage('Price must be a number')
    .custom((value) => {
      if (parseFloat(value) < 0) {
        throw new Error('Price cannot be negative');
      }
      return true;
    }),
    
  body('max_tickets')
    .isInt({ min: 1 }).withMessage('Maximum tickets must be at least 1'),
    
  body('is_active')
    .optional()
    .isBoolean().withMessage('Is active must be a boolean'),
    
  body('start_sale_date')
    .optional()
    .isDate().withMessage('Start sale date must be a valid date'),
    
  body('end_sale_date')
    .optional()
    .isDate().withMessage('End sale date must be a valid date')
    .custom((value, { req }) => {
      if (req.body.start_sale_date && new Date(value) < new Date(req.body.start_sale_date)) {
        throw new Error('End sale date cannot be before start sale date');
      }
      return true;
    })
];

/**
 * Create ticket validation rules
 */
exports.createTicketRules = [
  body('event_id')
    .isInt().withMessage('Event ID must be an integer')
    .notEmpty().withMessage('Event is required'),
    
  body('ticket_type_id')
    .isInt().withMessage('Ticket type ID must be an integer')
    .notEmpty().withMessage('Ticket type is required'),
    
  body('purchaser_name')
    .trim()
    .notEmpty().withMessage('Purchaser name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Purchaser name must be between 2 and 100 characters'),
    
  body('purchaser_email')
    .trim()
    .notEmpty().withMessage('Purchaser email is required')
    .isEmail().withMessage('Please provide a valid email'),
    
  body('purchaser_phone')
    .trim()
    .notEmpty().withMessage('Purchaser phone is required')
    .isMobilePhone().withMessage('Please provide a valid phone number'),
    
  body('quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    
  body('referral_id')
    .optional()
    .isInt().withMessage('Referral ID must be an integer')
];

/**
 * Payment validation rules
 */
exports.paymentRules = [
  body('ticket_id')
    .isInt().withMessage('Ticket ID must be an integer')
    .notEmpty().withMessage('Ticket is required'),
    
  body('payment_method_id')
    .isInt().withMessage('Payment method ID must be an integer')
    .notEmpty().withMessage('Payment method is required'),
    
  body('amount')
    .isNumeric().withMessage('Amount must be a number')
    .custom((value) => {
      if (parseFloat(value) <= 0) {
        throw new Error('Amount must be greater than zero');
      }
      return true;
    })
];

/**
 * User update validation rules
 */
exports.updateUserRules = [
  body('first_name')
    .trim()
    .optional()
    .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    
  body('last_name')
    .trim()
    .optional()
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
    
  body('phone')
    .trim()
    .optional()
    .isMobilePhone().withMessage('Please provide a valid phone number')
    .custom(async (value, { req }) => {
      if (value) {
        const user = await User.findOne({ where: { phone: value, id: { [db.Sequelize.Op.ne]: req.user.id } } });
        if (user) {
          return Promise.reject('Phone number already in use');
        }
      }
      return true;
    }),
    
  body('profile_image')
    .optional()
];

/**
 * Change password validation rules
 */
exports.changePasswordRules = [
  body('current_password')
    .trim()
    .notEmpty().withMessage('Current password is required'),
    
  body('new_password')
    .trim()
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
  body('password_confirm')
    .trim()
    .notEmpty().withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

/**
 * Pagination validation rules
 */
exports.paginationRules = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be at least 1'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

module.exports = exports;