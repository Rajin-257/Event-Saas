const crypto = require('crypto');
const db = require('../models');
const OTP = db.OTP;
const emailService = require('./emailService');
const whatsappService = require('./whatsappService');
const logger = require('../utils/logger');

/**
 * OTP Service - Handles generation, validation and sending of OTPs
 */
class OtpService {
  /**
   * Generate an OTP for a user
   * @param {number} userId - User ID
   * @param {string} purpose - Purpose of OTP (login, verification, reset_password, ticket_view)
   * @param {number} [ticketId=null] - Ticket ID if applicable
   * @param {number} [length=6] - Length of OTP
   * @param {number} [expiryMinutes=5] - Expiry time in minutes
   * @returns {Promise<object>} - OTP object
   */
  async generateOTP(userId, purpose, ticketId = null, length = 6, expiryMinutes = 5) {
    try {
      // Generate a random OTP
      const code = this.generateRandomCode(length);
      
      // Calculate expiry time
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);
      
      // Create OTP record
      const otp = await OTP.create({
        user_id: userId,
        ticket_id: ticketId,
        code,
        purpose,
        expires_at: expiresAt,
        is_used: false
      });
      
      return otp;
    } catch (error) {
      logger.error(`Error generating OTP: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Generate a random numeric code
   * @param {number} length - Length of code
   * @returns {string} - Random code
   */
  generateRandomCode(length) {
    // Generate a secure random code
    const buffer = crypto.randomBytes(Math.ceil(length / 2));
    const token = parseInt(buffer.toString('hex'), 16).toString().padStart(length, '0').slice(-length);
    return token;
  }
  
  /**
   * Validate an OTP
   * @param {string} code - OTP code
   * @param {string} purpose - Purpose of OTP
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} - Is OTP valid
   */
  async validateOTP(code, purpose, userId) {
    try {
      // Find the OTP record
      const otp = await OTP.findOne({
        where: {
          code,
          purpose,
          user_id: userId,
          is_used: false,
          expires_at: {
            [db.Sequelize.Op.gt]: new Date()
          }
        }
      });
      
      if (!otp) {
        return false;
      }
      
      // Mark OTP as used
      await otp.update({ is_used: true });
      
      return true;
    } catch (error) {
      logger.error(`Error validating OTP: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Send OTP via email
   * @param {string} email - Recipient email
   * @param {string} code - OTP code
   * @param {string} purpose - Purpose of OTP
   * @returns {Promise<void>}
   */
  async sendOTPByEmail(email, code, purpose) {
    try {
      // Prepare email content based on purpose
      let subject, template;
      
      switch (purpose) {
        case 'verification':
          subject = 'Email Verification Code';
          template = 'verification_otp';
          break;
        case 'reset_password':
          subject = 'Password Reset Code';
          template = 'reset_password_otp';
          break;
        case 'login':
          subject = 'Login Verification Code';
          template = 'login_otp';
          break;
        case 'ticket_view':
          subject = 'Ticket Verification Code';
          template = 'ticket_otp';
          break;
        default:
          subject = 'One-Time Password';
          template = 'generic_otp';
      }
      
      // Send email with OTP
      await emailService.sendEmail(email, subject, template, { code });
    } catch (error) {
      logger.error(`Error sending OTP by email: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Send OTP via WhatsApp
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} code - OTP code
   * @param {string} purpose - Purpose of OTP
   * @returns {Promise<void>}
   */
  async sendOTPByWhatsApp(phoneNumber, code, purpose) {
    try {
      // Prepare message based on purpose
      let message;
      
      switch (purpose) {
        case 'verification':
          message = `Your verification code is: ${code}. It will expire in 5 minutes.`;
          break;
        case 'reset_password':
          message = `Your password reset code is: ${code}. It will expire in 5 minutes.`;
          break;
        case 'login':
          message = `Your login verification code is: ${code}. It will expire in 5 minutes.`;
          break;
        case 'ticket_view':
          message = `Your ticket verification code is: ${code}. It will expire in 5 minutes.`;
          break;
        default:
          message = `Your one-time password is: ${code}. It will expire in 5 minutes.`;
      }
      
      // Send WhatsApp message with OTP
      await whatsappService.sendMessage(phoneNumber, message);
    } catch (error) {
      logger.error(`Error sending OTP by WhatsApp: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new OtpService();