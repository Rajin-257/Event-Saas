/**
 * Payment Controller
 */
const db = require('../models');
const helpers = require('../utils/helpers');
const logger = require('../utils/logger');
const paymentService = require('../services/paymentService');
const emailService = require('../services/emailService');
const whatsappService = require('../services/whatsappService');

// Models
const Payment = db.Payment;
const Ticket = db.Ticket;
const User = db.User;
const Event = db.Event;
const PaymentMethod = db.PaymentMethod;
const Transaction = db.Transaction;

/**
 * Get payment by ID
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get payment with relations
    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: Ticket,
          include: [
            {
              model: Event,
              attributes: ['id', 'title', 'start_date', 'end_date']
            }
          ]
        },
        {
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: PaymentMethod
        }
      ]
    });
    
    if (!payment) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment not found'
      });
    }
    
    // Check authorization
    const isOwner = payment.user_id === req.user.id;
    const isAdmin = req.user.Roles.some(role => role.name === 'admin');
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view this payment'
      });
    }
    
    // Return payment
    res.status(200).json({
      status: 'success',
      data: {
        payment
      }
    });
  } catch (error) {
    logger.error(`Error getting payment: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch payment'
    });
  }
};

/**
 * Get user payments
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getUserPayments = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    // Check authorization
    if (req.params.userId && req.params.userId != req.user.id) {
      const isAdmin = req.user.Roles.some(role => role.name === 'admin');
      
      if (!isAdmin) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to view other user\'s payments'
        });
      }
    }
    
    // Parse pagination parameters
    const { page, limit } = helpers.parsePaginationQuery(req.query);
    
    // Build query
    const query = {
      where: { user_id: userId },
      include: [
        {
          model: Ticket,
          include: [
            {
              model: Event,
              attributes: ['id', 'title', 'start_date', 'end_date']
            }
          ]
        },
        {
          model: PaymentMethod
        }
      ],
      order: [['created_at', 'DESC']],
      ...helpers.getPaginationOptions(page, limit)
    };
    
    // Apply filters
    if (req.query.status) {
      query.where.status = req.query.status;
    }
    
    // Execute query
    const { count, rows: payments } = await Payment.findAndCountAll(query);
    
    // Generate pagination metadata
    const pagination = helpers.getPaginationMetadata(count, limit, page);
    
    // Return payments
    res.status(200).json({
      status: 'success',
      data: {
        payments,
        pagination
      }
    });
  } catch (error) {
    logger.error(`Error getting user payments: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch payments'
    });
  }
};

/**
 * Process payment
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.processPayment = async (req, res) => {
  try {
    const { code } = req.params;
    const { payment_method_id, transaction_reference, payment_details } = req.body;
    
    // Get ticket
    const ticket = await Ticket.findOne({
      where: { ticket_code: code },
      include: [
        {
          model: Event,
          attributes: ['id', 'title', 'start_date', 'end_date']
        }
      ]
    });
    
    if (!ticket) {
      return res.status(404).json({
        status: 'error',
        message: 'Ticket not found'
      });
    }
    
    // Check if ticket belongs to user
    if (ticket.user_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to pay for this ticket'
      });
    }
    
    // Check if ticket can be paid
    if (ticket.status === 'cancelled') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot pay for cancelled ticket'
      });
    }
    
    if (ticket.payment_status === 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Ticket has already been paid'
      });
    }
    
    // Process payment
    const payment = await paymentService.processPayment({
      ticket_id: ticket.id,
      user_id: req.user.id,
      payment_method_id,
      amount: ticket.total_amount,
      transaction_reference,
      payment_details: payment_details || {}
    });
    
    // Return payment result
    res.status(200).json({
      status: 'success',
      message: 'Payment processed successfully',
      data: {
        payment,
        ticket
      }
    });
    
    // Send confirmation email (don't wait for it)
    emailService.sendTicketConfirmationEmail(ticket.purchaser_email, {
      name: ticket.purchaser_name,
      ticketCode: ticket.ticket_code,
      eventTitle: ticket.Event.title,
      eventDate: helpers.formatDate(ticket.Event.start_date),
      eventTime: ticket.Event.start_time,
      venueName: ticket.Event.Venue ? ticket.Event.Venue.name : 'Venue',
      ticketUrl: `${process.env.APP_URL}/tickets/view/${ticket.ticket_code}`
    }).catch(err => {
      logger.error(`Failed to send payment confirmation email: ${err.message}`);
    });
    
    // Send WhatsApp notification (don't wait for it)
    if (ticket.purchaser_phone) {
      whatsappService.sendTicketConfirmationMessage(ticket.purchaser_phone, {
        eventTitle: ticket.Event.title,
        ticketCode: ticket.ticket_code,
        eventDate: helpers.formatDate(ticket.Event.start_date),
        eventTime: ticket.Event.start_time,
        venueName: ticket.Event.Venue ? ticket.Event.Venue.name : 'Venue',
        ticketUrl: `${process.env.APP_URL}/tickets/view/${ticket.ticket_code}`
      }).catch(err => {
        logger.error(`Failed to send payment confirmation WhatsApp: ${err.message}`);
      });
    }
  } catch (error) {
    logger.error(`Error processing payment: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process payment'
    });
  }
};

/**
 * Request refund
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.requestRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Get payment
    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: Ticket,
          include: [
            {
              model: Event,
              attributes: ['id', 'title', 'start_date']
            }
          ]
        }
      ]
    });
    
    if (!payment) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment not found'
      });
    }
    
    // Check authorization
    const isOwner = payment.user_id === req.user.id;
    const isAdmin = req.user.Roles.some(role => role.name === 'admin');
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to request refund for this payment'
      });
    }
    
    // Check if payment can be refunded
    if (payment.status !== 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Only completed payments can be refunded'
      });
    }
    
    // Check if event has already started
    const now = new Date();
    const eventStart = new Date(payment.Ticket.Event.start_date);
    
    if (now >= eventStart) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot refund after event has started'
      });
    }
    
    // Process refund
    const refund = await paymentService.processRefund({
      payment_id: payment.id
    }, reason || 'Refund requested by user');
    
    // Return success
    res.status(200).json({
      status: 'success',
      message: 'Refund processed successfully',
      data: {
        refund
      }
    });
  } catch (error) {
    logger.error(`Error requesting refund: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process refund'
    });
  }
};

/**
 * Get payment statistics
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getPaymentStats = async (req, res) => {
  try {
    // Check if user is admin
    const isAdmin = req.user.Roles.some(role => role.name === 'admin');
    
    if (!isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access payment statistics'
      });
    }
    
    // Get payment statistics
    const totalPayments = await Payment.count();
    
    const completedPayments = await Payment.count({
      where: { status: 'completed' }
    });
    
    const pendingPayments = await Payment.count({
      where: { status: 'pending' }
    });
    
    const failedPayments = await Payment.count({
      where: { status: 'failed' }
    });
    
    const refundedPayments = await Payment.count({
      where: { status: 'refunded' }
    });
    
    // Calculate total revenue
    const totalRevenue = await Payment.sum('amount', {
      where: { status: 'completed' }
    });
    
    // Calculate total refunds
    const totalRefunds = await Payment.sum('amount', {
      where: { status: 'refunded' }
    });
    
    // Payment method breakdown
    const paymentMethodStats = await Payment.findAll({
      attributes: [
        'payment_method_id',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count'],
        [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'total']
      ],
      where: { status: 'completed' },
      group: ['payment_method_id'],
      include: [{
        model: PaymentMethod,
        attributes: ['name']
      }],
      raw: true,
      nest: true
    });
    
    // Get monthly revenue for the past 12 months
    const monthlyRevenue = await Payment.findAll({
      attributes: [
        [db.sequelize.fn('DATE_FORMAT', db.sequelize.col('payment_date'), '%Y-%m'), 'month'],
        [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'total']
      ],
      where: {
        status: 'completed',
        payment_date: {
          [db.Sequelize.Op.gte]: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
        }
      },
      group: [db.sequelize.fn('DATE_FORMAT', db.sequelize.col('payment_date'), '%Y-%m')],
      order: [[db.sequelize.fn('DATE_FORMAT', db.sequelize.col('payment_date'), '%Y-%m'), 'ASC']],
      raw: true
    });
    
    // Return statistics
    res.status(200).json({
      status: 'success',
      data: {
        totalPayments,
        completedPayments,
        pendingPayments,
        failedPayments,
        refundedPayments,
        totalRevenue: totalRevenue || 0,
        totalRefunds: totalRefunds || 0,
        netRevenue: (totalRevenue || 0) - (totalRefunds || 0),
        paymentMethods: paymentMethodStats,
        monthlyRevenue
      }
    });
  } catch (error) {
    logger.error(`Error getting payment statistics: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch payment statistics'
    });
  }
};

/**
 * Render payments page
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.renderPaymentsPage = async (req, res) => {
  try {
    // Get user payments
    const payments = await Payment.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Ticket,
          include: [
            {
              model: Event,
              attributes: ['id', 'title', 'start_date', 'end_date']
            }
          ]
        },
        {
          model: PaymentMethod
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.render('payments/index', {
      title: 'My Payments',
      user: req.user,
      payments,
      formatCurrency: helpers.formatCurrency,
      formatDate: helpers.formatDate,
      formatDateTime: helpers.formatDateTime
    });
  } catch (error) {
    logger.error(`Error rendering payments page: ${error.message}`);
    req.flash('error_msg', 'Error loading payments');
    res.redirect('/dashboard');
  }
};

/**
 * Render payment details page
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.renderPaymentDetailsPage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get payment
    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: Ticket,
          include: [
            {
              model: Event,
              include: [{
                model: db.Venue
              }]
            }
          ]
        },
        {
          model: PaymentMethod
        },
        {
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });
    
    if (!payment) {
      req.flash('error_msg', 'Payment not found');
      return res.redirect('/payments');
    }
    
    // Check authorization
    const isOwner = payment.user_id === req.user.id;
    const isAdmin = req.user.Roles.some(role => role.name === 'admin');
    
    if (!isOwner && !isAdmin) {
      req.flash('error_msg', 'Not authorized to view this payment');
      return res.redirect('/payments');
    }
    
    // Check if refund is possible
    let canRefund = false;
    
    if (payment.status === 'completed') {
      // Can refund if event hasn't started yet
      const now = new Date();
      const eventStart = new Date(payment.Ticket.Event.start_date);
      
      canRefund = now < eventStart;
    }
    
    res.render('payments/details', {
      title: 'Payment Details',
      user: req.user,
      payment,
      canRefund,
      formatCurrency: helpers.formatCurrency,
      formatDate: helpers.formatDate,
      formatDateTime: helpers.formatDateTime
    });
  } catch (error) {
    logger.error(`Error rendering payment details: ${error.message}`);
    req.flash('error_msg', 'Error loading payment details');
    res.redirect('/payments');
  }
};