const User = require('../models/User');
const Referral = require('../models/Referral');
const Booking = require('../models/Booking');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    
    res.render('users/index', {
      title: 'All Users',
      users,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error fetching users', { error: error.message });
    req.flash('error', 'Failed to fetch users');
    res.redirect('/dashboard');
  }
};

// Show user profile
exports.getUserProfile = async (req, res) => {
  try {
    // If viewing own profile or admin viewing someone else's profile
    const userId = req.params.id || req.user.id;
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/dashboard');
    }
    
    // Get referral code if exists
    const referral = await Referral.findOne({
      where: { userId }
    });
    
    // Get recent bookings
    const bookings = await Booking.findAll({
      where: { userId },
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Event, as: 'event' },
        { model: Ticket, as: 'ticket' }
      ]
    });
    
    res.render('users/profile', {
      title: 'User Profile',
      user,
      referral,
      bookings,
      isOwnProfile: userId == req.user.id,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error fetching user profile', { error: error.message });
    req.flash('error', 'Failed to fetch user profile');
    res.redirect('/dashboard');
  }
};

// Show edit profile form
exports.getEditProfile = async (req, res) => {
  try {
    res.render('users/edit-profile', {
      title: 'Edit Profile',
      user: req.user,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error loading edit profile page', { error: error.message });
    req.flash('error', 'Failed to load edit profile page');
    res.redirect('/users/profile');
  }
};

// Update user profile
exports.postUpdateProfile = async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    
    // Check if phone is already in use by another user
    if (phone !== req.user.phone) {
      const existingPhone = await User.findOne({
        where: {
          phone,
          id: { [Op.ne]: req.user.id }
        }
      });
      
      if (existingPhone) {
        req.flash('error', 'Phone number already in use');
        return res.redirect('/users/edit-profile');
      }
    }
    
    // Update user
    req.user.fullName = fullName;
    req.user.phone = phone;
    
    if (req.file) {
      req.user.profileImage = `/uploads/profiles/${req.file.filename}`;
    }
    
    await req.user.save();
    
    logger.info(`Profile updated for user: ${req.user.id}`);
    
    req.flash('success', 'Profile updated successfully');
    res.redirect('/users/profile');
  } catch (error) {
    logger.error('Profile update error', { error: error.message });
    req.flash('error', 'Failed to update profile');
    res.redirect('/users/edit-profile');
  }
};

// Show change password form
exports.getChangePassword = async (req, res) => {
  try {
    res.render('users/change-password', {
      title: 'Change Password',
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error loading change password page', { error: error.message });
    req.flash('error', 'Failed to load change password page');
    res.redirect('/users/profile');
  }
};

// Update password
exports.postChangePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, req.user.password);
    
    if (!isMatch) {
      req.flash('error', 'Current password is incorrect');
      return res.redirect('/users/change-password');
    }
    
    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      req.flash('error', 'New passwords do not match');
      return res.redirect('/users/change-password');
    }
    
    // Update password
    const salt = await bcrypt.genSalt(10);
    req.user.password = await bcrypt.hash(newPassword, salt);
    
    await req.user.save();
    
    logger.info(`Password changed for user: ${req.user.id}`);
    
    req.flash('success', 'Password changed successfully');
    res.redirect('/users/profile');
  } catch (error) {
    logger.error('Password change error', { error: error.message });
    req.flash('error', 'Failed to change password');
    res.redirect('/users/change-password');
  }
};

// Admin: Create new user
exports.getCreateUser = async (req, res) => {
  try {
    res.render('users/create', {
      title: 'Create User',
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error loading create user page', { error: error.message });
    req.flash('error', 'Failed to load create user page');
    res.redirect('/users');
  }
};

// Admin: Process user creation
exports.postCreateUser = async (req, res) => {
  try {
    const { fullName, email, phone, password, role } = req.body;
    
    // Check if email exists
    const existingEmail = await User.findOne({ where: { email } });
    
    if (existingEmail) {
      req.flash('error', 'Email already in use');
      return res.redirect('/users/create');
    }
    
    // Check if phone exists
    const existingPhone = await User.findOne({ where: { phone } });
    
    if (existingPhone) {
      req.flash('error', 'Phone number already in use');
      return res.redirect('/users/create');
    }
    
    // Create user
    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      role,
      profileImage: req.file ? `/uploads/profiles/${req.file.filename}` : null
    });
    
    logger.info(`User created: ${email}`, { userId: req.user.id, createdUserId: user.id });
    
    req.flash('success', 'User created successfully');
    res.redirect('/users');
  } catch (error) {
    logger.error('User creation error', { error: error.message });
    req.flash('error', 'Failed to create user');
    res.redirect('/users/create');
  }
};

// Admin: Toggle user status (activate/deactivate)
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deactivating self
    if (id == req.user.id) {
      req.flash('error', 'You cannot deactivate your own account');
      return res.redirect('/users');
    }
    
    const user = await User.findByPk(id);
    
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/users');
    }
    
    // Toggle status
    user.isActive = !user.isActive;
    await user.save();
    
    const action = user.isActive ? 'activated' : 'deactivated';
    logger.info(`User ${action}: ${user.email}`, { userId: req.user.id, targetUserId: id });
    
    req.flash('success', `User ${action} successfully`);
    res.redirect('/users');
  } catch (error) {
    logger.error('User status toggle error', { error: error.message });
    req.flash('error', 'Failed to update user status');
    res.redirect('/users');
  }
};

// Get user referral
exports.getUserReferral = async (req, res) => {
  try {
    // Check if user already has a referral code
    let referral = await Referral.findOne({
      where: { userId: req.user.id }
    });
    
    if (!referral) {
      // Generate a unique referral code
      const code = crypto.randomBytes(3).toString('hex').toUpperCase();
      
      // Create referral
      referral = await Referral.create({
        userId: req.user.id,
        code,
        commissionPercentage: 5.00 // Default 5%
      });
    }
    
    // Get referral stats
    const totalCommission = await Booking.sum('totalAmount', {
      where: {
        referralCode: referral.code,
        status: 'Confirmed',
        paymentStatus: 'Paid'
      }
    }) * (referral.commissionPercentage / 100);
    
    const referralCount = await Booking.count({
      where: {
        referralCode: referral.code,
        status: 'Confirmed'
      }
    });
    
    res.render('users/referral', {
      title: 'My Referral',
      referral,
      stats: {
        totalCommission: totalCommission || 0,
        referralCount
      },
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error fetching referral info', { error: error.message });
    req.flash('error', 'Failed to fetch referral information');
    res.redirect('/users/profile');
  }
};