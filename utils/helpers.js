/**
 * Helper utilities
 */
const moment = require('moment');

/**
 * Format date
 * @param {Date|string} date - Date to format
 * @param {string} [format='YYYY-MM-DD'] - Format string
 * @returns {string} - Formatted date
 */
exports.formatDate = (date, format = 'YYYY-MM-DD') => {
  return moment(date).format(format);
};

/**
 * Format time
 * @param {Date|string} time - Time to format
 * @param {string} [format='HH:mm'] - Format string
 * @returns {string} - Formatted time
 */
exports.formatTime = (time, format = 'HH:mm') => {
  return moment(time, 'HH:mm:ss').format(format);
};

/**
 * Format datetime
 * @param {Date|string} datetime - Datetime to format
 * @param {string} [format='YYYY-MM-DD HH:mm'] - Format string
 * @returns {string} - Formatted datetime
 */
exports.formatDateTime = (datetime, format = 'YYYY-MM-DD HH:mm') => {
  return moment(datetime).format(format);
};

/**
 * Calculate time difference in days
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {number} - Difference in days
 */
exports.daysDifference = (date1, date2) => {
  return moment(date1).diff(moment(date2), 'days');
};

/**
 * Check if a date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} - Is date in past
 */
exports.isDatePast = (date) => {
  return moment(date).isBefore(moment(), 'day');
};

/**
 * Check if a date is in the future
 * @param {Date|string} date - Date to check
 * @returns {boolean} - Is date in future
 */
exports.isDateFuture = (date) => {
  return moment(date).isAfter(moment(), 'day');
};

/**
 * Check if a date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} - Is date today
 */
exports.isDateToday = (date) => {
  return moment(date).isSame(moment(), 'day');
};

/**
 * Calculate pagination metadata
 * @param {number} total - Total number of items
 * @param {number} limit - Items per page
 * @param {number} page - Current page
 * @returns {object} - Pagination metadata
 */
exports.getPaginationMetadata = (total, limit, page) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    limit,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null
  };
};

/**
 * Generate pagination options for Sequelize queries
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {object} - Sequelize pagination options
 */
exports.getPaginationOptions = (page, limit) => {
  return {
    offset: (page - 1) * limit,
    limit
  };
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} [currency='BDT'] - Currency code
 * @returns {string} - Formatted currency
 */
exports.formatCurrency = (amount, currency = 'BDT') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

/**
 * Generate random string
 * @param {number} [length=10] - Length of string
 * @returns {string} - Random string
 */
exports.generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Parse query parameters for pagination
 * @param {object} query - Query parameters
 * @param {number} [defaultLimit=10] - Default limit
 * @param {number} [maxLimit=100] - Maximum limit
 * @returns {object} - Parsed pagination parameters
 */
exports.parsePaginationQuery = (query, defaultLimit = 10, maxLimit = 100) => {
  let page = parseInt(query.page) || 1;
  let limit = parseInt(query.limit) || defaultLimit;
  
  // Ensure page is at least 1
  page = Math.max(1, page);
  
  // Ensure limit is within bounds
  limit = Math.min(Math.max(1, limit), maxLimit);
  
  return { page, limit };
};

/**
 * Generate slug from string
 * @param {string} text - Text to generate slug from
 * @returns {string} - Generated slug
 */
exports.generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

/**
 * Extract error messages from Sequelize validation errors
 * @param {Error} err - Sequelize error
 * @returns {object} - Extracted error messages
 */
exports.extractSequelizeErrors = (err) => {
  const errors = {};
  
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    err.errors.forEach((error) => {
      errors[error.path] = error.message;
    });
  }
  
  return errors;
};