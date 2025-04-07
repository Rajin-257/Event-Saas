const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('super_admin', 'organizer', 'attendee'),
    defaultValue: 'attendee'
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  walletBalance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  referralCode: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  referredBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'blocked'),
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  emailVerificationToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emailVerificationExpires: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      
      // Generate unique referral code
      user.referralCode = user.name.substring(0, 3).toUpperCase() + 
        Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Method to validate password
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Generate password reset token
User.prototype.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomUUID();
  const resetExpires = new Date(Date.now() + 3600000); // 1 hour
  
  this.resetPasswordToken = resetToken;
  this.resetPasswordExpires = resetExpires;
  
  return resetToken;
};

// Generate email verification token
User.prototype.generateEmailVerificationToken = function() {
  const crypto = require('crypto');
  const verificationToken = crypto.randomUUID();
  const verificationExpires = new Date(Date.now() + 24 * 3600000); // 24 hours
  
  this.emailVerificationToken = verificationToken;
  this.emailVerificationExpires = verificationExpires;
  
  return verificationToken;
};

module.exports = User;