const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Referral = require('../models/Referral');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const moment = require('moment');
const logger = require('../utils/logger');
const dateFormatter = require('../utils/dateFormatter');

// Dashboard report summary
exports.getDashboardStats = async (req, res) => {
  try {
    // Date ranges
    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'days').startOf('day');
    const thisWeekStart = moment().startOf('week');
    const thisMonthStart = moment().startOf('month');
    
    // Event stats
    const eventsCount = await Event.count();
    const upcomingEventsCount = await Event.count({
      where: {
        startDate: {
          [Op.gt]: new Date()
        }
      }
    });
    const ongoingEventsCount = await Event.count({
      where: {
        status: 'Ongoing'
      }
    });
    
    // Booking stats
    const totalBookings = await Booking.count();
    const todayBookings = await Booking.count({
      where: {
        createdAt: {
          [Op.gte]: today.toDate()
        }
      }
    });
    
    // Sales stats
    const totalSales = await Booking.sum('totalAmount', {
      where: {
        status: 'Confirmed',
        paymentStatus: 'Paid'
      }
    }) || 0;
    
    const todaySales = await Booking.sum('totalAmount', {
      where: {
        status: 'Confirmed',
        paymentStatus: 'Paid',
        createdAt: {
          [Op.gte]: today.toDate()
        }
      }
    }) || 0;
    
    // User stats
    const usersCount = await User.count();
    const newUsersToday = await User.count({
      where: {
        createdAt: {
          [Op.gte]: today.toDate()
        }
      }
    });
    
    // Product stats
    const productsCount = await Product.count();
    const lowStockCount = await Product.count({
      where: {
        currentStock: {
          [Op.lte]: sequelize.col('minimumStock')
        }
      }
    });
    
    // Popular events (by ticket sales)
    const popularEvents = await Booking.findAll({
      attributes: [
        'eventId',
        [sequelize.fn('sum', sequelize.col('quantity')), 'totalSold'],
        [sequelize.fn('sum', sequelize.col('totalAmount')), 'totalRevenue']
      ],
      where: {
        status: 'Confirmed',
        paymentStatus: 'Paid'
      },
      include: [
        { model: Event, as: 'event', attributes: ['title'] }
      ],
      group: ['eventId'],
      order: [[sequelize.literal('totalSold'), 'DESC']],
      limit: 5
    });
    
    return {
      events: {
        total: eventsCount,
        upcoming: upcomingEventsCount,
        ongoing: ongoingEventsCount
      },
      bookings: {
        total: totalBookings,
        today: todayBookings
      },
      sales: {
        total: totalSales,
        today: todaySales
      },
      users: {
        total: usersCount,
        newToday: newUsersToday
      },
      products: {
        total: productsCount,
        lowStock: lowStockCount
      },
      popularEvents
    };
  } catch (error) {
    logger.error('Error generating dashboard stats', { error: error.message });
    throw error;
  }
};

// Ticket sales report
exports.getTicketSalesReport = async (req, res) => {
  try {
    // Date filters
    let startDate = req.query.startDate ? new Date(req.query.startDate) : moment().subtract(30, 'days').toDate();
    let endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    
    // Event filter
    const eventFilter = {};
    if (req.query.eventId) {
      eventFilter.eventId = req.query.eventId;
    }
    
    // Get events for filter dropdown
    const events = await Event.findAll({
      attributes: ['id', 'title'],
      order: [['title', 'ASC']]
    });
    
    // Get ticket sales data
    const ticketSales = await Booking.findAll({
      attributes: [
        'eventId',
        'ticketId',
        [sequelize.fn('sum', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('sum', sequelize.col('totalAmount')), 'totalAmount'],
        [sequelize.fn('count', sequelize.col('id')), 'bookingCount']
      ],
      where: {
        ...eventFilter,
        status: 'Confirmed',
        paymentStatus: 'Paid',
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        { 
          model: Event, 
          as: 'event',
          attributes: ['title']
        },
        {
          model: Ticket,
          as: 'ticket',
          attributes: ['type', 'price']
        }
      ],
      group: ['eventId', 'ticketId'],
      order: [['eventId', 'ASC'], ['ticketId', 'ASC']]
    });
    
    // Calculate summary
    const summary = {
      totalBookings: await Booking.count({
        where: {
          ...eventFilter,
          status: 'Confirmed',
          paymentStatus: 'Paid',
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        }
      }),
      totalTickets: ticketSales.reduce((sum, item) => sum + parseInt(item.dataValues.totalQuantity || 0), 0),
      totalRevenue: ticketSales.reduce((sum, item) => sum + parseFloat(item.dataValues.totalAmount || 0), 0)
    };
    
    // Daily sales for chart
    const dailySales = await Booking.findAll({
      attributes: [
        [sequelize.fn('date', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('sum', sequelize.col('totalAmount')), 'amount'],
        [sequelize.fn('sum', sequelize.col('quantity')), 'quantity']
      ],
      where: {
        ...eventFilter,
        status: 'Confirmed',
        paymentStatus: 'Paid',
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      },
      group: [sequelize.fn('date', sequelize.col('createdAt'))],
      order: [[sequelize.fn('date', sequelize.col('createdAt')), 'ASC']]
    });
    
    res.render('reports/ticket-sales', {
      title: 'Ticket Sales Report',
      ticketSales,
      events,
      summary,
      dailySales: JSON.stringify(dailySales.map(day => ({
        date: moment(day.dataValues.date).format('YYYY-MM-DD'),
        amount: parseFloat(day.dataValues.amount || 0),
        quantity: parseInt(day.dataValues.quantity || 0)
      }))),
      filters: {
        startDate: moment(startDate).format('YYYY-MM-DD'),
        endDate: moment(endDate).format('YYYY-MM-DD'),
        eventId: req.query.eventId
      },
      dateFormatter,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error generating ticket sales report', { error: error.message });
    req.flash('error', 'Failed to generate report');
    res.redirect('/dashboard');
  }
};

// Inventory report
exports.getInventoryReport = async (req, res) => {
  try {
    // Category filter
    const filter = {};
    if (req.query.categoryId) {
      filter.categoryId = req.query.categoryId;
    }
    
    // Get product categories
    const categories = await ProductCategory.findAll({
      order: [['name', 'ASC']]
    });
    
    // Get inventory data
    const inventory = await Product.findAll({
      where: filter,
      include: [
        { 
          model: ProductCategory, 
          as: 'category',
          attributes: ['name'] 
        }
      ],
      order: [['name', 'ASC']]
    });
    
    // Calculate inventory value
    const inventoryValue = inventory.reduce((sum, product) => {
      return sum + (product.currentStock * product.costPrice);
    }, 0);
    
    // Get low stock products
    const lowStockProducts = inventory.filter(product => 
      product.currentStock <= product.minimumStock
    );
    
    // Get fast moving products
    const lastMonth = moment().subtract(30, 'days').toDate();
    const inventoryMovement = await Inventory.findAll({
      attributes: [
        'productId',
        [sequelize.literal('SUM(CASE WHEN type = "Out" THEN quantity ELSE 0 END)'), 'outQuantity']
      ],
      where: {
        createdAt: {
          [Op.gte]: lastMonth
        }
      },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['name', 'currentStock', 'costPrice', 'sellingPrice']
        }
      ],
      group: ['productId'],
      order: [[sequelize.literal('outQuantity'), 'DESC']],
      limit: 10
    });
    
    res.render('reports/inventory', {
      title: 'Inventory Report',
      inventory,
      categories,
      summary: {
        totalProducts: inventory.length,
        inventoryValue,
        lowStockCount: lowStockProducts.length
      },
      lowStockProducts,
      fastMovingProducts: inventoryMovement,
      filters: {
        categoryId: req.query.categoryId
      },
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error generating inventory report', { error: error.message });
    req.flash('error', 'Failed to generate report');
    res.redirect('/dashboard');
  }
};

// Commission report
exports.getCommissionReport = async (req, res) => {
  try {
    // Date filters
    let startDate = req.query.startDate ? new Date(req.query.startDate) : moment().subtract(30, 'days').toDate();
    let endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    
    // Get referral data
    const referrals = await Referral.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'email']
        }
      ],
      order: [['totalEarnings', 'DESC']]
    });
    
    // Get bookings using referrals in date range
    const bookings = await Booking.findAll({
      where: {
        referralCode: {
          [Op.ne]: null
        },
        status: 'Confirmed',
        paymentStatus: 'Paid',
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName']
        }
      ]
    });
    
    // Process bookings to match with referrals
    const referralBookings = [];
    for (const booking of bookings) {
      const referral = referrals.find(ref => ref.code === booking.referralCode);
      if (referral) {
        const commission = booking.totalAmount * (referral.commissionPercentage / 100);
        referralBookings.push({
          ...booking.dataValues,
          referralUser: referral.user,
          commission,
          commissionPercentage: referral.commissionPercentage
        });
      }
    }
    
    // Calculate summary
    const totalCommission = referralBookings.reduce((sum, booking) => sum + booking.commission, 0);
    
    res.render('reports/commission', {
      title: 'Commission Report',
      referrals,
      referralBookings,
      summary: {
        totalReferrers: referrals.length,
        totalCommission,
        totalBookings: referralBookings.length
      },
      filters: {
        startDate: moment(startDate).format('YYYY-MM-DD'),
        endDate: moment(endDate).format('YYYY-MM-DD')
      },
      dateFormatter,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error generating commission report', { error: error.message });
    req.flash('error', 'Failed to generate report');
    res.redirect('/dashboard');
  }
};

// Event performance report
exports.getEventPerformanceReport = async (req, res) => {
  try {
    // Event filter
    const eventId = req.params.id || req.query.eventId;
    
    if (!eventId) {
      // Show event selection if no event is specified
      const events = await Event.findAll({
        order: [['startDate', 'DESC']]
      });
      
      return res.render('reports/event-performance-select', {
        title: 'Select Event for Performance Report',
        events,
        dateFormatter,
        messages: req.flash()
      });
    }
    
    // Get event details
    const event = await Event.findByPk(eventId, {
      include: [
        { model: EventCategory, as: 'category' },
        { model: Ticket, as: 'tickets' }
      ]
    });
    
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/reports');
    }
    
    // Get booking stats
    const bookingStats = await Booking.findAll({
      attributes: [
        'status',
        [sequelize.fn('count', sequelize.col('id')), 'count'],
        [sequelize.fn('sum', sequelize.col('totalAmount')), 'amount']
      ],
      where: {
        eventId
      },
      group: ['status']
    });
    
    // Get ticket sales breakdown
    const ticketSales = await Booking.findAll({
      attributes: [
        'ticketId',
        [sequelize.fn('sum', sequelize.col('quantity')), 'quantity'],
        [sequelize.fn('sum', sequelize.col('totalAmount')), 'amount']
      ],
      where: {
        eventId,
        status: 'Confirmed',
        paymentStatus: 'Paid'
      },
      include: [
        {
          model: Ticket,
          as: 'ticket',
          attributes: ['type', 'price', 'quantity']
        }
      ],
      group: ['ticketId']
    });
    
    // Process tickets to add percentage sold
    const processedTicketSales = ticketSales.map(sale => {
      const percentageSold = (sale.dataValues.quantity / sale.ticket.quantity) * 100;
      return {
        ...sale.dataValues,
        ticket: sale.ticket,
        percentageSold
      };
    });
    
    // Daily sales chart data
    const dailySales = await Booking.findAll({
      attributes: [
        [sequelize.fn('date', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('sum', sequelize.col('quantity')), 'tickets'],
        [sequelize.fn('sum', sequelize.col('totalAmount')), 'revenue']
      ],
      where: {
        eventId,
        status: 'Confirmed',
        paymentStatus: 'Paid'
      },
      group: [sequelize.fn('date', sequelize.col('createdAt'))],
      order: [[sequelize.fn('date', sequelize.col('createdAt')), 'ASC']]
    });
    
    // Calculate summary
    const totalConfirmedBookings = bookingStats.find(stat => stat.dataValues.status === 'Confirmed')?.dataValues.count || 0;
    const totalRevenue = bookingStats.find(stat => stat.dataValues.status === 'Confirmed')?.dataValues.amount || 0;
    const totalTicketsSold = processedTicketSales.reduce((sum, ticket) => sum + parseInt(ticket.quantity), 0);
    const totalCapacity = event.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
    const soldPercentage = (totalTicketsSold / totalCapacity) * 100;
    
    res.render('reports/event-performance', {
      title: `Event Performance - ${event.title}`,
      event,
      bookingStats,
      ticketSales: processedTicketSales,
      dailySales: JSON.stringify(dailySales.map(day => ({
        date: moment(day.dataValues.date).format('YYYY-MM-DD'),
        tickets: parseInt(day.dataValues.tickets || 0),
        revenue: parseFloat(day.dataValues.revenue || 0)
      }))),
      summary: {
        totalConfirmedBookings,
        totalRevenue,
        totalTicketsSold,
        totalCapacity,
        soldPercentage
      },
      dateFormatter,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error generating event performance report', { error: error.message });
    req.flash('error', 'Failed to generate report');
    res.redirect('/reports');
  }
};

// User activity report
exports.getUserActivityReport = async (req, res) => {
  try {
    // Date filters
    let startDate = req.query.startDate ? new Date(req.query.startDate) : moment().subtract(30, 'days').toDate();
    let endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    
    // Get new users in date range
    const newUsers = await User.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['createdAt', 'DESC']]
    });
    
    // Get active users (made bookings) in date range
    const activeUsers = await Booking.findAll({
      attributes: [
        'userId',
        [sequelize.fn('count', sequelize.col('id')), 'bookingCount'],
        [sequelize.fn('sum', sequelize.col('totalAmount')), 'totalSpent'],
        [sequelize.fn('max', sequelize.col('createdAt')), 'lastActivity']
      ],
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'email', 'createdAt']
        }
      ],
      group: ['userId'],
      order: [[sequelize.literal('bookingCount'), 'DESC']]
    });
    
    // Get login activity 
    const recentLogins = await User.findAll({
      where: {
        lastLogin: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['lastLogin', 'DESC']],
      limit: 50
    });
    
    // Daily new user registrations
    const dailyRegistrations = await User.findAll({
      attributes: [
        [sequelize.fn('date', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('count', sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      },
      group: [sequelize.fn('date', sequelize.col('createdAt'))],
      order: [[sequelize.fn('date', sequelize.col('createdAt')), 'ASC']]
    });
    
    res.render('reports/user-activity', {
      title: 'User Activity Report',
      newUsers,
      activeUsers,
      recentLogins,
      dailyRegistrations: JSON.stringify(dailyRegistrations.map(day => ({
        date: moment(day.dataValues.date).format('YYYY-MM-DD'),
        count: parseInt(day.dataValues.count || 0)
      }))),
      summary: {
        newUsersCount: newUsers.length,
        activeUsersCount: activeUsers.length,
        loginsCount: recentLogins.length
      },
      filters: {
        startDate: moment(startDate).format('YYYY-MM-DD'),
        endDate: moment(endDate).format('YYYY-MM-DD')
      },
      dateFormatter,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error generating user activity report', { error: error.message });
    req.flash('error', 'Failed to generate report');
    res.redirect('/dashboard');
  }
};