const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

module.exports = {
  app: {
    name: 'Auth App',
    url: process.env.NODE_ENV === 'production' ? 'https://yourapp.com' : `http://localhost:${process.env.PORT || 3000}`,
    env: process.env.NODE_ENV || 'development',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRE || '1d',
    cookieExpire: parseInt(process.env.JWT_COOKIE_EXPIRE) || 1
  },
  
  email: {
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    },
    from: {
      address: process.env.EMAIL_FROM,
      name: process.env.EMAIL_FROM_NAME
    }
  },
  
  paths: {
    avatarUpload: process.env.AVATAR_UPLOAD_PATH || path.join(__dirname, '../public/uploads/avatars')
  },
  
  // OTP configuration
  otp: {
    expiryTimeMinutes: 30,
    length: 6
  }
};