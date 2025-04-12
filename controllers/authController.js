const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const transporter = require('../config/mail');
const twilioClient = require('../config/twilio');
const { getEmailTemplate } = require('../helpers/emailTemplates');
const logger = require('../utils/logger');
require('dotenv').config();

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Show login page
exports.getLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    messages: req.flash()
  });
};

// Process login
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/auth/login');
    }
    
    // Check if account is active
    if (!user.isActive) {
      req.flash('error', 'Your account has been deactivated');
      return res.redirect('/auth/login');
    }
    
    // Validate password
    const isValidPassword = await user.validatePassword(password);
    
    if (!isValidPassword) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/auth/login');
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate token and set cookie
    const token = generateToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: process.env.NODE_ENV === 'production'
    });
    
    logger.info(`User logged in: ${user.email}`, { userId: user.id });
    
    // Redirect based on role
    if (user.role === 'SuperAdmin' || user.role === 'Admin') {
      return res.redirect('/admin/dashboard');
    } else if (user.role === 'Office Staff' || user.role === 'Ticket Checker') {
      return res.redirect('/staff/dashboard');
    } else {
      return res.redirect('/dashboard');
    }
  } catch (error) {
    logger.error('Login error', { error: error.message });
    req.flash('error', 'An error occurred during login');
    res.redirect('/auth/login');
  }
};

// Show register page
exports.getRegister = (req, res) => {
  res.render('auth/register', {
    title: 'Register',
    messages: req.flash()
  });
};

// Process registration
exports.postRegister = async (req, res) => {
  try {
    const { fullName, email, phone, password, confirmPassword } = req.body;
    
    // Check if passwords match
    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match');
      return res.redirect('/auth/register');
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      req.flash('error', 'Email already in use');
      return res.redirect('/auth/register');
    }
    
    // Check if phone already exists
    const existingPhone = await User.findOne({ where: { phone } });
    
    if (existingPhone) {
      req.flash('error', 'Phone number already in use');
      return res.redirect('/auth/register');
    }
    
    // Create new user
    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      role: 'User'
    });
    
    logger.info(`New user registered: ${email}`, { userId: user.id });
    
    req.flash('success', 'Registration successful! Please login');
    res.redirect('/auth/login');
  } catch (error) {
    logger.error('Registration error', { error: error.message });
    req.flash('error', 'An error occurred during registration');
    res.redirect('/auth/register');
  }
};

// Logout
exports.logout = (req, res) => {
  res.clearCookie('token');
  req.flash('success', 'Logged out successfully');
  res.redirect('/auth/login');
};

// Show forgot password page
exports.getForgotPassword = (req, res) => {
  res.render('auth/forgot-password', {
    title: 'Forgot Password',
    messages: req.flash()
  });
};

// Process forgot password
exports.postForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      req.flash('error', 'Email not found');
      return res.redirect('/auth/forgot-password');
    }
    
    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP in session
    req.session.resetPasswordOTP = {
      email,
      otp,
      expires: Date.now() + 10 * 60 * 1000 // 10 minutes
    };
    
    // Send OTP via email
    const mailOptions = getEmailTemplate('otp_verification', { otp });
    
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: mailOptions.subject,
      html: mailOptions.html
    });
    
    logger.info(`Password reset OTP sent to: ${email}`);
    
    req.flash('success', 'OTP sent to your email');
    res.redirect(`/auth/reset-password?email=${encodeURIComponent(email)}`);
  } catch (error) {
    logger.error('Forgot password error', { error: error.message });
    req.flash('error', 'An error occurred');
    res.redirect('/auth/forgot-password');
  }
};

// Show reset password page
exports.getResetPassword = (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    req.flash('error', 'Email is required');
    return res.redirect('/auth/forgot-password');
  }
  
  res.render('auth/reset-password', {
    title: 'Reset Password',
    email,
    messages: req.flash()
  });
};

// Process reset password
exports.postResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;
    
    // Check if OTP exists and is valid
    if (!req.session.resetPasswordOTP || 
        req.session.resetPasswordOTP.email !== email || 
        req.session.resetPasswordOTP.otp !== otp || 
        req.session.resetPasswordOTP.expires < Date.now()) {
      req.flash('error', 'Invalid or expired OTP');
      return res.redirect(`/auth/reset-password?email=${encodeURIComponent(email)}`);
    }
    
    // Check if passwords match
    if (newPassword !== confirmPassword) {
      req.flash('error', 'Passwords do not match');
      return res.redirect(`/auth/reset-password?email=${encodeURIComponent(email)}`);
    }
    
    // Find user and update password
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/auth/login');
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update user password
    user.password = hashedPassword;
    await user.save();
    
    // Clear OTP from session
    delete req.session.resetPasswordOTP;
    
    logger.info(`Password reset successful for: ${email}`);
    
    req.flash('success', 'Password reset successful. Please login with your new password');
    res.redirect('/auth/login');
  } catch (error) {
    logger.error('Reset password error', { error: error.message });
    req.flash('error', 'An error occurred');
    res.redirect('/auth/forgot-password');
  }
};

// Send OTP for verification
exports.sendOTP = async (req, res) => {
  try {
    const { method, destination } = req.body;
    
    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP in session
    req.session.verificationOTP = {
      destination,
      otp,
      expires: Date.now() + 10 * 60 * 1000 // 10 minutes
    };
    
    if (method === 'email') {
      // Send OTP via email
      const mailOptions = getEmailTemplate('otp_verification', { otp });
      
      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: destination,
        subject: mailOptions.subject,
        html: mailOptions.html
      });
      
      logger.info(`Email OTP sent to: ${destination}`);
    } else if (method === 'whatsapp') {
      // Send OTP via WhatsApp (using Twilio)
      await twilioClient.messages.create({
        body: `Your verification code is: ${otp}`,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${destination}`
      });
      
      logger.info(`WhatsApp OTP sent to: ${destination}`);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid method'
      });
    }
    
    res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${destination}`
    });
  } catch (error) {
    logger.error('OTP send error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
};

// Verify OTP
exports.verifyOTP = (req, res) => {
  try {
    const { destination, otp } = req.body;
    
    // Check if OTP exists and is valid
    if (!req.session.verificationOTP || 
        req.session.verificationOTP.destination !== destination || 
        req.session.verificationOTP.otp !== otp || 
        req.session.verificationOTP.expires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }
    
    // Mark as verified in session
    req.session.isVerified = true;
    
    // Clear OTP from session
    delete req.session.verificationOTP;
    
    logger.info(`OTP verification successful for: ${destination}`);
    
    res.status(200).json({
      success: true,
      message: 'Verification successful'
    });
  } catch (error) {
    logger.error('OTP verification error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'An error occurred during verification'
    });
  }
};