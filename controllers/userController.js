const User = require('../models/User');
const { Referral } = require('../models/Referral');
const { Ticket } = require('../models/Ticket');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

module.exports = {
  // Get user profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id);
      
      res.render('users/profile', {
        title: 'My Profile',
        user
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      req.flash('error_msg', 'Error loading profile');
      res.redirect('/dashboard');
    }
  },

  // Update profile
  updateProfile: async (req, res) => {
    try {
      const { name, email, phone } = req.body;
      
      // Validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('users/profile', {
          title: 'My Profile',
          user: { ...req.user, name, email, phone },
          errors: errors.array()
        });
      }

      // Check if email is taken by another user
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser && existingUser.id !== req.user.id) {
        req.flash('error_msg', 'Email already in use');
        return res.redirect('/users/profile');
      }

      const user = await User.findByPk(req.user.id);
      
      // Handle profile image upload
      let profileImage = user.profileImage;
      if (req.file) {
        // Delete old image if exists
        if (user.profileImage) {
          const oldImagePath = path.join(__dirname, '../public', user.profileImage);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        profileImage = `/uploads/profiles/${path.basename(req.file.path)}`;
      }

      // Update user
      await user.update({
        name,
        email,
        phone,
        profileImage
      });

      req.flash('success_msg', 'Profile updated successfully');
      res.redirect('/users/profile');
    } catch (err) {
      console.error('Error updating profile:', err);
      req.flash('error_msg', 'Error updating profile');
      res.redirect('/users/profile');
    }
  },

  // Change password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.flash('error_msg', errors.array()[0].msg);
        return res.redirect('/users/profile');
      }

      const user = await User.findByPk(req.user.id);
      
      // Check current password
      const isMatch = await user.validatePassword(currentPassword);
      if (!isMatch) {
        req.flash('error_msg', 'Current password is incorrect');
        return res.redirect('/users/profile');
      }

      // Update password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      await user.update({
        password: hashedPassword
      });

      req.flash('success_msg', 'Password updated successfully');
      res.redirect('/users/profile');
    } catch (err) {
      console.error('Error changing password:', err);
      req.flash('error_msg', 'Error changing password');
      res.redirect('/users/profile');
    }
  },

  // Admin: Get all users
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']]
      });

      res.render('admin/users', {
        title: 'User Management',
        users
      });
    } catch (err) {
      console.error('Error fetching users:', err);
      req.flash('error_msg', 'Error loading users');
      res.redirect('/dashboard/admin');
    }
  },

  // Admin: Get user by ID
  getUserById: async (req, res) => {
    try {
      const userId = req.params.id;
      
      // Simple query to get user without including complex associations
      const userbyadmin = await User.findByPk(userId, { 
        attributes: { exclude: ['password'] } 
      });
      
      if (!userbyadmin) {
        req.flash('error_msg', 'User not found');
        return res.redirect('/admin/users');
      }
      
      // Simple query for tickets without complex includes
      const tickets = await Ticket.findAll({ 
        where: { userId }
      });
      
      // Simple query for referrals without complex includes
      const referrals = await Referral.findAll({ 
        where: { referrerId: userId }
      });
      
      // Format the data to match the template expectations
      const formattedTickets = tickets.map(ticket => {
        const plainTicket = ticket.get({ plain: true });
        return {
          id: plainTicket.id || '',
          eventId: plainTicket.eventId || 'Unknown Event',
          type: plainTicket.type || 'Standard',
          status: plainTicket.status || 'unknown',
          createdAt: plainTicket.createdAt || new Date()
        };
      });
      
      const formattedReferrals = referrals.map(referral => {
        const plainReferral = referral.get({ plain: true });
        return {
          id: plainReferral.id || '',
          referredId: plainReferral.referredUserId || '',
          status: plainReferral.status || 'unknown',
          rewardAmount: plainReferral.commissionAmount || 0,
          createdAt: plainReferral.createdAt || new Date()
        };
      });
      
      // Render the page with all required data
      res.render('admin/user-details', {
        title: 'User Details',
        userbyadmin,
        tickets: formattedTickets,
        referrals: formattedReferrals,
        success_msg: req.flash('success_msg'),
        error_msg: req.flash('error_msg')
      });
      
    } catch (err) {
      console.error('Error fetching user details:', err);
      req.flash('error_msg', 'Error loading user details: ' + err.message);
      res.redirect('/admin/users');
    }
  },

  // Admin: Update user role
  updateUserRole: async (req, res) => {
    try {
      const userId = req.params.id;
      const { role } = req.body;
      
      const user = await User.findByPk(userId);
      
      if (!user) {
        req.flash('error_msg', 'User not found');
        return res.redirect('/users/admin/users');
      }

      // Update role
      await user.update({ role });

      req.flash('success_msg', 'User role updated successfully');
      res.redirect('/users/admin/users');
    } catch (err) {
      console.error('Error updating user role:', err);
      req.flash('error_msg', 'Error updating user role');
      res.redirect('/users/admin/users/');
    }
  },

  // Admin: Update user status
  updateUserStatus: async (req, res) => {
    try {
      const userId = req.params.id;
      const { status } = req.body;
      
      const user = await User.findByPk(userId);
      
      if (!user) {
        req.flash('error_msg', 'User not found');
        return res.redirect('/users/admin/users');
      }

      // Update status
      await user.update({ status });

      req.flash('success_msg', 'User status updated successfully');
      res.redirect('/users/admin/users/');
    } catch (err) {
      console.error('Error updating user status:', err);
      req.flash('error_msg', 'Error updating user status');
      res.redirect('/users/admin/users/');
    }
  },

  // Get user referrals
  getReferrals: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id);
      
      // Get referrals made by this user
      const referrals = await Referral.findAll({
        where: { referrerId: req.user.id },
        include: [
          {
            model: User, 
            as: 'referredUser',
            attributes: ['name', 'email']
          },
          {
            model: Ticket,
            include: [{ model: Event, attributes: ['title'] }]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Get users who were referred by this user
      const referredUsers = await User.findAll({
        where: { referredBy: req.user.id },
        attributes: ['id', 'name', 'email', 'createdAt']
      });

      res.render('users/referrals', {
        title: 'My Referrals',
        user,
        referrals,
        referredUsers,
        referralCode: user.referralCode,
        referralUrl: `${req.protocol}://${req.get('host')}/events?ref=${user.referralCode}`
      });
    } catch (err) {
      console.error('Error fetching referrals:', err);
      req.flash('error_msg', 'Error loading referrals');
      res.redirect('/dashboard');
    }
  }
};