/**
 * WhatsApp service
 */
const axios = require('axios');
const whatsappConfig = require('../config/whatsapp');
const logger = require('../utils/logger');

class WhatsAppService {
  constructor() {
    this.apiKey = whatsappConfig.apiKey;
    this.phoneNumber = whatsappConfig.phoneNumber;
    this.templates = whatsappConfig.templates;
    
    // Check for API key
    if (!this.apiKey) {
      logger.warn('WhatsApp API key not set. WhatsApp messaging will not work.');
    }
  }
  
  /**
   * Send a WhatsApp message
   * @param {string} to - Recipient phone number
   * @param {string} message - Message text
   * @returns {Promise<object>} - Send result
   */
  async sendMessage(to, message) {
    try {
      // Check if API key is set
      if (!this.apiKey) {
        throw new Error('WhatsApp API key not set');
      }
      
      // Format phone number (remove any non-digit characters)
      const formattedNumber = to.replace(/[^\d+]/g, '');
      
      // This is a placeholder for the actual API integration
      // In a real application, you would use the API of your WhatsApp provider
      
      // For demonstration purposes, we'll log the message and simulate a response
      logger.info(`WhatsApp message to ${formattedNumber}: ${message}`);
      
      // Simulated API call
      /* 
      const response = await axios.post('https://your-whatsapp-api-provider.com/send', {
        apiKey: this.apiKey,
        from: this.phoneNumber,
        to: formattedNumber,
        message
      });
      
      return response.data;
      */
      
      // Return simulated success response
      return {
        success: true,
        messageId: `whatsapp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        to: formattedNumber
      };
    } catch (error) {
      logger.error(`Error sending WhatsApp message: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Send a message using a template
   * @param {string} to - Recipient phone number
   * @param {string} templateName - Template name
   * @param {object} data - Template data
   * @returns {Promise<object>} - Send result
   */
  async sendTemplateMessage(to, templateName, data = {}) {
    try {
      // Get template from config
      const template = this.templates[templateName];
      
      if (!template) {
        throw new Error(`Template "${templateName}" not found`);
      }
      
      // Replace placeholders with data values
      let message = template;
      Object.keys(data).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        message = message.replace(regex, data[key]);
      });
      
      // Send message
      return this.sendMessage(to, message);
    } catch (error) {
      logger.error(`Error sending WhatsApp template message: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Send OTP message
   * @param {string} to - Recipient phone number
   * @param {string} code - OTP code
   * @param {string} purpose - OTP purpose
   * @returns {Promise<object>} - Send result
   */
  async sendOTP(to, code, purpose) {
    // Map purpose to template name
    const templateMap = {
      verification: 'verification_otp',
      reset_password: 'reset_password_otp',
      login: 'login_otp',
      ticket_view: 'ticket_otp'
    };
    
    const templateName = templateMap[purpose] || 'verification_otp';
    
    // Send template message
    return this.sendTemplateMessage(to, templateName, { code });
  }
  
  /**
   * Send welcome message
   * @param {string} to - Recipient phone number
   * @param {string} name - User's name
   * @returns {Promise<object>} - Send result
   */
  async sendWelcomeMessage(to, name) {
    return this.sendTemplateMessage(to, 'welcome', { name });
  }
  
  /**
   * Send ticket confirmation message
   * @param {string} to - Recipient phone number
   * @param {object} data - Ticket data
   * @returns {Promise<object>} - Send result
   */
  async sendTicketConfirmationMessage(to, data) {
    return this.sendTemplateMessage(to, 'ticket_confirmation', data);
  }
}

// Export singleton instance
module.exports = new WhatsAppService();