const { getDashboardStats } = require('./reportController');
const ProductCategory = require('../models/ProductCategory');
const Ticket = require('../models/Ticket');
const Referral = require('../models/Referral');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Product = require('../models/Product');
const User = require('../models/User');
const logger = require('../utils/logger');
const dateFormatter = require('../utils/dateFormatter');
const { Op } = require('sequelize');
const moment = require('moment');
const sequelize = require('../config/database');

// Admin dashboard
exports.getAdminDashboard = async (req, res) => {
  try {
    // Get dashboard stats
    const stats = await getDashboardStats();
    
    // Get ongoing and upcoming events
    const events = await Event.findAll({
      where: {
        status: {
          [Op.in]: ['Ongoing', 'Upcoming']
        },
        endDate: {
          [Op.gte]: new Date()
        }
      },
      order: [['startDate', 'ASC']],
      limit: 5
    });
    
    // Get recent bookings
    const recentBookings = await Booking.findAll({
      include: [
        { model: Event, as: 'event' },
        { model: User, as: 'user', attributes: ['id', 'fullName', 'email'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    // Get low stock products
    const lowStockProducts = await Product.findAll({
      where: {
        currentStock: {
          [Op.lte]: sequelize.col('minimumStock')
        }
      },
      include: [
        { model: ProductCategory, as: 'category' }
      ],
      limit: 5
    });
    
    res.render('dashboard/admin', {
      title: 'Admin Dashboard',
      stats,
      events,
      recentBookings,
      lowStockProducts,
      dateFormatter,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error loading admin dashboard', { error: error.message });
    req.flash('error', 'Failed to load dashboard data');
    res.render('dashboard/admin', {
      title: 'Admin Dashboard',
      stats: {},
      events: [],
      recentBookings: [],
      lowStockProducts: [],
      dateFormatter,
      messages: req.flash()
    });
  }
};

// Office staff dashboard
exports.getStaffDashboard = async (req, res) => {
  try {
    // Get today's date range
    const today = moment().startOf('day');
    const tomorrow = moment().endOf('day');
    
    // Get ongoing events
    const ongoingEvents = await Event.findAll({
      where: {
        status: 'Ongoing'
      }
    });
    
    // Get today's bookings
    const todayBookings = await Booking.findAll({
      where: {
        createdAt: {
          [Op.between]: [today.toDate(), tomorrow.toDate()]
        }
      },
      include: [
        { model: Event, as: 'event' },
        { model: Ticket, as: 'ticket' },
        { model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'phone'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Today's sales
    const todaySales = todayBookings.reduce((sum, booking) => {
      if (booking.status === 'Confirmed' && booking.paymentStatus === 'Paid') {
        return sum + booking.totalAmount;
      }
      return sum;
    }, 0);
    
    const todayTickets = todayBookings.reduce((sum, booking) => {
      if (booking.status === 'Confirmed') {
        return sum + booking.quantity;
      }
      return sum;
    }, 0);
    
    res.render('dashboard/staff', {
      title: 'Staff Dashboard',
      ongoingEvents,
      todayBookings,
      stats: {
        todaySales,
        todayTickets,
        todayBookingsCount: todayBookings.length
      },
      dateFormatter,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error loading staff dashboard', { error: error.message });
    req.flash('error', 'Failed to load dashboard data');
    res.render('dashboard/staff', {
      title: 'Staff Dashboard',
      ongoingEvents: [],
      todayBookings: [],
      stats: {
        todaySales: 0,
        todayTickets: 0,
        todayBookingsCount: 0
      },
      dateFormatter,
      messages: req.flash()
    });
  }
};

// User dashboard
exports.getUserDashboard = async (req, res) => {
  try {
    // Get user's bookings
    const bookings = await Booking.findAll({
      where: {
        userId: req.user.id
      },
      include: [
        { model: Event, as: 'event' },
        { model: Ticket, as: 'ticket' }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    // Get upcoming events
    const upcomingEvents = await Event.findAll({
      where: {
        status: {
          [Op.in]: ['Upcoming', 'Ongoing']
        },
        isPublished: true,
        startDate: {
          [Op.gte]: new Date()
        }
      },
      order: [['startDate', 'ASC']],
      limit: 3
    });
    
    // Get referral if exists
    const referral = await Referral.findOne({
      where: {
        userId: req.user.id
      }
    });
    
    // If referral exists, get summary
    let referralStats = null;
    if (referral) {
      const referralBookings = await Booking.count({
        where: {
          referralCode: referral.code,
          status: 'Confirmed'
        }
      });
      
      referralStats = {
        code: referral.code,
        usageCount: referral.usageCount,
        commissionPercentage: referral.commissionPercentage,
        totalEarnings: referral.totalEarnings,
        pendingBookings: referralBookings - referral.usageCount
      };
    }
    
    res.render('dashboard/user', {
      title: 'Dashboard',
      bookings,
      upcomingEvents,
      referralStats,
      dateFormatter,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error loading user dashboard', { error: error.message });
    req.flash('error', 'Failed to load dashboard data');
    res.render('dashboard/user', {
      title: 'Dashboard',
      bookings: [],
      upcomingEvents: [],
      referralStats: null,
      dateFormatter,
      messages: req.flash()
    });
  }
};

// Main dashboard router
exports.getDashboard = (req, res) => {
  const userRole = req.user.role;
  
  if (userRole === 'SuperAdmin' || userRole === 'Admin') {
    return this.getAdminDashboard(req, res);
  } else if (userRole === 'Office Staff') {
    return this.getStaffDashboard(req, res);
  } else if (userRole === 'Ticket Checker') {
    return res.redirect('/tickets/checker');
  } else {
    return this.getUserDashboard(req, res);
  }
};