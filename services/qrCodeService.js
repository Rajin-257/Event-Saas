/**
 * QR Code service
 */
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class QRCodeService {
  /**
   * Generate a QR code as data URL
   * @param {string} data - Data to encode
   * @param {object} [options={}] - QR code options
   * @returns {Promise<string>} - Data URL of QR code
   */
  async generateDataURL(data, options = {}) {
    try {
      // Default options
      const defaultOptions = {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      };
      
      // Merge options
      const mergedOptions = { ...defaultOptions, ...options };
      
      // Generate QR code
      return await QRCode.toDataURL(data, mergedOptions);
    } catch (error) {
      logger.error(`Error generating QR code data URL: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Generate a QR code and save to file
   * @param {string} data - Data to encode
   * @param {string} filePath - Path to save QR code
   * @param {object} [options={}] - QR code options
   * @returns {Promise<string>} - Path to saved QR code
   */
  async generateToFile(data, filePath, options = {}) {
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Default options
      const defaultOptions = {
        errorCorrectionLevel: 'H',
        type: 'png',
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      };
      
      // Merge options
      const mergedOptions = { ...defaultOptions, ...options };
      
      // Generate QR code
      await QRCode.toFile(filePath, data, mergedOptions);
      
      return filePath;
    } catch (error) {
      logger.error(`Error generating QR code file: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Generate a QR code as a string (ASCII)
   * @param {string} data - Data to encode
   * @param {object} [options={}] - QR code options
   * @returns {Promise<string>} - ASCII representation of QR code
   */
  async generateString(data, options = {}) {
    try {
      // Generate QR code
      return await QRCode.toString(data, options);
    } catch (error) {
      logger.error(`Error generating QR code string: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Generate a QR code for a ticket
   * @param {object} ticket - Ticket object
   * @param {string} [type='dataURL'] - Output type (dataURL, file, string)
   * @param {string} [filePath=null] - Path to save QR code (if type is 'file')
   * @returns {Promise<string>} - QR code output
   */
  async generateTicketQR(ticket, type = 'dataURL', filePath = null) {
    try {
      // Create ticket data to encode
      const ticketData = JSON.stringify({
        id: ticket.id,
        code: ticket.ticket_code,
        event: ticket.event_id,
        type: ticket.ticket_type_id,
        timestamp: Date.now()
      });
      
      // Generate QR code based on type
      if (type === 'file' && filePath) {
        return this.generateToFile(ticketData, filePath);
      } else if (type === 'string') {
        return this.generateString(ticketData);
      } else {
        return this.generateDataURL(ticketData);
      }
    } catch (error) {
      logger.error(`Error generating ticket QR code: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Verify a ticket QR code
   * @param {string} qrData - QR code data
   * @returns {object} - Decoded ticket data
   */
  verifyTicketQR(qrData) {
    try {
      // Parse QR data
      const ticketData = JSON.parse(qrData);
      
      // Simple validation
      if (!ticketData.id || !ticketData.code || !ticketData.event) {
        throw new Error('Invalid QR code format');
      }
      
      return ticketData;
    } catch (error) {
      logger.error(`Error verifying ticket QR code: ${error.message}`);
      throw new Error('Invalid QR code');
    }
  }
}

// Export singleton instance
module.exports = new QRCodeService();