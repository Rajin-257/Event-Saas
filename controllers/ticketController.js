const { Ticket, TicketType } = require('../models/Ticket');
const Event = require('../models/Event');
const User = require('../models/User');
const { Coupon, CouponUsage } = require('../models/Coupon');
const Payment = require('../models/Payment');
const { Referral } = require('../models/Referral');
const qrService = require('../services/qrService');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

module.exports = {
  // Manage Ticket Types
  getManageTicketTypes: async (req, res) => {
    try {
      const eventId = req.params.id;
      
      const [event, ticketTypes] = await Promise.all([
        Event.findByPk(eventId),
        TicketType.findAll({ where: { eventId } })
      ]);
      
      if (!event) {
        req.flash('error_msg', 'Event not found');
        return res.redirect('/dashboard');
      }

      res.render('events/tickets', { 
        title: 'Manage Ticket Types',
        event,
        ticketTypes
      });
    } catch (err) {
      console.error('Error loading ticket types:', err);
      req.flash('error_msg', 'Error loading ticket types');
      res.redirect(`/events/${req.params.id}/edit`);
    }
  },

  // Add new ticket type
  addTicketType: async (req, res) => {
    try {
      const eventId = req.params.id;
      const { 
        name, description, price, quantity, type,
        saleStartDate, saleEndDate 
      } = req.body;

      // Validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('events/tickets', {
          title: 'Manage Ticket Types',
          errors: errors.array(),
          formData: req.body,
          event: { id: eventId }
        });
      }

      // Create ticket type
      await TicketType.create({
        eventId,
        name,
        description,
        price,
        quantity,
        availableQuantity: quantity,
        type,
        saleStartDate,
        saleEndDate,
        isActive: true
      });

      req.flash('success_msg', 'Ticket type added successfully');
      res.redirect(`/tickets/events/${eventId}/tickets`);
    } catch (err) {
      console.error('Error adding ticket type:', err);
      req.flash('error_msg', 'Error adding ticket type');
      res.redirect(`/tickets/events/${req.params.id}/tickets`);
    }
  },

  // Update ticket type
  updateTicketType: async (req, res) => {
    try {
      const eventId = req.params.id;
      const ticketTypeId = req.params.ticketTypeId;
      
      const { 
        name, description, price, quantity, type,
        saleStartDate, saleEndDate, isActive 
      } = req.body;

      // Validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('events/edit-ticket', {
          title: 'Edit Ticket Type',
          errors: errors.array(),
          ticketType: { id: ticketTypeId, ...req.body },
          event: { id: eventId }
        });
      }

      const ticketType = await TicketType.findByPk(ticketTypeId);
      
      if (!ticketType || ticketType.eventId !== eventId) {
        req.flash('error_msg', 'Ticket type not found');
        return res.redirect(`/events/${eventId}/tickets`);
      }

      // Calculate tickets sold
      const ticketsSold = ticketType.quantity - ticketType.availableQuantity;
      
      // Ensure new quantity is not less than tickets already sold
      const newQuantity = parseInt(quantity);
      if (newQuantity < ticketsSold) {
        req.flash('error_msg', 'Cannot reduce quantity below tickets already sold');
        return res.redirect(`/events/${eventId}/tickets/${ticketTypeId}/edit`);
      }

      // Update availableQuantity based on new total quantity and tickets sold
      const newAvailableQuantity = newQuantity - ticketsSold;

      // Update ticket type
      await ticketType.update({
        name,
        description,
        price,
        quantity: newQuantity,
        availableQuantity: newAvailableQuantity,
        type,
        saleStartDate,
        saleEndDate,
        isActive: isActive === 'on' || isActive === true
      });

      req.flash('success_msg', 'Ticket type updated successfully');
      res.redirect(`/events/${eventId}/tickets`);
    } catch (err) {
      console.error('Error updating ticket type:', err);
      req.flash('error_msg', 'Error updating ticket type');
      res.redirect(`/events/${req.params.id}/tickets`);
    }
  },

  // Delete ticket type
  deleteTicketType: async (req, res) => {
    try {
      const eventId = req.params.id;
      const ticketTypeId = req.params.ticketTypeId;
      
      const ticketType = await TicketType.findByPk(ticketTypeId);
      
      if (!ticketType || ticketType.eventId !== eventId) {
        req.flash('error_msg', 'Ticket type not found');
        return res.redirect(`/events/${eventId}/tickets`);
      }

      // Check if any tickets have been sold
      const ticketsSold = await Ticket.count({ where: { ticketTypeId } });
      
      if (ticketsSold > 0) {
        req.flash('error_msg', 'Cannot delete ticket type with sold tickets');
        return res.redirect(`/events/${eventId}/tickets`);
      }

      // Delete ticket type
      await ticketType.destroy();

      req.flash('success_msg', 'Ticket type deleted successfully');
      res.redirect(`/events/${eventId}/tickets`);
    } catch (err) {
      console.error('Error deleting ticket type:', err);
      req.flash('error_msg', 'Error deleting ticket type');
      res.redirect(`/events/${req.params.id}/tickets`);
    }
  },

  // Book ticket (Step 1: Select tickets)
  getBookTickets: async (req, res) => {
    try {
      const eventId = req.params.id;
      
      const [event, ticketTypes] = await Promise.all([
        Event.findByPk(eventId, {
          include: [{
            model: User,
            as: 'organizer',
            attributes: ['name']
          }]
        }),
        TicketType.findAll({ 
          where: { 
            eventId,
            isActive: true,
            availableQuantity: { [Op.gt]: 0 }
          }
        })
      ]);
      
      if (!event) {
        req.flash('error_msg', 'Event not found');
        return res.redirect('/events');
      }

      // Check if event is published
      if (!event.isPublished) {
        req.flash('error_msg', 'Tickets are not available for this event');
        return res.redirect(`/events/${eventId}`);
      }

      // Check if event has started
      const now = new Date();
      if (new Date(event.startDate) < now) {
        req.flash('error_msg', 'This event has already started');
        return res.redirect(`/events/${eventId}`);
      }

      res.render('tickets/book', { 
        title: 'Book Tickets',
        event,
        ticketTypes,
        refCode: req.query.ref || null
      });
    } catch (err) {
      console.error('Error loading booking page:', err);
      req.flash('error_msg', 'Error loading booking page');
      res.redirect(`/events/${req.params.id}`);
    }
  },

  // Book ticket (Step 2: Checkout)
  getCheckout: async (req, res) => {
    try {
      const eventId = req.params.id;
      const ticketTypeId = req.params.ticketTypeId;
      const quantity = parseInt(req.query.qty) || 1;
      const refCode = req.query.ref || null;
      
      // Get ticket type details
      const [event, ticketType] = await Promise.all([
        Event.findByPk(eventId),
        TicketType.findByPk(ticketTypeId)
      ]);
      
      if (!event || !ticketType || ticketType.eventId !== eventId) {
        req.flash('error_msg', 'Invalid ticket selection');
        return res.redirect(`/events/${eventId}/book`);
      }

      // Calculate total price
      const totalPrice = ticketType.price * quantity;

      // Get referrer if referral code provided
      let referrer = null;
      if (refCode) {
        referrer = await User.findOne({ where: { referralCode: refCode } });
      }

      res.render('tickets/checkout', { 
        title: 'Checkout',
        event,
        ticketType,
        quantity,
        totalPrice,
        referrer,
        refCode
      });
    } catch (err) {
      console.error('Error loading checkout page:', err);
      req.flash('error_msg', 'Error processing ticket selection');
      res.redirect(`/events/${req.params.id}/book`);
    }
  },

  // Apply coupon code
  applyCoupon: async (req, res) => {
    try {
      const { eventId, ticketTypeId, quantity, couponCode } = req.body;
      
      // Get ticket type details
      const [event, ticketType, coupon] = await Promise.all([
        Event.findByPk(eventId),
        TicketType.findByPk(ticketTypeId),
        Coupon.findOne({ 
          where: { 
            code: couponCode,
            isActive: true
          }
        })
      ]);
      
      if (!event || !ticketType) {
        return res.json({
          success: false,
          message: 'Invalid ticket selection'
        });
      }

      // Calculate base price
      const basePrice = ticketType.price * quantity;

      // Validate coupon
      if (!coupon) {
        return res.json({
          success: false,
          message: 'Invalid coupon code'
        });
      }

      // Check coupon validity period
      const now = new Date();
      if (new Date(coupon.startDate) > now || new Date(coupon.endDate) < now) {
        return res.json({
          success: false,
          message: 'Coupon has expired or not active yet'
        });
      }

      // Check if coupon is for specific event
      if (coupon.eventId && coupon.eventId !== eventId) {
        return res.json({
          success: false,
          message: 'Coupon not valid for this event'
        });
      }

      // Check minimum purchase amount
      if (coupon.minPurchaseAmount && basePrice < coupon.minPurchaseAmount) {
        return res.json({
          success: false,
          message: `Minimum purchase amount is ${coupon.minPurchaseAmount}`
        });
      }

      // Check usage limit
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return res.json({
          success: false,
          message: 'Coupon usage limit exceeded'
        });
      }

      // Calculate discount
      let discountAmount = 0;
      if (coupon.discountType === 'percentage') {
        discountAmount = (basePrice * coupon.discountValue) / 100;
        // Check max discount if applicable
        if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
          discountAmount = coupon.maxDiscountAmount;
        }
      } else {
        discountAmount = coupon.discountValue;
        // Ensure discount doesn't exceed ticket price
        if (discountAmount > basePrice) {
          discountAmount = basePrice;
        }
      }

      // Calculate final price
      const finalPrice = basePrice - discountAmount;

      return res.json({
        success: true,
        basePrice,
        discountAmount,
        finalPrice,
        couponCode,
        message: 'Coupon applied successfully'
      });
    } catch (err) {
      console.error('Error applying coupon:', err);
      return res.json({
        success: false,
        message: 'Error applying coupon'
      });
    }
  },

  // Process payment and complete booking
  completeBooking: async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
      const { 
        eventId, ticketTypeId, quantity, paymentMethod,
        couponCode, manualPaymentInfo, refCode 
      } = req.body;
      
      // Get ticket type details
      const [event, ticketType] = await Promise.all([
        Event.findByPk(eventId, { transaction }),
        TicketType.findByPk(ticketTypeId, { transaction })
      ]);
      
      if (!event || !ticketType) {
        await transaction.rollback();
        req.flash('error_msg', 'Invalid ticket selection');
        return res.redirect(`/events/${eventId}/book`);
      }

      // Check ticket availability
      if (ticketType.availableQuantity < quantity) {
        await transaction.rollback();
        req.flash('error_msg', 'Not enough tickets available');
        return res.redirect(`/events/${eventId}/book`);
      }

      // Calculate base price
      const basePrice = ticketType.price * quantity;
      let discountAmount = 0;
      let finalPrice = basePrice;
      let coupon = null;

      // Apply coupon if provided
      if (couponCode) {
        coupon = await Coupon.findOne({ 
          where: { 
            code: couponCode,
            isActive: true
          },
          transaction
        });
        
        if (coupon) {
          // Calculate discount
          if (coupon.discountType === 'percentage') {
            discountAmount = (basePrice * coupon.discountValue) / 100;
            // Check max discount if applicable
            if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
              discountAmount = coupon.maxDiscountAmount;
            }
          } else {
            discountAmount = coupon.discountValue;
            // Ensure discount doesn't exceed ticket price
            if (discountAmount > basePrice) {
              discountAmount = basePrice;
            }
          }
          
          finalPrice = basePrice - discountAmount;
          
          // Increment coupon usage
          await coupon.update({
            usedCount: coupon.usedCount + 1
          }, { transaction });
        }
      }

      // Handle referral
      let referrerId = null;
      if (refCode) {
        const referrer = await User.findOne({ 
          where: { referralCode: refCode },
          transaction
        });
        
        if (referrer && referrer.id !== req.user.id) {
          referrerId = referrer.id;
        }
      }

      // Create tickets
      const tickets = [];
      for (let i = 0; i < quantity; i++) {
        const ticketNumber = `TKT-${uuidv4().slice(0, 8).toUpperCase()}`;
        const qrCode = await qrService.generateQRCode(ticketNumber);
        
        const ticket = await Ticket.create({
          ticketTypeId,
          eventId,
          userId: req.user.id,
          referrerId,
          purchasePrice: ticketType.price,
          discountAmount: discountAmount / quantity, // Divide discount equally among tickets
          finalPrice: finalPrice / quantity, // Divide final price equally among tickets
          ticketNumber,
          qrCode,
          status: 'booked',
          paymentStatus: paymentMethod === 'manual' ? 'pending' : 'completed'
        }, { transaction });
        
        tickets.push(ticket);
      }

      // Update ticket availability
      await ticketType.update({
        availableQuantity: ticketType.availableQuantity - quantity
      }, { transaction });

      // Create payment record
      const invoiceNumber = `INV-${uuidv4().slice(0, 8).toUpperCase()}`;
      
      const payment = await Payment.create({
        ticketId: tickets[0].id, // Link to first ticket
        userId: req.user.id,
        amount: finalPrice,
        paymentMethod,
        transactionId: paymentMethod === 'manual' ? null : `TXN-${uuidv4().slice(0, 8).toUpperCase()}`,
        status: paymentMethod === 'manual' ? 'pending' : 'completed',
        gatewayResponse: paymentMethod === 'manual' ? { info: manualPaymentInfo } : { success: true },
        invoiceNumber
      }, { transaction });

      // If coupon was used, record it
      if (coupon) {
        for (const ticket of tickets) {
          await CouponUsage.create({
            couponId: coupon.id,
            userId: req.user.id,
            ticketId: ticket.id,
            discountAmount: discountAmount / quantity
          }, { transaction });
        }
      }

      // If referral was used, record it
      if (referrerId) {
        // Calculate commission
        const commissionRate = 5.00; // Default 5%
        const commissionAmount = (finalPrice * commissionRate) / 100;
        
        for (const ticket of tickets) {
          await Referral.create({
            referrerId,
            referredUserId: req.user.id,
            ticketId: ticket.id,
            status: paymentMethod === 'manual' ? 'pending' : 'completed',
            commissionRate,
            commissionAmount: commissionAmount / quantity
          }, { transaction });
        }
        
        // If payment is complete, update referrer's wallet
        if (paymentMethod !== 'manual') {
          const referrer = await User.findByPk(referrerId, { transaction });
          await referrer.update({
            walletBalance: parseFloat(referrer.walletBalance) + commissionAmount
          }, { transaction });
        }
      }

      await transaction.commit();

      req.flash('success_msg', 'Tickets booked successfully');
      res.redirect('/tickets/my-tickets');
    } catch (err) {
      await transaction.rollback();
      console.error('Error completing booking:', err);
      req.flash('error_msg', 'Error processing your booking');
      res.redirect(`/events/${req.body.eventId}/book`);
    }
  },

  // View user's tickets
  getMyTickets: async (req, res) => {
    try {
      const tickets = await Ticket.findAll({
        where: { userId: req.user.id },
        include: [
          {
            model: Event,
            attributes: ['id', 'title', 'startDate', 'venue']
          },
          {
            model: TicketType,
            attributes: ['name', 'type']
          }
        ],
        order: [
          [Event, 'startDate', 'ASC'],
          ['createdAt', 'DESC']
        ]
      });

      res.render('tickets/my-tickets', {
        title: 'My Tickets',
        tickets
      });
    } catch (err) {
      console.error('Error fetching tickets:', err);
      req.flash('error_msg', 'Error loading your tickets');
      res.redirect('/dashboard');
    }
  },

  // View single ticket
  getTicketDetails: async (req, res) => {
    try {
      const ticketId = req.params.id;
      
      const ticket = await Ticket.findByPk(ticketId, {
        include: [
          {
            model: Event,
            include: [
              {
                model: User,
                as: 'organizer',
                attributes: ['name']
              }
            ]
          },
          {
            model: TicketType,
          }
        ]
      });

      if (!ticket || ticket.userId !== req.user.id) {
        req.flash('error_msg', 'Ticket not found');
        return res.redirect('/tickets/my-tickets');
      }

      res.render('tickets/details', {
        title: 'Ticket Details',
        ticket
      });
    } catch (err) {
      console.error('Error fetching ticket details:', err);
      req.flash('error_msg', 'Error loading ticket details');
      res.redirect('/tickets/my-tickets');
    }
  },

  // Check-in ticket
  checkInTicket: async (req, res) => {
    try {
      const { ticketNumber } = req.body;
      
      const ticket = await Ticket.findOne({
        where: { ticketNumber },
        include: [
          {
            model: Event,
          },
          {
            model: User,
            as: 'attendee',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      if (!ticket) {
        return res.json({
          success: false,
          message: 'Invalid ticket'
        });
      }

      // Check if ticket is for this event
      if (ticket.eventId !== req.params.id) {
        return res.json({
          success: false,
          message: 'Ticket is for a different event'
        });
      }

      // Check if ticket is already used
      if (ticket.isCheckedIn) {
        return res.json({
          success: false,
          message: 'Ticket already used',
          ticketData: {
            attendeeName: ticket.attendee.name,
            ticketNumber: ticket.ticketNumber,
            checkedInAt: ticket.checkedInAt
          }
        });
      }

      // Mark ticket as checked in
      await ticket.update({
        isCheckedIn: true,
        checkedInAt: new Date()
      });

      // Create check-in record
      const CheckIn = require('../models/CheckIn');
      await CheckIn.create({
        ticketId: ticket.id,
        eventId: ticket.eventId,
        attendeeId: ticket.userId,
        checkedInBy: req.user.id,
        checkInMethod: req.body.method || 'qr_code',
        attendeePhoto: req.body.photoPath || null,
        ipAddress: req.ip,
        deviceInfo: req.headers['user-agent']
      });

      return res.json({
        success: true,
        message: 'Check-in successful',
        ticketData: {
          attendeeName: ticket.attendee.name,
          attendeeEmail: ticket.attendee.email,
          ticketNumber: ticket.ticketNumber,
          ticketType: ticket.ticketType ? ticket.ticketType.name : 'Standard',
          eventName: ticket.event.title
        }
      });
    } catch (err) {
      console.error('Error checking in ticket:', err);
      return res.json({
        success: false,
        message: 'Error processing check-in'
      });
    }
  }
};