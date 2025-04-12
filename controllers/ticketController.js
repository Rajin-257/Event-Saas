const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { generateQR } = require('../helpers/qrGenerator');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const dateFormatter = require('../utils/dateFormatter');

// Get all tickets for an event
exports.getEventTickets = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findByPk(eventId);
    
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }
    
    const tickets = await Ticket.findAll({
      where: { eventId },
      order: [['price', 'ASC']]
    });
    
    res.render('tickets/index', {
      title: `Tickets - ${event.title}`,
      event,
      tickets,
      dateFormatter,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error fetching tickets', { error: error.message });
    req.flash('error', 'Failed to fetch tickets');
    res.redirect('/events');
  }
};

// Show create ticket form
exports.getCreateTicket = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findByPk(eventId);
    
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }
    
    res.render('tickets/create', {
      title: `Create Ticket - ${event.title}`,
      event,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error loading create ticket page', { error: error.message });
    req.flash('error', 'Failed to load create ticket page');
    res.redirect(`/events/${req.params.eventId}`);
  }
};

// Process ticket creation
exports.postCreateTicket = async (req, res) => {
  try {
    const { eventId } = req.params;
    const {
      type,
      price,
      quantity,
      description,
      saleStartDate,
      saleEndDate
    } = req.body;
    
    const event = await Event.findByPk(eventId);
    
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }
    
    await Ticket.create({
      eventId,
      type,
      price,
      quantity,
      description,
      saleStartDate,
      saleEndDate,
      isActive: true
    });
    
    logger.info(`Ticket created for event: ${event.title}`, { userId: req.user.id, eventId });
    
    req.flash('success', 'Ticket created successfully');
    res.redirect(`/tickets/event/${eventId}`);
  } catch (error) {
    logger.error('Ticket creation error', { error: error.message });
    req.flash('error', 'Failed to create ticket');
    res.redirect(`/tickets/event/${req.params.eventId}/create`);
  }
};

// Show edit ticket form
exports.getEditTicket = async (req, res) => {
  try {
    const { id } = req.params;
    
    const ticket = await Ticket.findByPk(id, {
      include: [{ model: Event, as: 'event' }]
    });
    
    if (!ticket) {
      req.flash('error', 'Ticket not found');
      return res.redirect('/events');
    }
    
    res.render('tickets/edit', {
      title: `Edit Ticket - ${ticket.type}`,
      ticket,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error loading edit ticket page', { error: error.message });
    req.flash('error', 'Failed to load edit ticket page');
    res.redirect('/events');
  }
};

// Process ticket update
exports.postUpdateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type,
      price,
      quantity,
      description,
      saleStartDate,
      saleEndDate,
      isActive
    } = req.body;
    
    const ticket = await Ticket.findByPk(id, {
      include: [{ model: Event, as: 'event' }]
    });
    
    if (!ticket) {
      req.flash('error', 'Ticket not found');
      return res.redirect('/events');
    }
    
    // Get sold quantity
    const soldCount = await Booking.sum('quantity', {
      where: {
        ticketId: id,
        status: { [Op.ne]: 'Cancelled' }
      }
    });
    
    // Check if new quantity is less than sold quantity
    if (quantity < soldCount) {
      req.flash('error', `Cannot reduce quantity below sold amount (${soldCount})`);
      return res.redirect(`/tickets/${id}/edit`);
    }
    
    // Update ticket
    ticket.type = type;
    ticket.price = price;
    ticket.quantity = quantity;
    ticket.description = description;
    ticket.saleStartDate = saleStartDate;
    ticket.saleEndDate = saleEndDate;
    ticket.isActive = isActive === 'on';
    
    await ticket.save();
    
    logger.info(`Ticket updated: ${ticket.type}`, { userId: req.user.id, ticketId: id });
    
    req.flash('success', 'Ticket updated successfully');
    res.redirect(`/tickets/event/${ticket.eventId}`);
  } catch (error) {
    logger.error('Ticket update error', { error: error.message });
    req.flash('error', 'Failed to update ticket');
    res.redirect(`/tickets/${req.params.id}/edit`);
  }
};

// Delete ticket
exports.deleteTicket = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    const ticket = await Ticket.findByPk(id, { transaction });
    
    if (!ticket) {
      await transaction.rollback();
      req.flash('error', 'Ticket not found');
      return res.redirect('/events');
    }
    
    // Check if ticket has bookings
    const bookingsCount = await Booking.count({
      where: { ticketId: id },
      transaction
    });
    
    if (bookingsCount > 0) {
      await transaction.rollback();
      req.flash('error', 'Cannot delete ticket with bookings');
      return res.redirect(`/tickets/event/${ticket.eventId}`);
    }
    
    // Delete ticket
    await ticket.destroy({ transaction });
    
    await transaction.commit();
    
    logger.info(`Ticket deleted: ${ticket.type}`, { userId: req.user.id, ticketId: id });
    
    req.flash('success', 'Ticket deleted successfully');
    res.redirect(`/tickets/event/${ticket.eventId}`);
  } catch (error) {
    await transaction.rollback();
    logger.error('Ticket deletion error', { error: error.message });
    req.flash('error', 'Failed to delete ticket');
    res.redirect(`/events`);
  }
};

// QR code verification
exports.verifyTicket = async (req, res) => {
  try {
    const { code } = req.body;
    
    // Decode QR data
    let bookingData;
    try {
      bookingData = JSON.parse(code);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code'
      });
    }
    
    // Find booking
    const booking = await Booking.findOne({
      where: {
        id: bookingData.bookingId,
        status: 'Confirmed',
        paymentStatus: 'Paid'
      },
      include: [
        { model: Event, as: 'event' },
        { model: Ticket, as: 'ticket' },
        { model: User, as: 'user' }
      ]
    });
    
    if (!booking) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or cancelled booking'
      });
    }
    
    // Check if already checked in
    if (booking.isCheckedIn) {
      return res.status(400).json({
        success: false,
        message: 'Ticket already used for entry',
        booking: {
          id: booking.id,
          eventTitle: booking.event.title,
          ticketType: booking.ticket.type,
          username: booking.user.fullName,
          checkedInAt: dateFormatter.formatDateTime(booking.checkedInAt)
        }
      });
    }
    
    // Mark as checked in
    booking.isCheckedIn = true;
    booking.checkedInAt = new Date();
    booking.checkedInBy = req.user.id;
    await booking.save();
    
    logger.info(`Ticket checked in: Booking #${booking.id}`, { 
      userId: req.user.id, 
      bookingId: booking.id,
      eventId: booking.eventId
    });
    
    return res.status(200).json({
      success: true,
      message: 'Ticket verified successfully',
      booking: {
        id: booking.id,
        eventTitle: booking.event.title,
        ticketType: booking.ticket.type,
        quantity: booking.quantity,
        username: booking.user.fullName,
        phone: booking.user.phone
      }
    });
  } catch (error) {
    logger.error('Ticket verification error', { error: error.message });
    return res.status(500).json({
      success: false,
      message: 'Error verifying ticket'
    });
  }
};

// Ticket checker dashboard
exports.getTicketCheckerDashboard = async (req, res) => {
  try {
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
      order: [['startDate', 'ASC']]
    });
    
    // Get recent check-ins
    const recentCheckIns = await Booking.findAll({
      where: {
        isCheckedIn: true,
        checkedInBy: req.user.id
      },
      limit: 10,
      order: [['checkedInAt', 'DESC']],
      include: [
        { model: Event, as: 'event' },
        { model: User, as: 'user' }
      ]
    });
    
    res.render('tickets/checker-dashboard', {
      title: 'Ticket Checker Dashboard',
      events,
      recentCheckIns,
      dateFormatter,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error loading ticket checker dashboard', { error: error.message });
    req.flash('error', 'Failed to load dashboard');
    res.redirect('/dashboard');
  }
};