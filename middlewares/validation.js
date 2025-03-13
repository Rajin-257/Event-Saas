/**
 * Validation middleware
 */
const { body ,validationResult } = require('express-validator');
const logger = require('../utils/logger');

const { body, param, query, validationResult } = require('express-validator');

/**
 * Validate request data
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {function} next - Express next function
 * @returns {void}
 */
module.exports = {
  body,
  param,
  query,
  validate: (req, res, next) => {
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }
    
    // Format errors for response
    const extractedErrors = {};
    errors.array().forEach(err => {
      extractedErrors[err.param] = err.msg;
    });
    
    // Check if it's an API request
    if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
      return res.status(422).json({
        status: 'error',
        message: 'Validation failed',
        errors: extractedErrors
      });
    }
    
    // If it's a web form submission, redirect with flash message
    req.flash('error_msg', 'Please fix the errors in the form');
    req.flash('form_errors', extractedErrors);
    req.flash('form_data', req.body); // Save form data for repopulation
    
    // Redirect back or to specified URL
    return res.redirect(req.body.redirect_url || req.header('Referer') || '/');
  }
};