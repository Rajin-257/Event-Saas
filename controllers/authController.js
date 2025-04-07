const passport = require('passport');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const User = require('../models/User');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');

module.exports = {
  // Render login page
  getLogin: (req, res) => {
    res.render('auth/login', { title: 'Login' });
  },

  // Handle login
  postLogin: (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/dashboard',
      failureRedirect: '/login',
      failureFlash: true
    })(req, res, next);
  },

  // Render register page
  getRegister: (req, res) => {
    res.render('auth/register', { title: 'Register' });
  },

  // Handle registration
  postRegister: async (req, res) => {
    try {
      const { name, email, password, password2, phone, role, referralCode } = req.body;
      
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('auth/register', {
          title: 'Register',
          errors: errors.array(),
          name,
          email,
          phone
        });
      }

      // Check if passwords match
      if (password !== password2) {
        req.flash('error_msg', 'Passwords do not match');
        return res.render('auth/register', {
          title: 'Register',
          name,
          email,
          phone
        });
      }

      // Check if email already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        req.flash('error_msg', 'Email already registered');
        return res.render('auth/register', {
          title: 'Register',
          name,
          phone
        });
      }

      // Check referral code if provided
      let referredBy = null;
      if (referralCode) {
        const referrer = await User.findOne({ where: { referralCode } });
        if (referrer) {
          referredBy = referrer.id;
        }
      }

      // Default role to attendee if not specified or not allowed
      const userRole = role === 'organizer' ? 'organizer' : 'attendee';

      let status = 'active';
      if(userRole=='organizer'){
        status= 'inactive';
      }

      // Create new user
      const newUser = await User.create({
        name,
        email,
        password,
        phone: phone || null,
        role: userRole,
        status:status,
        referredBy
      });

      // Generate email verification token
      const verificationToken = newUser.generateEmailVerificationToken();
      await newUser.save();

      // Create verification URL
      const verificationUrl = `${process.env.BASE_URL}/verify-email/${verificationToken}`;
      
      // Send welcome email with verification link
      try {
        await emailService.sendEmailWithTemplate(
          newUser.email,
          'Welcome to Event Management System',
          'welcome',
          { user: newUser, verificationUrl }
        );
        console.log('Welcome email sent to:', email);
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Continue with registration despite email error
      }
      
      // Send welcome SMS if phone is provided
      if (phone) {
        try {
          await smsService.sendTextMessage(phone, `Welcome to Event Management System, ${name}! Thank you for registering with us. Please verify your email to activate your account.`);
          console.log('Welcome SMS sent to:', phone);
        } catch (smsError) {
          console.error('Error sending welcome SMS:', smsError);
          // Continue with registration despite SMS error
        }
      }

      // Create referral relationship if applicable
      if (referredBy) {
        try {
          const Referral = require('../models/Referral').Referral;
          await Referral.create({
            referrerId: referredBy,
            referredUserId: newUser.id,
            status: 'pending',
            commissionRate: 5.00 // Default 5% commission
          });
          
          // Notify referrer
          const referrer = await User.findByPk(referredBy);
          if (referrer) {
            const referralMessage = `${newUser.name} has registered using your referral code. You'll earn commission when they make purchases.`;
            await emailService.sendEmailWithTemplate(
              referrer.email,
              'New Referral Registration',
              'referral_notification',
              { referrer, newUser }
            );
            
            if (referrer.phone) {
              await smsService.sendTextMessage(referrer.phone, referralMessage);
            }
          }
        } catch (referralError) {
          console.error('Error processing referral:', referralError);
          // Continue despite referral processing error
        }
      }

      req.flash('success_msg', 'Registration successful! Please check your email to verify your account.');
      res.redirect('/login');
    } catch (err) {
      console.error('Registration error:', err);
      req.flash('error_msg', 'An error occurred during registration');
      res.redirect('/register');
    }
  },

  //resend Verification
  resendVerification: async (req, res) => {
    try {
      const email = req.params.email;
      
      if (!email) {
        req.flash('error_msg', 'Email is required to resend verification');
        return res.redirect('/users/profile');
      }
  
      // Find the user by email
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        req.flash('error_msg', 'User not found');
        return res.redirect('/users/profile');
      }
  
      // Check if user is already verified
      if (user.verified) {
        req.flash('error_msg', 'This email is already verified');
        return res.redirect('/users/profile');
      }
  
      // Generate new verification token
      const verificationToken = user.generateEmailVerificationToken();
      await user.save();
  
      // Create verification URL
      const verificationUrl = `${process.env.BASE_URL}/verify-email/${verificationToken}`;
      
      // Send verification email
      try {
        await emailService.sendEmailWithTemplate(
          user.email,
          'Verify Your Email Address',
          'email_verification',
          { user, verificationUrl }
        );
        
        req.flash('success_msg', 'Verification link has been sent to your email address');
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        req.flash('error_msg', 'Failed to send verification email. Please try again later.');
      }
      
      res.redirect('/users/profile');
    } catch (err) {
      console.error('Resend verification error:', err);
      req.flash('error_msg', 'An error occurred while resending verification link');
      res.redirect('/users/profile');
    }
  },

  // Verify email
  verifyEmail: async (req, res) => {
    try {
      const { token } = req.params;
      
      // Find user by verification token
      const user = await User.findOne({
        where: {
          emailVerificationToken: token,
          emailVerificationExpires: { [Op.gt]: new Date() }
        }
      });
      
      if (!user) {
        req.flash('error_msg', 'Email verification token is invalid or has expired');
        return res.redirect('/login');
      }
      
      // Update user as verified
      await user.update({
        verified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      });
      
      req.flash('success_msg', 'Your email has been verified! You can now log in.');
      res.redirect('/login');
    } catch (err) {
      console.error('Email verification error:', err);
      req.flash('error_msg', 'An error occurred during email verification');
      res.redirect('/login');
    }
  },

  // Handle logout
  logout: (req, res) => {
    req.logout(function(err) {
      if (err) {
        console.error('Logout error:', err);
        return next(err);
      }
      req.flash('success_msg', 'You are logged out');
      res.redirect('/login');
    });
  },

  // Render dashboard
  getDashboard: (req, res) => {
    try {
      // Redirect to appropriate dashboard based on user role
      if (req.user.role === 'super_admin') {
        res.redirect('/dashboard/admin');
      } else if (req.user.role === 'organizer') {
        res.redirect('/dashboard/organizer');
      } else {
        res.redirect('/dashboard/attendee');
      }
    } catch (err) {
      console.error('Dashboard redirect error:', err);
      req.flash('error_msg', 'An error occurred');
      res.redirect('/');
    }
  },
  
  // Password reset request
  getPasswordReset: (req, res) => {
    res.render('auth/recoverpw', { title: 'Reset Password' });
  },
  
  // Handle password reset request
  postPasswordReset: async (req, res) => {
    try {
      const { email } = req.body;
      
      // Find user by email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        req.flash('error_msg', 'No account with that email address exists');
        return res.redirect('/password-reset');
      }
      
      // Generate reset token
      const resetToken = user.generatePasswordResetToken();
      await user.save();
      
      // Create reset URL
      const resetUrl = `${process.env.BASE_URL}/password-reset/${resetToken}`;
      
      // Send password reset email
      await emailService.sendEmailWithTemplate(
        user.email,
        'Reset Your Password',
        'password_reset',
        { user, resetToken, resetUrl }
      );
      
      req.flash('success_msg', 'An email has been sent with instructions to reset your password');
      res.redirect('/login');
    } catch (err) {
      console.error('Password reset request error:', err);
      req.flash('error_msg', 'An error occurred during password reset request');
      res.redirect('/password-reset');
    }
  },
  
  // Show password reset form
  getPasswordResetForm: async (req, res) => {
    try {
      const { token } = req.params;

      
      
      // Find user by reset token and check if token is valid
      const user = await User.findOne({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: { [Op.gt]: new Date() }
        }
      });
      
      if (!user) {
        req.flash('error_msg', 'Password reset token is invalid or has expired');
        return res.redirect('/password-reset');
      }
      
      res.render('auth/createpw', {
        title: 'Reset Password',
        token
      });
    } catch (err) {
      console.error('Password reset form error:', err);
      req.flash('error_msg', 'An error occurred');
      res.redirect('/password-reset');
    }
  },
  
  // Handle password reset
  postPasswordResetForm: async (req, res) => {
    try {
      const { token } = req.params;
      const { password, password2 } = req.body;
      
      // Validate passwords
      if (password !== password2) {
        req.flash('error_msg', 'Passwords do not match');
        return res.redirect(`/password-reset/${token}`);
      }
      
      // Find user by reset token and check if token is valid
      const user = await User.findOne({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: { [Op.gt]: new Date() }
        }
      });
      
      if (!user) {
        req.flash('error_msg', 'Password reset token is invalid or has expired');
        return res.redirect('/password-reset');
      }
      
      // Update password and clear reset token
      await user.update({
        password: password, // This will be hashed by User model hook
        resetPasswordToken: null,
        resetPasswordExpires: null
      });
      
      req.flash('success_msg', 'Your password has been updated successfully. You can now log in with your new password');
      res.redirect('/login');
    } catch (err) {
      console.error('Password reset error:', err);
      req.flash('error_msg', 'An error occurred during password reset');
      res.redirect('/password-reset');
    }
  }
};