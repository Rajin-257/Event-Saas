/**
 * Authentication Controller
 */
const passport = require('passport');
const jwt = require('jsonwebtoken');
const db = require('../models');
const security = require('../utils/security');
const emailService = require('../services/emailService');
const otpService = require('../services/otpService');
const whatsappService = require('../services/whatsappService');
const logger = require('../utils/logger');

// Models
const User = db.User;
const Role = db.Role;
const Session = db.Session;

/**
 * Register a new user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.register = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already in use'
      });
    }
    
    // Hash password
    const hashedPassword = await security.hashPassword(password);
    
    // Generate verification token
    const verificationToken = security.generateRandomToken();
    
    // Create user
    const user = await User.create({
      first_name,
      last_name,
      email,
      phone,
      password: hashedPassword,
      verification_token: verificationToken,
      is_verified: false,
      status: 'inactive'
    });
    
    // Assign default 'user' role
    const userRole = await Role.findOne({ where: { name: 'user' } });
    if (userRole) {
      await user.addRole(userRole);
    }
    
    // Generate OTP for verification
    const otp = await otpService.generateOTP(user.id, 'verification');
    
    // Send verification email
    await emailService.sendVerificationEmail(email, {
      code: otp.code,
      name: `${first_name} ${last_name}`,
      verificationUrl: `${process.env.APP_URL}/verify-email?token=${verificationToken}`
    });
    
    // Send verification via WhatsApp if phone is provided
    if (phone) {
      try {
        await whatsappService.sendOTP(phone, otp.code, 'verification');
      } catch (error) {
        // Just log the error, don't fail the registration
        logger.error(`Failed to send WhatsApp verification: ${error.message}`);
      }
    }
    
    // Return success response
    res.status(201).json({
      status: 'success',
      message: 'Registration successful. Please verify your email.',
      data: {
        user: security.sanitizeUser(user)
      }
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Registration failed'
    });
  }
};

/**
 * Log in a user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {function} next - Express next function
 * @returns {Promise<void>}
 */
exports.login = (req, res, next) => {
  passport.authenticate('local', { session: false }, async (err, user, info) => {
    try {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: info.message || 'Invalid credentials'
        });
      }
      
      // Check if user is verified
      if (!user.is_verified) {
        return res.status(401).json({
          status: 'error',
          message: 'Account not verified. Please verify your email.',
          requiresVerification: true,
          userId: user.id
        });
      }
      
      // Check if user is active
      if (user.status !== 'active') {
        return res.status(401).json({
          status: 'error',
          message: 'Account is not active. Please contact support.'
        });
      }
      
      // Generate JWT token
      const token = security.generateToken({ id: user.id });
      
      // Create session
      await Session.create({
        id: security.generateRandomToken(),
        user_id: user.id,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        last_activity: new Date(),
        data: JSON.stringify({ browser: req.headers['user-agent'] })
      });
      
      // Update user last login time
      await user.update({
        last_login: new Date(),
        last_activity: new Date()
      });
      
      // Return success response with token
      req.login(user, { session: true }, (err) => {
        if (err) {
          return next(err);
        }
        
        // Successful login
        res.status(200).json({
          status: 'success',
          message: 'Login successful',
          data: {
            user: security.sanitizeUser(user),
            token
          }
        });
      });
    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      return next(error);
    }
  })(req, res, next);
};

/**
 * Log out a user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.logout = async (req, res) => {
  try {
    // Delete session
    if (req.sessionID) {
      await Session.destroy({ where: { id: req.sessionID } });
    }
    
    // Clear session
    req.logout((err) => {
      if (err) {
        return res.status(500).json({
          status: 'error',
          message: 'Error logging out'
        });
      }
      
      req.session.destroy();
      res.clearCookie('connect.sid');
      
      res.status(200).json({
        status: 'success',
        message: 'Logged out successfully'
      });
    });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Error logging out'
    });
  }
};

/**
 * Verify email
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token, code } = req.body;
    
    // Find user by verification token
    const user = await User.findOne({ where: { verification_token: token } });
    
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid verification token'
      });
    }
    
    // Validate OTP
    const isValidOTP = await otpService.validateOTP(code, 'verification', user.id);
    
    if (!isValidOTP) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid verification code'
      });
    }
    
    // Update user
    await user.update({
      is_verified: true,
      verification_token: null,
      status: 'active'
    });
    
    // Return success response
    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully'
    });
  } catch (error) {
    logger.error(`Email verification error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Email verification failed'
    });
  }
};

/**
 * Resend verification email
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Check if already verified
    if (user.is_verified) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already verified'
      });
    }
    
    // Generate new verification token
    const verificationToken = security.generateRandomToken();
    
    // Update user
    await user.update({
      verification_token: verificationToken
    });
    
    // Generate OTP for verification
    const otp = await otpService.generateOTP(user.id, 'verification');
    
    // Send verification email
    await emailService.sendVerificationEmail(email, {
      code: otp.code,
      name: `${user.first_name} ${user.last_name}`,
      verificationUrl: `${process.env.APP_URL}/verify-email?token=${verificationToken}`
    });
    
    // Send verification via WhatsApp if phone is provided
    if (user.phone) {
      try {
        await whatsappService.sendOTP(user.phone, otp.code, 'verification');
      } catch (error) {
        // Just log the error, don't fail the request
        logger.error(`Failed to send WhatsApp verification: ${error.message}`);
      }
    }
    
    // Return success response
    res.status(200).json({
      status: 'success',
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    logger.error(`Resend verification error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to resend verification email'
    });
  }
};

/**
 * Request password reset
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Generate reset token
    const resetToken = security.generateRandomToken();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Token expires in 1 hour
    
    // Update user
    await user.update({
      reset_token: resetToken,
      reset_token_expires: resetExpires
    });
    
    // Generate OTP for password reset
    const otp = await otpService.generateOTP(user.id, 'reset_password');
    
    // Send reset email
    await emailService.sendPasswordResetEmail(email, {
      code: otp.code,
      name: `${user.first_name} ${user.last_name}`,
      resetUrl: `${process.env.APP_URL}/reset-password?token=${resetToken}`
    });
    
    // Send OTP via WhatsApp if phone is provided
    if (user.phone) {
      try {
        await whatsappService.sendOTP(user.phone, otp.code, 'reset_password');
      } catch (error) {
        // Just log the error, don't fail the request
        logger.error(`Failed to send WhatsApp reset OTP: ${error.message}`);
      }
    }
    
    // Return success response
    res.status(200).json({
      status: 'success',
      message: 'Password reset instructions sent to your email'
    });
  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Password reset request failed'
    });
  }
};

/**
 * Reset password
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, code, password } = req.body;
    
    // Find user by reset token
    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expires: {
          [db.Sequelize.Op.gt]: new Date() // Token not expired
        }
      }
    });
    
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired reset token'
      });
    }
    
    // Validate OTP
    const isValidOTP = await otpService.validateOTP(code, 'reset_password', user.id);
    
    if (!isValidOTP) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid reset code'
      });
    }
    
    // Hash new password
    const hashedPassword = await security.hashPassword(password);
    
    // Update user
    await user.update({
      password: hashedPassword,
      reset_token: null,
      reset_token_expires: null
    });
    
    // Return success response
    res.status(200).json({
      status: 'success',
      message: 'Password reset successful'
    });
  } catch (error) {
    logger.error(`Reset password error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Password reset failed'
    });
  }
};

/**
 * Change password
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const userId = req.user.id;
    
    // Get user
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Verify current password
    const isMatch = await security.comparePassword(current_password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const hashedPassword = await security.hashPassword(new_password);
    
    // Update user
    await user.update({
      password: hashedPassword
    });
    
    // Return success response
    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error(`Change password error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Password change failed'
    });
  }
};

/**
 * Get user profile
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user with roles
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'reset_token', 'reset_token_expires', 'verification_token'] },
      include: [
        {
          model: Role,
          through: { attributes: [] }
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Return user profile
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    logger.error(`Get profile error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch profile'
    });
  }
};

/**
 * Update user profile
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, phone } = req.body;
    
    // Get user
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Check if phone is already used by another user
    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({
        where: {
          phone,
          id: { [db.Sequelize.Op.ne]: userId }
        }
      });
      
      if (existingPhone) {
        return res.status(400).json({
          status: 'error',
          message: 'Phone number already in use'
        });
      }
    }
    
    // Prepare update data
    const updateData = {};
    
    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
    if (phone) updateData.phone = phone;
    
    // Handle profile image upload
    if (req.file) {
      updateData.profile_image = req.file.path.replace('public/', '');
    }
    
    // Update user
    await user.update(updateData);
    
    // Return updated user
    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: security.sanitizeUser(user)
      }
    });
  } catch (error) {
    logger.error(`Update profile error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update profile'
    });
  }
};