/**
 * Email service
 */
const nodemailer = require('nodemailer');
const emailConfig = require('../config/email');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    // Create transporter with SMTP config
    this.transporter = nodemailer.createTransport(emailConfig.smtp);
    
    // Verify connection
    this.transporter.verify((error) => {
      if (error) {
        logger.error(`Email service error: ${error.message}`);
      } else {
        logger.info('Email service is ready to send messages');
      }
    });
  }
  
  /**
   * Send an email
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} template - Template name
   * @param {object} [data={}] - Template data
   * @returns {Promise<object>} - Send result
   */
  async sendEmail(to, subject, template, data = {}) {
    try {
      // Get template from config
      const templateConfig = emailConfig.templates[template] || {
        text: 'No template found',
        html: '<p>No template found</p>'
      };
      
      // Replace placeholders in template with data
      let text = templateConfig.text;
      let html = templateConfig.html;
      
      // Replace placeholders with data values
      Object.keys(data).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        text = text.replace(regex, data[key]);
        html = html.replace(regex, data[key]);
      });
      
      // Prepare email options
      const mailOptions = {
        from: emailConfig.from,
        to,
        subject: subject || templateConfig.subject,
        text,
        html
      };
      
      // Send email
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error(`Error sending email: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Send welcome email
   * @param {string} to - Recipient email
   * @param {object} data - Email data
   * @returns {Promise<object>} - Send result
   */
  async sendWelcomeEmail(to, data) {
    return this.sendEmail(
      to,
      'Welcome to Event Management System',
      'welcome',
      data
    );
  }
  
  /**
   * Send password reset email
   * @param {string} to - Recipient email
   * @param {object} data - Email data
   * @returns {Promise<object>} - Send result
   */
  async sendPasswordResetEmail(to, data) {
    return this.sendEmail(
      to,
      'Reset Your Password',
      'reset_password_otp',
      data
    );
  }
  
  /**
   * Send verification code email
   * @param {string} to - Recipient email
   * @param {object} data - Email data
   * @returns {Promise<object>} - Send result
   */
  async sendVerificationEmail(to, data) {
    return this.sendEmail(
      to,
      'Verify Your Email Address',
      'verification_otp',
      data
    );
  }
  
  /**
   * Send ticket confirmation email
   * @param {string} to - Recipient email
   * @param {object} data - Email data
   * @returns {Promise<object>} - Send result
   */
  async sendTicketConfirmationEmail(to, data) {
    return this.sendEmail(
      to,
      'Your Ticket Confirmation',
      'ticket_confirmation',
      data
    );
  }
}

// Export singleton instance
module.exports = new EmailService();