const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const ensureDirectory = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

const qrService = {
  // Generate QR code as a data URL
  generateQRCode: async (data) => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      
      return qrCodeDataUrl;
    } catch (err) {
      console.error('Error generating QR code:', err);
      throw err;
    }
  },

  // Generate QR code and save as an image file
  generateAndSaveQRCode: async (data, fileName) => {
    try {
      const uploadDir = path.join(__dirname, '../public/uploads/qrcodes');
      ensureDirectory(uploadDir);
      
      const filePath = path.join(uploadDir, `${fileName}.png`);
      
      await QRCode.toFile(filePath, data, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      
      return `/uploads/qrcodes/${fileName}.png`;
    } catch (err) {
      console.error('Error saving QR code:', err);
      throw err;
    }
  },

  // Generate QR code for a ticket
  generateTicketQR: async (ticketNumber) => {
    try {
      // Create a unique file name
      const fileName = `ticket-${ticketNumber}`;
      
      // The data to encode in the QR code (could include more info if needed)
      const qrData = JSON.stringify({
        ticketNumber,
        timestamp: new Date().toISOString()
      });
      
      // Save the QR code as an image
      const qrImagePath = await qrService.generateAndSaveQRCode(qrData, fileName);
      
      return qrImagePath;
    } catch (err) {
      console.error('Error generating ticket QR code:', err);
      throw err;
    }
  }
};

module.exports = qrService;