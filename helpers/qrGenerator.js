const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const generateQR = async (data, filename) => {
  try {
    // Create directory if it doesn't exist
    const dir = path.join(__dirname, '../public/uploads/qrcodes');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Generate QR code
    const qrPath = path.join(dir, `${filename}.png`);
    await QRCode.toFile(qrPath, JSON.stringify(data), {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 1
    });
    
    return `/uploads/qrcodes/${filename}.png`;
  } catch (error) {
    console.error('QR generation error:', error);
    throw error;
  }
};

module.exports = { generateQR };