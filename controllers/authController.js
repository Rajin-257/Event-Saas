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
const userRole = require('../models/userRole');

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
      req.flash('error', 'Email already in use');
      return res.render('auth/register', {
        messages: req.flash()
      });
    }

    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      req.flash('error', 'Phone number already in use');
      return res.render('auth/register', {
        messages: req.flash()
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
    req.flash('success', 'Registration successful. Please verify your email.');
    return res.render('auth/login', {
      messages: req.flash(),
      user: security.sanitizeUser(user)
    });

  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    req.flash('error', 'Error 500.Registration failed');
    return res.render('auth/register', {
      messages: req.flash()
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
        req.flash('error', 'Invalid credentials');
        return res.render('auth/login', {
          messages: req.flash()
        });
      }
      
      // Check if user is verified
      if (!user.is_verified) {
        req.flash('error', 'Account not verified. Please verify your email.');
        return res.render('auth/login', {
          messages: req.flash(),
          requiresVerification: true,
          userId: user.id
        });
      }
      
      // Check if user is active
      if (user.status !== 'active') {
        req.flash('error', 'Account is not active. Please contact support.');
        return res.render('auth/login', {
          messages: req.flash()
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
      
      // Login user
      req.login(user, { session: true }, async (err) => {
        if (err) {
          return next(err);
        }
        
        // Get user roles to determine the dashboard
        const userWithRoles = await User.findByPk(user.id, {
          include: [{
            model: Role,
            through: { attributes: [] }
          }]
        });
        
        // Determine which dashboard to show based on role
        let dashboardRoute = '/dashboard';
        
        // Check if user has roles and redirect accordingly
        if (userWithRoles && userWithRoles.Roles && userWithRoles.Roles.length > 0) {
          const roles = userWithRoles.Roles.map(role => role.name);
          
          if (roles.includes('admin')) {
            dashboardRoute = '/admin/dashboard';
          } else if (roles.includes('manager')) {
            dashboardRoute = '/manager/dashboard';
          } else if (roles.includes('organizer')) {
            dashboardRoute = '/organizer/dashboard';
          }
          // Add more role-based redirects as needed
        }
        
        return res.redirect(dashboardRoute);
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
    // Delete session from database if using a custom Session model
    if (req.sessionID) {
      try {
        await Session.destroy({ where: { id: req.sessionID } });
      } catch (err) {
        logger.warn(`Session deletion warning: ${err.message}`);
        // Continue with logout even if this fails
      }
    }
    
    // Modern way to handle logout in Passport.js
    req.logout(function(err) {
      if (err) {
        logger.error(`Logout error: ${err.message}`);
        req.flash('error', 'Error logging out');
        return res.redirect('/dashboard');
      }
      
      // Destroy the session after successful logout
      req.session.destroy(function(err) {
        if (err) {
          logger.error(`Session destruction error: ${err.message}`);
        }
        
        // Clear the cookie regardless
        res.clearCookie('connect.sid');
        
        // Redirect with flash message
        return res.render('auth/login', {
          messages: { success: ['Logged out successfully'] }
        });
      });
    });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    req.flash('error', 'Error logging out');
    return res.render('auth/login', {
      messages: req.flash()
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
      req.flash('error', 'Invalid verification token');
      return res.render('auth/verify-email', {
        messages: req.flash()
      });
    }
    
    // Validate OTP
    const isValidOTP = await otpService.validateOTP(code, 'verification', user.id);
    
    if (!isValidOTP) {
      req.flash('error', 'Invalid verification code');
      return res.render('auth/verify-email', {
        messages: req.flash()
      });
    }
    
    // Update user
    await user.update({
      is_verified: true,
      verification_token: null,
      status: 'active'
    });
    
    // Return success response
    req.flash('success', 'Email verified successfully');
    return res.render('auth/login', {
      messages: req.flash()
    });
  } catch (error) {
    logger.error(`Email verification error: ${error.message}`);
    req.flash('error', 'Email verification failed');
    return res.render('auth/verify-email', {
      messages: req.flash()
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
      req.flash('error', 'User not found');
      return res.render('auth/register', {
        messages: req.flash()
      });
    }
    
    // Check if already verified
    if (user.is_verified) {
      req.flash('error', 'Email already verified');
      return res.render('auth/login', {
        messages: req.flash()
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
    req.flash('success', 'Verification email sent successfully');
    return res.render('auth/login', {
      messages: req.flash()
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
    req.flash('success', 'Password reset instructions sent to your email');
    return res.render('auth/login', {
      messages: req.flash()
    });
  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`);
    req.flash('error', 'Password reset request failed');
    return res.render('auth/forgot-password', {
      messages: req.flash()
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
      req.flash('error', 'Invalid or expired reset token');
      return res.render('auth/forgot-password', {
        messages: req.flash(),
      });
    }
    
    // Validate OTP
    const isValidOTP = await otpService.validateOTP(code, 'reset_password', user.id);
    
    if (!isValidOTP) {
      req.flash('error', 'Invalid reset code');
      return res.render('auth/forgot-password', {
        messages: req.flash(),
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
    req.flash('success', 'Password reset successful');
    return res.render('auth/login', {
      messages: req.flash()
    });
  } catch (error) {
    logger.error(`Reset password error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Server 500! Password reset failed'
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
    
    res.render('users/profile', {
      messages: req.flash()
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