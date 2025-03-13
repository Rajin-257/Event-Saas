/**
 * User Controller
 */
const db = require('../models');
const security = require('../utils/security');
const helpers = require('../utils/helpers');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

// Models
const User = db.User;
const Role = db.Role;
const Ticket = db.Ticket;
const Referral = db.Referral;
const Transaction = db.Transaction;

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
      // Delete old image if exists
      if (user.profile_image) {
        const oldImagePath = path.join(__dirname, '../public', user.profile_image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
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

/**
 * Get user statistics
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get tickets count
    const ticketsCount = await Ticket.count({
      where: { user_id: userId }
    });
    
    // Get upcoming tickets
    const upcomingTickets = await Ticket.count({
      where: { 
        user_id: userId,
        status: 'confirmed' 
      },
      include: [{
        model: db.Event,
        where: {
          start_date: {
            [db.Sequelize.Op.gte]: new Date()
          }
        }
      }]
    });
    
    // Get referrals
    const referrals = await Referral.count({
      where: { referrer_id: userId }
    });
    
    // Get wallet balance (sum of transactions)
    const transactions = await Transaction.findAll({
      where: { user_id: userId },
      attributes: [
        [db.sequelize.literal(`SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END)`), 'totalCredits'],
        [db.sequelize.literal(`SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END)`), 'totalDebits']
      ],
      raw: true
    });
    
    const walletBalance = transactions.length > 0
      ? parseFloat(transactions[0].totalCredits || 0) - parseFloat(transactions[0].totalDebits || 0)
      : 0;
    
    // Return statistics
    res.status(200).json({
      status: 'success',
      data: {
        ticketsCount,
        upcomingTickets,
        referrals,
        walletBalance
      }
    });
  } catch (error) {
    logger.error(`Get user stats error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user statistics'
    });
  }
};

/**
 * Get user transactions
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Parse pagination parameters
    const { page, limit } = helpers.parsePaginationQuery(req.query);
    
    // Build query
    const query = {
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      ...helpers.getPaginationOptions(page, limit)
    };
    
    // Apply filters
    if (req.query.type) {
      query.where.type = req.query.type;
    }
    
    if (req.query.related_type) {
      query.where.related_type = req.query.related_type;
    }
    
    // Execute query
    const { count, rows: transactions } = await Transaction.findAndCountAll(query);
    
    // Generate pagination metadata
    const pagination = helpers.getPaginationMetadata(count, limit, page);
    
    // Return transactions
    res.status(200).json({
      status: 'success',
      data: {
        transactions,
        pagination
      }
    });
  } catch (error) {
    logger.error(`Get user transactions error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch transactions'
    });
  }
};

/**
 * Render profile page
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.renderProfilePage = async (req, res) => {
  try {
    res.render('users/profile', {
      title: 'My Profile',
      user: req.user
    });
  } catch (error) {
    logger.error(`Error rendering profile page: ${error.message}`);
    req.flash('error_msg', 'Error loading profile page');
    res.redirect('/dashboard');
  }
};

/**
 * Render transactions page
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.renderTransactionsPage = async (req, res) => {
  try {
    // Get user transactions
    const transactions = await Transaction.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 20
    });
    
    res.render('users/transactions', {
      title: 'My Transactions',
      user: req.user,
      transactions
    });
  } catch (error) {
    logger.error(`Error rendering transactions page: ${error.message}`);
    req.flash('error_msg', 'Error loading transactions page');
    res.redirect('/dashboard');
  }
};

/**
 * Render referrals page
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.renderReferralsPage = async (req, res) => {
  try {
    // Get user referrals
    const referrals = await Referral.findAll({
      where: { referrer_id: req.user.id },
      include: [
        {
          model: User,
          as: 'Referred',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: db.Event,
          attributes: ['id', 'title']
        },
        {
          model: db.Commission
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    // Calculate referral statistics
    const stats = {
      totalReferrals: referrals.length,
      activeReferrals: referrals.filter(ref => ref.status === 'active').length,
      usedReferrals: referrals.filter(ref => ref.status === 'used').length,
      totalCommissions: 0,
      pendingCommissions: 0,
      paidCommissions: 0
    };
    
    // Calculate commission amounts
    referrals.forEach(referral => {
      if (referral.Commissions && referral.Commissions.length > 0) {
        referral.Commissions.forEach(commission => {
          if (commission.status !== 'cancelled') {
            stats.totalCommissions += parseFloat(commission.amount);
            
            if (commission.status === 'pending') {
              stats.pendingCommissions += parseFloat(commission.amount);
            } else if (commission.status === 'paid') {
              stats.paidCommissions += parseFloat(commission.amount);
            }
          }
        });
      }
    });
    
    res.render('users/referrals', {
      title: 'My Referrals',
      user: req.user,
      referrals,
      stats
    });
  } catch (error) {
    logger.error(`Error rendering referrals page: ${error.message}`);
    req.flash('error_msg', 'Error loading referrals page');
    res.redirect('/dashboard');
  }
};