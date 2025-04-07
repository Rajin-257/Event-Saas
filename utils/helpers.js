const moment = require('moment');
const crypto = require('crypto');

/**
 * Helper functions for common operations
 */
module.exports = {
  // Format date for display
  formatDate: (date, format = 'YYYY-MM-DD') => {
    return moment(date).format(format);
  },

  // Format time for display
  formatTime: (date, format = 'hh:mm A') => {
    return moment(date).format(format);
  },

  // Format currency for display
  formatCurrency: (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  // Calculate date difference in days
  dateDiff: (startDate, endDate) => {
    const start = moment(startDate);
    const end = moment(endDate);
    return end.diff(start, 'days');
  },

  // Check if a date is in the past
  isPastDate: (date) => {
    return moment(date).isBefore(moment(), 'day');
  },

  // Check if a date is in the future
  isFutureDate: (date) => {
    return moment(date).isAfter(moment(), 'day');
  },

  // Check if a date is today
  isToday: (date) => {
    return moment(date).isSame(moment(), 'day');
  },

  // Format phone number for display
  formatPhone: (phone) => {
    if (!phone) return '';
    // Replace all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    // Format according to length
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11) {
      return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  },

  // Generate a random string
  generateRandomString: (length = 8) => {
    return crypto.randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length)
      .toUpperCase();
  },

  // Generate an OTP (One Time Password)
  generateOTP: (length = 6) => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  },

  // Generate a unique transaction ID
  generateTransactionId: (prefix = 'TXN') => {
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${timestamp}-${random}`;
  },

  // Generate a unique reference number
  generateReferenceNumber: (prefix = 'REF') => {
    const timestamp = moment().format('YYMMDD');
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `${prefix}${timestamp}${random}`;
  },

  // Calculate commission based on amount and rate
  calculateCommission: (amount, rate) => {
    return (parseFloat(amount) * parseFloat(rate)) / 100;
  },

  // Truncate text with ellipsis
  truncateText: (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },

  // Convert HTML to plain text (for emails)
  htmlToPlainText: (html) => {
    return html
      .replace(/<style[^>]*>.*<\/style>/g, '')
      .replace(/<script[^>]*>.*<\/script>/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  },

  // Calculate event duration in hours
  calculateEventDuration: (startDate, endDate) => {
    const start = moment(startDate);
    const end = moment(endDate);
    return end.diff(start, 'hours', true);
  },

  // Get event status based on dates
  getEventStatus: (startDate, endDate) => {
    const now = moment();
    const start = moment(startDate);
    const end = moment(endDate);

    if (now.isBefore(start)) {
      return 'upcoming';
    } else if (now.isAfter(start) && now.isBefore(end)) {
      return 'ongoing';
    } else {
      return 'completed';
    }
  },
  
  // Group array of objects by a specific key
  groupBy: (array, key) => {
    return array.reduce((result, item) => {
      const groupKey = item[key];
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    }, {});
  },
  
  // Calculate ticket availability percentage
  calculateAvailability: (available, total) => {
    if (total === 0) return 0;
    return Math.round((available / total) * 100);
  }
};