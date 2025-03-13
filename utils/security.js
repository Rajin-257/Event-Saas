/**
 * Security utilities
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
exports.hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a password with a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - Is password correct
 */
exports.comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate a JWT token
 * @param {object} payload - Token payload
 * @param {string} [expiresIn='7d'] - Token expiry
 * @returns {string} - JWT token
 */
exports.generateToken = (payload, expiresIn = process.env.JWT_EXPIRES_IN) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded token or null if invalid
 */
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Generate a random token
 * @param {number} [bytes=20] - Number of bytes
 * @returns {string} - Random token
 */
exports.generateRandomToken = (bytes = 20) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Generate a secure random string (for API keys, etc.)
 * @param {number} [length=32] - Length of string
 * @returns {string} - Random string
 */
exports.generateSecureString = (length = 32) => {
  const buffer = crypto.randomBytes(length);
  return buffer.toString('base64').replace(/[+/=]/g, '').substring(0, length);
};

/**
 * Sanitize user data for responses (remove sensitive fields)
 * @param {object} user - User object
 * @returns {object} - Sanitized user object
 */
exports.sanitizeUser = (user) => {
  const sanitized = { ...user.dataValues };
  
  // Remove sensitive fields
  delete sanitized.password;
  delete sanitized.verification_token;
  delete sanitized.reset_token;
  delete sanitized.reset_token_expires;
  
  return sanitized;
};

/**
 * Generate a random code
 * @param {number} [length=6] - Length of code
 * @param {boolean} [alphanumeric=false] - Include letters
 * @returns {string} - Random code
 */
exports.generateRandomCode = (length = 6, alphanumeric = false) => {
  if (alphanumeric) {
    // Generate alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomBytes = crypto.randomBytes(length);
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(randomBytes[i] % chars.length);
    }
    
    return result;
  } else {
    // Generate numeric code
    const min = 10 ** (length - 1);
    const max = (10 ** length) - 1;
    
    // Generate a random number between min and max
    const buffer = crypto.randomBytes(4);
    const num = buffer.readUInt32BE(0) / 0xffffffff; // Scale to 0-1
    
    return Math.floor(min + num * (max - min + 1)).toString();
  }
};