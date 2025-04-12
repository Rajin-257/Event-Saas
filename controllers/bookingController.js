const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Referral = require('../models/Referral');
const { generateQR } = require('../helpers/qrGenerator');
const { getEmailTemplate } = require('../helpers/emailTemplates');
const { processBkashPayment, processNagadPayment, processCardPayment, processCashPayment } = require('../helpers/paymentHelpers');
const transporter = require('../config/mail');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const dateFormatter = require('../utils/dateFormatter');
const { Op } = require('sequelize');

// Get user bookings
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [
        { model: Event, as: 'event' },
        { model: Ticket, as: 'ticket' }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.render('bookings/user-bookings', {
      title: 'My Bookings',
      bookings,
      dateFormatter,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error fetching user bookings', { error: error.message });
    req.flash('error', 'Failed to fetch bookings');
    res.redirect('/dashboard');
  }
};

// Show booking form
exports.getBookingForm = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findByPk(eventId, {
      include: [
        { 
          model: Ticket, 
          as: 'tickets',
          where: {
            isActive: true,
            quantity: {
              [Op.gt]: sequelize.col('quantitySold')
            },
            saleStartDate: {
              [Op.lte]: new Date()
            },
            saleEndDate: {
              [Op.gte]: new Date()
            }
          },
          required: false
        }
      ]
    });
    
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }
    
    // Check if event is available for booking
    if (event.status === 'Completed' || new Date(event.endDate) < new Date()) {
      req.flash('error', 'This event has ended');
      return res.redirect(`/events/${eventId}`);
    }
    
    // Check if tickets are available
    if (!event.tickets || event.tickets.length === 0) {
      req.flash('error', 'No tickets available for this event');
      return res.redirect(`/events/${eventId}`);
    }
    
    res.render('bookings/book', {
      title: `Book Tickets - ${event.title}`,
      event,
      dateFormatter,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error loading booking form', { error: error.message });
    req.flash('error', 'Failed to load booking form');
    res.redirect(`/events/${req.params.eventId}`);
  }
};

// Process booking (first step)
exports.postInitiateBooking = async (req, res) => {
  try {
    const { eventId, ticketId, quantity, promoCode, referralCode } = req.body;
    
    // Validate inputs
    if (!ticketId || !quantity || quantity < 1) {
      req.flash('error', 'Invalid ticket selection');
      return res.redirect(`/bookings/event/${eventId}`);
    }
    
    // Get ticket and event
    const ticket = await Ticket.findByPk(ticketId, {
      include: [{ model: Event, as: 'event' }]
    });
    
    if (!ticket || ticket.eventId != eventId) {
      req.flash('error', 'Invalid ticket selection');
      return res.redirect(`/bookings/event/${eventId}`);
    }
    
    // Check ticket availability
    if (ticket.quantity - ticket.quantitySold < quantity) {
      req.flash('error', 'Not enough tickets available');
      return res.redirect(`/bookings/event/${eventId}`);
    }
    
    // Calculate total amount
    let totalAmount = ticket.price * quantity;
    let discountAmount = 0;
    
    // Apply promo code if provided
    if (promoCode) {
      // Implement promo code logic here
      // For example:
      if (promoCode === 'FIRST10') {
        discountAmount = totalAmount * 0.1; // 10% off
      }
    }
    
    // Verify referral code if provided
    let referral = null;
    if (referralCode) {
      referral = await Referral.findOne({
        where: { 
          code: referralCode,
          isActive: true
        }
      });
      
      // Don't allow self-referral
      if (referral && referral.userId === req.user.id) {
        referral = null;
      }
    }
    
    // Store booking data in session
    req.session.bookingData = {
      eventId,
      ticketId,
      quantity,
      totalAmount: totalAmount - discountAmount,
      discountAmount,
      promoCode,
      referralCode: referral ? referralCode : null,
      verifiedEmail: false,
      verifiedPhone: false
    };
    
    res.render('bookings/verify', {
      title: 'Verify Contact',
      email: req.user.email,
      phone: req.user.phone,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Booking initiation error', { error: error.message });
    req.flash('error', 'Failed to initiate booking');
    res.redirect(`/bookings/event/${req.body.eventId}`);
  }
};

// Show checkout page
exports.getCheckout = async (req, res) => {
  try {
    // Check if booking data exists in session
    if (!req.session.bookingData) {
      req.flash('error', 'Booking session expired');
      return res.redirect('/events');
    }
    
    // Check if verification is complete
    if (!req.session.bookingData.verifiedEmail && !req.session.bookingData.verifiedPhone) {
      req.flash('error', 'Please verify your contact information');
      return res.redirect(`/bookings/event/${req.session.bookingData.eventId}`);
    }
    
    const { eventId, ticketId, quantity, totalAmount, discountAmount, promoCode, referralCode } = req.session.bookingData;
    
    // Get ticket and event details
    const ticket = await Ticket.findByPk(ticketId, {
      include: [{ model: Event, as: 'event' }]
    });
    
    if (!ticket) {
      req.flash('error', 'Invalid ticket');
      return res.redirect('/events');
    }
    
    res.render('bookings/checkout', {
      title: 'Checkout',
      ticket,
      quantity,
      totalAmount,
      discountAmount,
      promoCode,
      referralCode,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Checkout error', { error: error.message });
    req.flash('error', 'Failed to load checkout page');
    res.redirect('/events');
  }
};

// Process payment and complete booking
exports.postCompleteBooking = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Check if booking data exists in session
    if (!req.session.bookingData) {
      req.flash('error', 'Booking session expired');
      return res.redirect('/events');
    }
    
    const { eventId, ticketId, quantity, totalAmount, discountAmount, promoCode, referralCode } = req.session.bookingData;
    const { paymentMethod, cardDetails } = req.body;
    
    // Get ticket
    const ticket = await Ticket.findByPk(ticketId, {
      include: [{ model: Event, as: 'event' }],
      transaction
    });
    
    if (!ticket) {
      await transaction.rollback();
      req.flash('error', 'Invalid ticket');
      return res.redirect('/events');
    }
    
    // Check ticket availability again
    if (ticket.quantity - ticket.quantitySold < quantity) {
      await transaction.rollback();
      req.flash('error', 'Not enough tickets available');
      return res.redirect(`/bookings/event/${eventId}`);
    }
    
    // Process payment based on method
    let paymentResult;
    let paymentStatus = 'Pending';
    
    if (paymentMethod === 'Bkash') {
      paymentResult = await processBkashPayment(totalAmount, req.user.phone, `TICKET-${ticketId}`);
    } else if (paymentMethod === 'Nagad') {
      paymentResult = await processNagadPayment(totalAmount, req.user.phone, `TICKET-${ticketId}`);
    } else if (paymentMethod === 'Card') {
      paymentResult = await processCardPayment(cardDetails, totalAmount, `TICKET-${ticketId}`);
    } else if (paymentMethod === 'Cash') {
      paymentResult = await processCashPayment(totalAmount, `TICKET-${ticketId}`, req.user.id);
    } else {
      await transaction.rollback();
      req.flash('error', 'Invalid payment method');
      return res.redirect('/bookings/checkout');
    }
    
    if (!paymentResult.success) {
      await transaction.rollback();
      req.flash('error', paymentResult.message || 'Payment failed');
      return res.redirect('/bookings/checkout');
    }
    
    // Payment successful
    paymentStatus = 'Paid';
    
    // Create booking
    const booking = await Booking.create({
      userId: req.user.id,
      eventId,
      ticketId,
      quantity,
      totalAmount,
      discountAmount,
      promoCode,
      referralCode,
      status: 'Confirmed',
      paymentMethod,
      paymentStatus,
      transactionId: paymentResult.transactionId
    }, { transaction });
    
    // Update ticket sold quantity
    ticket.quantitySold += parseInt(quantity);
    await ticket.save({ transaction });
    
    // Update referral usage if applicable
    if (referralCode) {
      const referral = await Referral.findOne({
        where: { code: referralCode },
        transaction
      });
      
      if (referral) {
        referral.usageCount += 1;
        referral.totalEarnings += (totalAmount * (referral.commissionPercentage / 100));
        await referral.save({ transaction });
      }
    }
    
    // Generate QR code
    const qrData = {
      bookingId: booking.id,
      eventId: eventId,
      ticketId: ticketId,
      userId: req.user.id,
      quantity: quantity
    };
    
    const qrCodePath = await generateQR(qrData, `booking-${booking.id}`);
    
    // Update booking with QR code
    booking.qrCode = qrCodePath;
    await booking.save({ transaction });
    
    // Commit transaction
    await transaction.commit();
    
    // Send confirmation email
    const emailData = {
      userName: req.user.fullName,
      bookingId: booking.id,
      eventTitle: ticket.event.title,
      eventDate: dateFormatter.formatDateTime(ticket.event.startDate),
      venue: ticket.event.venue,
      ticketType: ticket.type,
      quantity: quantity,
      currency: 'BDT',
      totalAmount: totalAmount,
      qrCodeUrl: `${process.env.BASE_URL}${qrCodePath}`
    };
    
    const mailOptions = getEmailTemplate('booking_confirmation', emailData);
    
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: req.user.email,
      subject: mailOptions.subject,
      html: mailOptions.html
    });
    
    // Clear booking data from session
    delete req.session.bookingData;
    
    logger.info(`Booking completed: #${booking.id}`, { 
      userId: req.user.id, 
      bookingId: booking.id,
      amount: totalAmount
    });
    
    req.flash('success', 'Booking completed successfully');
    res.redirect(`/bookings/${booking.id}`);
  } catch (error) {
    await transaction.rollback();
    logger.error('Booking completion error', { error: error.message });
    req.flash('error', 'Failed to complete booking');
    res.redirect('/bookings/checkout');
  }
};

// Show booking details
exports.getBookingDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findByPk(id, {
      include: [
        { model: Event, as: 'event' },
        { model: Ticket, as: 'ticket' },
        { model: User, as: 'user' }
      ]
    });
    
    if (!booking) {
      req.flash('error', 'Booking not found');
      return res.redirect('/bookings');
    }
    
    // Check if user is authorized to view this booking
    if (booking.userId !== req.user.id && !['SuperAdmin', 'Admin', 'Office Staff'].includes(req.user.role)) {
      req.flash('error', 'You are not authorized to view this booking');
      return res.redirect('/bookings');
    }
    
    res.render('bookings/details', {
      title: `Booking #${booking.id}`,
      booking,
      dateFormatter,
      isAdmin: ['SuperAdmin', 'Admin'].includes(req.user.role),
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error fetching booking details', { error: error.message });
    req.flash('error', 'Failed to fetch booking details');
    res.redirect('/bookings');
  }
};

// Cancel booking (user or admin)
exports.cancelBooking = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    const booking = await Booking.findByPk(id, {
      include: [{ model: Ticket, as: 'ticket' }],
      transaction
    });
    
    if (!booking) {
      await transaction.rollback();
      req.flash('error', 'Booking not found');
      return res.redirect('/bookings');
    }
    
    // Check if user is authorized to cancel this booking
    if (booking.userId !== req.user.id && !['SuperAdmin', 'Admin'].includes(req.user.role)) {
      await transaction.rollback();
      req.flash('error', 'You are not authorized to cancel this booking');
      return res.redirect('/bookings');
    }
    
    // Check if booking is already cancelled or used
    if (booking.status === 'Cancelled') {
      await transaction.rollback();
      req.flash('error', 'Booking is already cancelled');
      return res.redirect(`/bookings/${id}`);
    }
    
    if (booking.isCheckedIn) {
      await transaction.rollback();
      req.flash('error', 'Cannot cancel booking after check-in');
      return res.redirect(`/bookings/${id}`);
    }
    
    // Update booking status
    booking.status = 'Cancelled';
    
    // If payment was made, set status to Refunded for manual processing
    if (booking.paymentStatus === 'Paid') {
      booking.paymentStatus = 'Refunded';
    }
    
    await booking.save({ transaction });
    
    // Update ticket quantity
    const ticket = await Ticket.findByPk(booking.ticketId, { transaction });
    
    if (ticket) {
      ticket.quantitySold -= booking.quantity;
      await ticket.save({ transaction });
    }
    
    await transaction.commit();
    
    logger.info(`Booking cancelled: #${booking.id}`, { 
      userId: req.user.id, 
      bookingId: booking.id
    });
    
    req.flash('success', 'Booking cancelled successfully');
    res.redirect(`/bookings/${id}`);
  } catch (error) {
    await transaction.rollback();
    logger.error('Booking cancellation error', { error: error.message });
    req.flash('error', 'Failed to cancel booking');
    res.redirect(`/bookings/${req.params.id}`);
  }
};

// Admin: All bookings
exports.getAllBookings = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    
    // Filters
    const filters = {};
    
    if (req.query.status) {
      filters.status = req.query.status;
    }
    
    if (req.query.eventId) {
      filters.eventId = req.query.eventId;
    }
    
    if (req.query.paymentMethod) {
      filters.paymentMethod = req.query.paymentMethod;
    }
    
    // Get bookings
    const { count, rows: bookings } = await Booking.findAndCountAll({
      where: filters,
      include: [
        { model: Event, as: 'event' },
        { model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'phone'] }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    // Get all events for filter
    const events = await Event.findAll({
      attributes: ['id', 'title'],
      order: [['title', 'ASC']]
    });
    
    res.render('bookings/admin-index', {
      title: 'All Bookings',
      bookings,
      events,
      filters: req.query,
      pagination: {
        page,
        pageCount: Math.ceil(count / limit),
        count
      },
      dateFormatter,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error fetching all bookings', { error: error.message });
    req.flash('error', 'Failed to fetch bookings');
    res.redirect('/admin/dashboard');
  }
};

// Add to controllers/bookingController.js

// Update payment status (admin only)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    
    // Validate status
    if (!['Pending', 'Paid', 'Failed', 'Refunded'].includes(paymentStatus)) {
      req.flash('error', 'Invalid payment status');
      return res.redirect(`/bookings/${id}`);
    }
    
    const booking = await Booking.findByPk(id);
    
    if (!booking) {
      req.flash('error', 'Booking not found');
      return res.redirect('/bookings/admin/all');
    }
    
    booking.paymentStatus = paymentStatus;
    await booking.save();
    
    logger.info(`Booking payment status updated to ${paymentStatus}`, { 
      userId: req.user.id, 
      bookingId: id 
    });
    
    req.flash('success', 'Payment status updated successfully');
    res.redirect(`/bookings/${id}`);
  } catch (error) {
    logger.error('Payment status update error', { error: error.message });
    req.flash('error', 'Failed to update payment status');
    res.redirect(`/bookings/${req.params.id}`);
  }
};

// Admin check-in
exports.adminCheckIn = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findByPk(id);
    
    if (!booking) {
      req.flash('error', 'Booking not found');
      return res.redirect('/bookings/admin/all');
    }
    
    if (booking.status !== 'Confirmed' || booking.paymentStatus !== 'Paid') {
      req.flash('error', 'Booking must be confirmed and paid to check in');
      return res.redirect(`/bookings/${id}`);
    }
    
    if (booking.isCheckedIn) {
      req.flash('error', 'Booking already checked in');
      return res.redirect(`/bookings/${id}`);
    }
    
    booking.isCheckedIn = true;
    booking.checkedInAt = new Date();
    booking.checkedInBy = req.user.id;
    await booking.save();
    
    logger.info(`Manual check-in for booking #${booking.id}`, { 
      userId: req.user.id, 
      bookingId: id 
    });
    
    req.flash('success', 'Booking checked in successfully');
    res.redirect(`/bookings/${id}`);
  } catch (error) {
    logger.error('Manual check-in error', { error: error.message });
    req.flash('error', 'Failed to check in booking');
    res.redirect(`/bookings/${req.params.id}`);
  }
};

// Update booking notes
exports.updateNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    const booking = await Booking.findByPk(id);
    
    if (!booking) {
      req.flash('error', 'Booking not found');
      return res.redirect('/bookings/admin/all');
    }
    
    booking.adminNotes = notes;
    await booking.save();
    
    logger.info(`Booking notes updated`, { 
      userId: req.user.id, 
      bookingId: id 
    });
    
    req.flash('success', 'Notes updated successfully');
    res.redirect(`/bookings/${id}`);
  } catch (error) {
    logger.error('Notes update error', { error: error.message });
    req.flash('error', 'Failed to update notes');
    res.redirect(`/bookings/${req.params.id}`);
  }
};