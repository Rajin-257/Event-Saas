/**
 * Ticket Controller
 */
const db = require('../models');
const helpers = require('../utils/helpers');
const security = require('../utils/security');
const logger = require('../utils/logger');
const qrCodeService = require('../services/qrCodeService');
const emailService = require('../services/emailService');
const whatsappService = require('../services/whatsappService');
const otpService = require('../services/otpService');
const paymentService = require('../services/paymentService');
const referralService = require('../services/referralService');
const fs = require('fs');
const path = require('path');

// Models
const Event = db.Event;
const TicketType = db.TicketType;
const Ticket = db.Ticket;
const User = db.User;
const Venue = db.Venue;
const Payment = db.Payment;
const PaymentMethod = db.PaymentMethod;

/**
 * Create ticket type
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.createTicketType = async (req, res) => {
  try {
    const { event_id, name, description, price, max_tickets, is_active, start_sale_date, end_sale_date } = req.body;
    
    // Check if event exists
    const event = await Event.findByPk(event_id);
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    // Check if user is authorized (event creator or admin)
    const isAdmin = req.user.Roles.some(role => role.name === 'admin');
    
    if (event.created_by !== req.user.id && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to create ticket types for this event'
      });
    }
    
    // Create ticket type
    const ticketType = await TicketType.create({
      event_id,
      name,
      description,
      price,
      max_tickets,
      tickets_sold: 0,
      is_active: is_active !== undefined ? is_active : true,
      start_sale_date,
      end_sale_date
    });
    
    // Return created ticket type
    res.status(201).json({
      status: 'success',
      message: 'Ticket type created successfully',
      data: {
        ticketType
      }
    });
  } catch (error) {
    logger.error(`Error creating ticket type: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create ticket type'
    });
  }
};

/**
 * Update ticket type
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.updateTicketType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, max_tickets, is_active, start_sale_date, end_sale_date } = req.body;
    
    // Get ticket type
    const ticketType = await TicketType.findByPk(id, {
      include: [{ model: Event }]
    });
    
    if (!ticketType) {
      return res.status(404).json({
        status: 'error',
        message: 'Ticket type not found'
      });
    }
    
    // Check if user is authorized (event creator or admin)
    const isAdmin = req.user.Roles.some(role => role.name === 'admin');
    
    if (ticketType.Event.created_by !== req.user.id && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this ticket type'
      });
    }
    
    // Make sure max_tickets is not less than tickets_sold
    if (max_tickets !== undefined && max_tickets < ticketType.tickets_sold) {
      return res.status(400).json({
        status: 'error',
        message: 'Maximum tickets cannot be less than tickets already sold'
      });
    }
    
    // Prepare update data
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (max_tickets !== undefined) updateData.max_tickets = max_tickets;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (start_sale_date !== undefined) updateData.start_sale_date = start_sale_date;
    if (end_sale_date !== undefined) updateData.end_sale_date = end_sale_date;
    
    // Update ticket type
    await ticketType.update(updateData);
    
    // Return updated ticket type
    res.status(200).json({
      status: 'success',
      message: 'Ticket type updated successfully',
      data: {
        ticketType
      }
    });
  } catch (error) {
    logger.error(`Error updating ticket type: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update ticket type'
    });
  }
};

/**
 * Delete ticket type
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.deleteTicketType = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get ticket type
    const ticketType = await TicketType.findByPk(id, {
      include: [{ model: Event }]
    });
    
    if (!ticketType) {
      return res.status(404).json({
        status: 'error',
        message: 'Ticket type not found'
      });
    }
    
    // Check if user is authorized (event creator or admin)
    const isAdmin = req.user.Roles.some(role => role.name === 'admin');
    
    if (ticketType.Event.created_by !== req.user.id && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this ticket type'
      });
    }
    
    // Check if tickets have been sold
    if (ticketType.tickets_sold > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete ticket type with sold tickets'
      });
    }
    
    // Delete ticket type
    await ticketType.destroy();
    
    // Return success
    res.status(200).json({
      status: 'success',
      message: 'Ticket type deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting ticket type: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete ticket type'
    });
  }
};

/**
 * Purchase ticket
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.purchaseTicket = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { ticket_type_id, quantity, purchaser_name, purchaser_email, purchaser_phone, referral_code } = req.body;
    
    // Get ticket type with event
    const ticketType = await TicketType.findByPk(ticket_type_id, {
      include: [
        {
          model: Event,
          include: [{ model: Venue }]
        }
      ],
      transaction
    });
    
    if (!ticketType) {
      await transaction.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Ticket type not found'
      });
    }
    
    // Check if ticket type is active
    if (!ticketType.is_active) {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Ticket type is not available for purchase'
      });
    }
    
    // Check if event is published
    if (ticketType.Event.status !== 'published') {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Event is not available for ticket purchases'
      });
    }
    
    // Check if event date is in the future
    if (new Date(ticketType.Event.start_date) < new Date()) {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Event has already started or ended'
      });
    }
    
    // Check if ticket sale has started
    if (ticketType.start_sale_date && new Date(ticketType.start_sale_date) > new Date()) {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Ticket sales have not started yet'
      });
    }
    
    // Check if ticket sale has ended
    if (ticketType.end_sale_date && new Date(ticketType.end_sale_date) < new Date()) {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Ticket sales have ended'
      });
    }
    
    // Check if enough tickets are available
    if (ticketType.tickets_sold + quantity > ticketType.max_tickets) {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Not enough tickets available'
      });
    }
    
    // Calculate total amount
    const unitPrice = parseFloat(ticketType.price);
    const totalAmount = unitPrice * quantity;
    
    // Process referral if provided
    let referral_id = null;
    if (referral_code) {
      try {
        const referral = await referralService.getReferralByCode(referral_code);
        if (referral) {
          referral_id = referral.id;
        }
      } catch (error) {
        // Just log the error, don't fail the purchase
        logger.error(`Failed to process referral: ${error.message}`);
      }
    }
    
    // Generate ticket code
    const ticketCode = `TKT-${security.generateRandomCode(8, true)}`;
    
    // Create ticket
    const ticket = await Ticket.create({
      ticket_code: ticketCode,
      event_id: ticketType.Event.id,
      ticket_type_id,
      user_id: req.user.id,
      purchaser_name,
      purchaser_email,
      purchaser_phone,
      unit_price: unitPrice,
      quantity,
      total_amount: totalAmount,
      referral_id,
      status: 'pending',
      payment_status: 'pending'
    }, { transaction });
    
    // Generate QR code
    const qrCodePath = path.join(__dirname, '../public/uploads/tickets', `${ticketCode}.png`);
    
    // Ensure directory exists
    const qrCodeDir = path.dirname(qrCodePath);
    if (!fs.existsSync(qrCodeDir)) {
      fs.mkdirSync(qrCodeDir, { recursive: true });
    }
    
    // Generate QR code to file
    await qrCodeService.generateTicketQR(ticket, 'file', qrCodePath);
    
    // Update ticket with QR code path
    await ticket.update({
      qr_code: `uploads/tickets/${ticketCode}.png`
    }, { transaction });
    
    // Update ticket type sold count
    await ticketType.update({
      tickets_sold: ticketType.tickets_sold + quantity
    }, { transaction });
    
    // Commit transaction
    await transaction.commit();
    
    // Return ticket details
    res.status(201).json({
      status: 'success',
      message: 'Ticket purchased successfully',
      data: {
        ticket,
        event: ticketType.Event,
        paymentMethods: await paymentService.getPaymentMethods()
      }
    });
    
    // Send email notification (don't wait for it)
    emailService.sendTicketConfirmationEmail(purchaser_email, {
      name: purchaser_name,
      ticketCode,
      eventTitle: ticketType.Event.title,
      eventDate: helpers.formatDate(ticketType.Event.start_date),
      eventTime: helpers.formatTime(ticketType.Event.start_time),
      venueName: ticketType.Event.Venue.name,
      ticketType: ticketType.name,
      ticketUrl: `${process.env.APP_URL}/tickets/view/${ticketCode}`
    }).catch(err => {
      logger.error(`Failed to send ticket confirmation email: ${err.message}`);
    });
    
    // Send WhatsApp notification (don't wait for it)
    if (purchaser_phone) {
      whatsappService.sendTicketConfirmationMessage(purchaser_phone, {
        eventTitle: ticketType.Event.title,
        ticketCode,
        eventDate: helpers.formatDate(ticketType.Event.start_date),
        eventTime: helpers.formatTime(ticketType.Event.start_time),
        venueName: ticketType.Event.Venue.name,
        ticketUrl: `${process.env.APP_URL}/tickets/view/${ticketCode}`
      }).catch(err => {
        logger.error(`Failed to send ticket confirmation WhatsApp: ${err.message}`);
      });
    }
  } catch (error) {
    await transaction.rollback();
    logger.error(`Error purchasing ticket: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to purchase ticket'
    });
  }
};

/**
 * Get user tickets
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getUserTickets = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    // Check if user is authorized to view other user's tickets
    if (req.params.userId && req.params.userId !== req.user.id) {
      const isAdmin = req.user.Roles.some(role => role.name === 'admin');
      
      if (!isAdmin) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to view other user\'s tickets'
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
          model: Event,
          include: [{ model: Venue }]
        },
        {
          model: TicketType
        }
      ],
      order: [['created_at', 'DESC']],
      ...helpers.getPaginationOptions(page, limit)
    };
    
    // Apply filters
    if (req.query.status) {
      query.where.status = req.query.status;
    }
    
    if (req.query.payment_status) {
      query.where.payment_status = req.query.payment_status;
    }
    
    // Execute query
    const { count, rows: tickets } = await Ticket.findAndCountAll(query);
    
    // Generate pagination metadata
    const pagination = helpers.getPaginationMetadata(count, limit, page);
    
    // Return tickets
    res.status(200).json({
      status: 'success',
      data: {
        tickets,
        pagination
      }
    });
  } catch (error) {
    logger.error(`Error getting user tickets: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch tickets'
    });
  }
};

/**
 * Get event tickets
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getEventTickets = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Check if event exists
    const event = await Event.findByPk(eventId);
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    // Check if user is authorized (event creator or admin)
    const isAdmin = req.user.Roles.some(role => role.name === 'admin');
    
    if (event.created_by !== req.user.id && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view tickets for this event'
      });
    }
    
    // Parse pagination parameters
    const { page, limit } = helpers.parsePaginationQuery(req.query);
    
    // Build query
    const query = {
      where: { event_id: eventId },
      include: [
        {
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
        },
        {
          model: TicketType
        }
      ],
      order: [['created_at', 'DESC']],
      ...helpers.getPaginationOptions(page, limit)
    };
    
    // Apply filters
    if (req.query.status) {
      query.where.status = req.query.status;
    }
    
    if (req.query.payment_status) {
      query.where.payment_status = req.query.payment_status;
    }
    
    if (req.query.checked_in) {
      query.where.checked_in = req.query.checked_in === 'true';
    }
    
    // Execute query
    const { count, rows: tickets } = await Ticket.findAndCountAll(query);
    
    // Generate pagination metadata
    const pagination = helpers.getPaginationMetadata(count, limit, page);
    
    // Return tickets
    res.status(200).json({
      status: 'success',
      data: {
        tickets,
        pagination
      }
    });
  } catch (error) {
    logger.error(`Error getting event tickets: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch tickets'
    });
  }
};

/**
 * Get ticket by code
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getTicketByCode = async (req, res) => {
  try {
    const { code } = req.params;
    
    // Get ticket
    const ticket = await Ticket.findOne({
      where: { ticket_code: code },
      include: [
        {
          model: Event,
          include: [{ model: Venue }]
        },
        {
          model: TicketType
        },
        {
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
        }
      ]
    });
    
    if (!ticket) {
      return res.status(404).json({
        status: 'error',
        message: 'Ticket not found'
      });
    }
    
    // Check if user is authorized
    const isOwner = ticket.user_id === req.user.id;
    const isEventOrganizer = ticket.Event.created_by === req.user.id;
    const isAdmin = req.user.Roles.some(role => role.name === 'admin');
    
    if (!isOwner && !isEventOrganizer && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view this ticket'
      });
    }
    
    // Return ticket
    res.status(200).json({
      status: 'success',
      data: {
        ticket
      }
    });
  } catch (error) {
    logger.error(`Error getting ticket by code: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch ticket'
    });
  }
};

/**
 * Verify ticket
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.verifyTicket = async (req, res) => {
  try {
    const { code } = req.params;
    
    // Get ticket
    const ticket = await Ticket.findOne({
      where: { ticket_code: code },
      include: [
        {
          model: Event,
          include: [{ model: Venue }]
        },
        {
          model: TicketType
        }
      ]
    });
    
    if (!ticket) {
      return res.status(404).json({
        status: 'error',
        message: 'Ticket not found'
      });
    }
    
    // Check if event is in progress
    const now = new Date();
    const eventStart = new Date(`${ticket.Event.start_date} ${ticket.Event.start_time}`);
    const eventEnd = new Date(`${ticket.Event.end_date} ${ticket.Event.end_time}`);
    
    if (now < eventStart) {
      return res.status(400).json({
        status: 'error',
        message: 'Event has not started yet',
        data: {
          ticket,
          valid: false,
          reason: 'event_not_started'
        }
      });
    }
    
    if (now > eventEnd) {
      return res.status(400).json({
        status: 'error',
        message: 'Event has already ended',
        data: {
          ticket,
          valid: false,
          reason: 'event_ended'
        }
      });
    }
    
    // Check if ticket is valid
    if (ticket.status === 'cancelled') {
      return res.status(400).json({
        status: 'error',
        message: 'Ticket has been cancelled',
        data: {
          ticket,
          valid: false,
          reason: 'ticket_cancelled'
        }
      });
    }
    
    if (ticket.payment_status !== 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Ticket payment is not completed',
        data: {
          ticket,
          valid: false,
          reason: 'payment_incomplete'
        }
      });
    }
    
    if (ticket.checked_in) {
      return res.status(400).json({
        status: 'error',
        message: 'Ticket has already been used',
        data: {
          ticket,
          valid: false,
          reason: 'already_checked_in',
          checked_in_at: ticket.checked_in_at
        }
      });
    }
    
    // Ticket is valid
    return res.status(200).json({
      status: 'success',
      message: 'Ticket is valid',
      data: {
        ticket,
        valid: true
      }
    });
  } catch (error) {
    logger.error(`Error verifying ticket: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify ticket'
    });
  }
};

/**
 * Check in ticket
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.checkInTicket = async (req, res) => {
  try {
    const { code } = req.params;
    
    // Get ticket
    const ticket = await Ticket.findOne({
      where: { ticket_code: code },
      include: [
        {
          model: Event,
          include: [{ model: Venue }]
        },
        {
          model: TicketType
        }
      ]
    });
    
    if (!ticket) {
      return res.status(404).json({
        status: 'error',
        message: 'Ticket not found'
      });
    }
    
    // Check if user is authorized (event organizer or admin)
    const isEventOrganizer = ticket.Event.created_by === req.user.id;
    const isAdmin = req.user.Roles.some(role => role.name === 'admin');
    
    if (!isEventOrganizer && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to check in this ticket'
      });
    }
    
    // Check if ticket is valid
    if (ticket.status === 'cancelled') {
      return res.status(400).json({
        status: 'error',
        message: 'Ticket has been cancelled'
      });
    }
    
    if (ticket.payment_status !== 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Ticket payment is not completed'
      });
    }
    
    if (ticket.checked_in) {
      return res.status(400).json({
        status: 'error',
        message: 'Ticket has already been checked in',
        data: {
          checked_in_at: ticket.checked_in_at
        }
      });
    }
    
    // Update ticket
    await ticket.update({
      checked_in: true,
      checked_in_at: new Date(),
      status: 'used'
    });
    
    // Save attendee photo if provided
    if (req.file) {
      await ticket.update({
        attendee_photo: req.file.path.replace('public/', '')
      });
    }
    
    // Return updated ticket
    res.status(200).json({
      status: 'success',
      message: 'Ticket checked in successfully',
      data: {
        ticket
      }
    });
  } catch (error) {
    logger.error(`Error checking in ticket: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check in ticket'
    });
  }
};

/**
 * Cancel ticket
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.cancelTicket = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { code } = req.params;
    const { reason } = req.body;
    
    // Get ticket
    const ticket = await Ticket.findOne({
      where: { ticket_code: code },
      include: [
        {
          model: Event,
          include: [{ model: Venue }]
        },
        {
          model: TicketType
        },
        {
          model: Payment
        }
      ],
      transaction
    });
    
    if (!ticket) {
      await transaction.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Ticket not found'
      });
    }
    
    // Check if user is authorized (ticket owner, event organizer, or admin)
    const isOwner = ticket.user_id === req.user.id;
    const isEventOrganizer = ticket.Event.created_by === req.user.id;
    const isAdmin = req.user.Roles.some(role => role.name === 'admin');
    
    if (!isOwner && !isEventOrganizer && !isAdmin) {
      await transaction.rollback();
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to cancel this ticket'
      });
    }
    
    // Check if ticket can be cancelled
    if (ticket.status === 'cancelled') {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Ticket is already cancelled'
      });
    }
    
    if (ticket.checked_in) {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Cannot cancel ticket that has been checked in'
      });
    }
    
    // If payment has been made, process refund
    if (ticket.payment_status === 'completed' && ticket.Payments.length > 0) {
      await paymentService.processRefund({
        payment_id: ticket.Payments[0].id
      }, reason || 'Ticket cancelled by user');
    } else {
      // Just update ticket status
      await ticket.update({
        status: 'cancelled',
        payment_status: ticket.payment_status === 'pending' ? 'failed' : ticket.payment_status
      }, { transaction });
      
      // Update ticket type sold count
      await TicketType.update(
        {
          tickets_sold: db.sequelize.literal(`tickets_sold - ${ticket.quantity}`)
        },
        {
          where: { id: ticket.ticket_type_id },
          transaction
        }
      );
    }
    
    // Commit transaction
    await transaction.commit();
    
    // Return updated ticket
    res.status(200).json({
      status: 'success',
      message: 'Ticket cancelled successfully',
      data: {
        ticket
      }
    });
    
    // Send email notification (don't wait for it)
    emailService.sendEmail(ticket.purchaser_email, 'Ticket Cancellation', 'generic', {
      name: ticket.purchaser_name,
      message: `Your ticket (${ticket.ticket_code}) for ${ticket.Event.title} has been cancelled. ${reason ? `Reason: ${reason}` : ''}`
    }).catch(err => {
      logger.error(`Failed to send ticket cancellation email: ${err.message}`);
    });
  } catch (error) {
    await transaction.rollback();
    logger.error(`Error cancelling ticket: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to cancel ticket'
    });
  }
};

/**
 * Process ticket payment
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
      where: { ticket_code: code }
    });
    
    if (!ticket) {
      return res.status(404).json({
        status: 'error',
        message: 'Ticket not found'
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
      payment_details
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
  } catch (error) {
    logger.error(`Error processing payment: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process payment'
    });
  }
};

/**
 * Render ticket verification page
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.renderVerifyPage = async (req, res) => {
  try {
    // Render ticket verification page
    res.render('tickets/verify', {
      title: 'Verify Ticket',
      user: req.user
    });
  } catch (error) {
    logger.error(`Error rendering verify page: ${error.message}`);
    req.flash('error_msg', 'Error loading verification page');
    res.redirect('/dashboard');
  }
};

/**
 * Render ticket details page
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.renderTicketDetails = async (req, res) => {
  try {
    const { code } = req.params;
    
    // Get ticket
    const ticket = await Ticket.findOne({
      where: { ticket_code: code },
      include: [
        {
          model: Event,
          include: [{ model: Venue }]
        },
        {
          model: TicketType
        },
        {
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
        }
      ]
    });
    
    if (!ticket) {
      req.flash('error_msg', 'Ticket not found');
      return res.redirect('/dashboard');
    }
    
    // Check if user is authorized
    const isOwner = ticket.user_id === req.user.id;
    const isEventOrganizer = ticket.Event.created_by === req.user.id;
    const isAdmin = req.user.Roles.some(role => role.name === 'admin');
    
    if (!isOwner && !isEventOrganizer && !isAdmin) {
      req.flash('error_msg', 'Not authorized to view this ticket');
      return res.redirect('/dashboard');
    }
    
    // Render ticket details page
    res.render('tickets/details', {
      title: 'Ticket Details',
      ticket,
      event: ticket.Event,
      formattedDate: helpers.formatDate(ticket.Event.start_date),
      formattedTime: helpers.formatTime(ticket.Event.start_time)
    });
  } catch (error) {
    logger.error(`Error rendering ticket details: ${error.message}`);
    req.flash('error_msg', 'Error loading ticket details');
    res.redirect('/dashboard');
  }
};

/**
 * Render ticket purchase page
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.renderPurchasePage = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Get event
    const event = await Event.findByPk(eventId, {
      include: [
        { 
          model: Venue 
        },
        {
          model: TicketType,
          where: {
            is_active: true
          },
          required: false
        }
      ]
    });
    
    if (!event) {
      req.flash('error_msg', 'Event not found');
      return res.redirect('/events');
    }
    
    // Check if event is published
    if (event.status !== 'published') {
      req.flash('error_msg', 'Event is not available for ticket purchases');
      return res.redirect(`/events/${eventId}`);
    }
    
    // Check if event has active ticket types
    if (!event.TicketTypes || event.TicketTypes.length === 0) {
      req.flash('error_msg', 'No ticket types available for this event');
      return res.redirect(`/events/${eventId}`);
    }
    
    // Get payment methods
    const paymentMethods = await PaymentMethod.findAll({
      where: { is_active: true }
    });
    
    // Render purchase page
    res.render('tickets/purchase', {
      title: 'Purchase Tickets',
      event,
      ticketTypes: event.TicketTypes,
      paymentMethods,
      formattedDate: helpers.formatDate(event.start_date),
      formattedTime: helpers.formatTime(event.start_time)
    });
  } catch (error) {
    logger.error(`Error rendering purchase page: ${error.message}`);
    req.flash('error_msg', 'Error loading purchase page');
    res.redirect('/events');
  }
};

/**
 * Process ticket payment
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
          include: [{
            model: db.Venue
          }]
        }
      ]
    });
    
    if (!ticket) {
      return res.status(404).json({
        status: 'error',
        message: 'Ticket not found'
      });
    }
    
    // Check if ticket belongs to user or is admin
    const isOwner = ticket.user_id === req.user.id;
    const isAdmin = req.user.Roles.some(role => role.name === 'admin');
    
    if (!isOwner && !isAdmin) {
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
    
    // Process payment using payment service
    const payment = await paymentService.processPayment({
      ticket_id: ticket.id,
      user_id: req.user.id,
      payment_method_id,
      amount: ticket.total_amount,
      transaction_reference: transaction_reference || paymentService.generateTransactionReference(),
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
      logger.error(`Failed to send ticket confirmation email: ${err.message}`);
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
        logger.error(`Failed to send ticket confirmation WhatsApp: ${err.message}`);
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

module.exports = exports;