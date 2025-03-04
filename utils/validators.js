/**
 * Common validation helpers
 */

// Email validation regex
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// Validate email
exports.isValidEmail = (email) => {
  return emailRegex.test(String(email).toLowerCase());
};

// Validate password strength
exports.isStrongPassword = (password) => {
  // At least 6 characters
  if (password.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters long'
    };
  }
  
  // Check for uppercase
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter'
    };
  }
  
  // Check for lowercase
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter'
    };
  }
  
  // Check for numbers
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number'
    };
  }
  
  return {
    isValid: true,
    message: 'Password is strong'
  };
};

// Validate mobile number
exports.isValidMobile = (mobile) => {
  // Allow only digits, optional + at the beginning
  // Length between 10 and 15 characters
  const mobileRegex = /^\+?[0-9]{10,15}$/;
  return mobileRegex.test(mobile);
};

// Check if string contains only alphanumeric characters and spaces
exports.isAlphanumeric = (str) => {
  const alphanumericRegex = /^[a-zA-Z0-9\s]*$/;
  return alphanumericRegex.test(str);
};

// Check if string is a valid URL
exports.isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// Check if value is a valid date
exports.isValidDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

// Check if file is an image
exports.isImage = (mimeType) => {
  const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  return imageMimeTypes.includes(mimeType);
};

// Calculate password strength score (0-100)
exports.getPasswordStrength = (password) => {
  if (!password) return 0;
  
  let score = 0;
  
  // Basic length check
  if (password.length >= 6) score += 20;
  if (password.length >= 10) score += 10;
  
  // Character variety checks
  if (/[A-Z]/.test(password)) score += 10;
  if (/[a-z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^A-Za-z0-9]/.test(password)) score += 20;
  
  // Additional complexity checks
  if (/[A-Z].*[A-Z]/.test(password)) score += 5;
  if (/[a-z].*[a-z]/.test(password)) score += 5;
  if (/[0-9].*[0-9]/.test(password)) score += 5;
  if (/[^A-Za-z0-9].*[^A-Za-z0-9]/.test(password)) score += 5;
  
  // Limit score to 100
  return Math.min(100, score);
};