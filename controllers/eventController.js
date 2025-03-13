/**
 * Event Controller
 */
const db = require('../models');
const helpers = require('../utils/helpers');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

// Models
const Event = db.Event;
const Venue = db.Venue;
const User = db.User;
const Guest = db.Guest;
const TicketType = db.TicketType;
const Ticket = db.Ticket;

/**
 * Get all events
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getAllEvents = async (req, res) => {
  try {
    // Parse pagination parameters
    const { page, limit } = helpers.parsePaginationQuery(req.query);
    
    // Build query
    const query = {
      where: {},
      include: [
        {
          model: Venue,
          attributes: ['id', 'name', 'address', 'city']
        },
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'first_name', 'last_name']
        }
      ],
      order: [['start_date', 'ASC']],
      ...helpers.getPaginationOptions(page, limit)
    };
    
    // Apply filters
    if (req.query.status) {
      query.where.status = req.query.status;
    }
    
    if (req.query.search) {
      query.where.title = {
        [db.Sequelize.Op.like]: `%${req.query.search}%`
      };
    }
    
    // Get only upcoming events if requested
    if (req.query.upcoming === 'true') {
      query.where.start_date = {
        [db.Sequelize.Op.gte]: new Date()
      };
    }
    
    // Get only past events if requested
    if (req.query.past === 'true') {
      query.where.end_date = {
        [db.Sequelize.Op.lt]: new Date()
      };
    }
    
    // Execute query
    const { count, rows: events } = await Event.findAndCountAll(query);
    
    // Generate pagination metadata
    const pagination = helpers.getPaginationMetadata(count, limit, page);
    
    // Return events
    res.status(200).json({
      status: 'success',
      data: {
        events,
        pagination
      }
    });
  } catch (error) {
    logger.error(`Error getting events: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch events'
    });
  }
};

/**
 * Get event by ID
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get event with relationships
    const event = await Event.findByPk(id, {
      include: [
        {
          model: Venue,
          attributes: ['id', 'name', 'address', 'city', 'capacity', 'contact_person', 'contact_email', 'contact_phone']
        },
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: Guest,
          through: { attributes: [] }
        },
        {
          model: TicketType,
          include: [
            {
              model: Ticket,
              attributes: ['id', 'ticket_code', 'status', 'payment_status', 'checked_in', 'checked_in_at', 'created_at']
            }
          ]
        }
      ]
    });
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    // Return event
    res.status(200).json({
      status: 'success',
      data: {
        event
      }
    });
  } catch (error) {
    logger.error(`Error getting event: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch event'
    });
  }
};

/**
 * Create new event
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.createEvent = async (req, res) => {
  try {
    const { title, description, start_date, end_date, start_time, end_time, venue_id, status } = req.body;
    
    // Check if venue exists
    const venue = await Venue.findByPk(venue_id);
    
    if (!venue) {
      return res.status(404).json({
        status: 'error',
        message: 'Venue not found'
      });
    }
    
    // Prepare event data
    const eventData = {
      title,
      description,
      start_date,
      end_date,
      start_time,
      end_time,
      venue_id,
      status: status || 'draft',
      created_by: req.user.id
    };
    
    // If banner image was uploaded
    if (req.file) {
      eventData.banner_image = req.file.path.replace('public/', '');
    }
    
    // Create event
    const event = await Event.create(eventData);
    
    // Return created event
    res.status(201).json({
      status: 'success',
      message: 'Event created successfully',
      data: {
        event
      }
    });
  } catch (error) {
    logger.error(`Error creating event: ${error.message}`);
    
    // If file was uploaded, remove it
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to create event'
    });
  }
};

/**
 * Update event
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, start_date, end_date, start_time, end_time, venue_id, status } = req.body;
    
    // Get event
    const event = await Event.findByPk(id);
    
    if (!event) {
      // If file was uploaded, remove it
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    // Check if user is authorized (creator or admin)
    const isAdmin = req.user.Roles.some(role => role.name === 'admin');
    
    if (event.created_by !== req.user.id && !isAdmin) {
      // If file was uploaded, remove it
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this event'
      });
    }
    
    // Check if venue exists if it's being updated
    if (venue_id && venue_id !== event.venue_id) {
      const venue = await Venue.findByPk(venue_id);
      
      if (!venue) {
        // If file was uploaded, remove it
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        
        return res.status(404).json({
          status: 'error',
          message: 'Venue not found'
        });
      }
    }
    
    // Prepare update data
    const updateData = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (start_time !== undefined) updateData.start_time = start_time;
    if (end_time !== undefined) updateData.end_time = end_time;
    if (venue_id !== undefined) updateData.venue_id = venue_id;
    if (status !== undefined) updateData.status = status;
    
    // If banner image was uploaded
    if (req.file) {
      // Delete old image if exists
      if (event.banner_image) {
        const oldImagePath = path.join(__dirname, '../public', event.banner_image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      updateData.banner_image = req.file.path.replace('public/', '');
    }
    
    // Update event
    await event.update(updateData);
    
    // Return updated event
    res.status(200).json({
      status: 'success',
      message: 'Event updated successfully',
      data: {
        event
      }
    });
  } catch (error) {
    logger.error(`Error updating event: ${error.message}`);
    
    // If file was uploaded, remove it
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to update event'
    });
  }
};

/**
 * Delete event
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get event
    const event = await Event.findByPk(id);
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    // Check if user is authorized (creator or admin)
    const isAdmin = req.user.Roles.some(role => role.name === 'admin');
    
    if (event.created_by !== req.user.id && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this event'
      });
    }
    
    // Check if event has tickets
    const tickets = await Ticket.count({ where: { event_id: id } });
    
    if (tickets > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete event with tickets'
      });
    }
    
    // Delete banner image if exists
    if (event.banner_image) {
      const imagePath = path.join(__dirname, '../public', event.banner_image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete event
    await event.destroy();
    
    // Return success
    res.status(200).json({
      status: 'success',
      message: 'Event deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting event: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete event'
    });
  }
};

/**
 * Get event guests
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getEventGuests = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if event exists
    const event = await Event.findByPk(id);
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    // Get guests
    const guests = await event.getGuests({
      attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'profile_image', 'bio'],
      include: [
        {
          model: db.Department,
          attributes: ['id', 'name']
        }
      ]
    });
    
    // Return guests
    res.status(200).json({
      status: 'success',
      data: {
        guests
      }
    });
  } catch (error) {
    logger.error(`Error getting event guests: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch event guests'
    });
  }
};

/**
 * Add guest to event
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.addEventGuest = async (req, res) => {
  try {
    const { id } = req.params;
    const { guest_id } = req.body;
    
    // Check if event exists
    const event = await Event.findByPk(id);
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    // Check if guest exists
    const guest = await Guest.findByPk(guest_id);
    
    if (!guest) {
      return res.status(404).json({
        status: 'error',
        message: 'Guest not found'
      });
    }
    
    // Check if guest is already added
    const isGuestAdded = await db.EventGuest.findOne({
      where: {
        event_id: id,
        guest_id
      }
    });
    
    if (isGuestAdded) {
      return res.status(400).json({
        status: 'error',
        message: 'Guest already added to event'
      });
    }
    
    // Add guest to event
    await event.addGuest(guest);
    
    // Return success
    res.status(200).json({
      status: 'success',
      message: 'Guest added to event successfully'
    });
  } catch (error) {
    logger.error(`Error adding event guest: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add guest to event'
    });
  }
};

/**
 * Remove guest from event
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.removeEventGuest = async (req, res) => {
  try {
    const { id, guest_id } = req.params;
    
    // Check if event exists
    const event = await Event.findByPk(id);
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    // Check if guest exists
    const guest = await Guest.findByPk(guest_id);
    
    if (!guest) {
      return res.status(404).json({
        status: 'error',
        message: 'Guest not found'
      });
    }
    
    // Remove guest from event
    await db.EventGuest.destroy({
      where: {
        event_id: id,
        guest_id
      }
    });
    
    // Return success
    res.status(200).json({
      status: 'success',
      message: 'Guest removed from event successfully'
    });
  } catch (error) {
    logger.error(`Error removing event guest: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove guest from event'
    });
  }
};

/**
 * Get event statistics
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getEventStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if event exists
    const event = await Event.findByPk(id);
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    // Get ticket types
    const ticketTypes = await TicketType.findAll({
      where: { event_id: id },
      attributes: ['id', 'name', 'price', 'max_tickets', 'tickets_sold']
    });
    
    // Get tickets
    const tickets = await Ticket.findAll({
      where: { event_id: id },
      attributes: ['id', 'status', 'payment_status', 'checked_in', 'total_amount']
    });
    
    // Calculate statistics
    const stats = {
      totalTicketsSold: tickets.length,
      totalRevenue: tickets.reduce((sum, ticket) => sum + parseFloat(ticket.total_amount), 0),
      checkedIn: tickets.filter(ticket => ticket.checked_in).length,
      ticketStatuses: {
        pending: tickets.filter(ticket => ticket.status === 'pending').length,
        confirmed: tickets.filter(ticket => ticket.status === 'confirmed').length,
        cancelled: tickets.filter(ticket => ticket.status === 'cancelled').length,
        used: tickets.filter(ticket => ticket.status === 'used').length
      },
      paymentStatuses: {
        pending: tickets.filter(ticket => ticket.payment_status === 'pending').length,
        completed: tickets.filter(ticket => ticket.payment_status === 'completed').length,
        failed: tickets.filter(ticket => ticket.payment_status === 'failed').length,
        refunded: tickets.filter(ticket => ticket.payment_status === 'refunded').length
      },
      ticketTypes: ticketTypes.map(type => ({
        id: type.id,
        name: type.name,
        price: parseFloat(type.price),
        maxTickets: type.max_tickets,
        sold: type.tickets_sold,
        available: type.max_tickets - type.tickets_sold,
        percentageSold: Math.round((type.tickets_sold / type.max_tickets) * 100)
      }))
    };
    
    // Return statistics
    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    logger.error(`Error getting event statistics: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch event statistics'
    });
  }
};

/**
 * Render events page
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.renderEventsPage = async (req, res) => {
  try {
    // Fetch upcoming events
    const upcomingEvents = await Event.findAll({
      where: {
        start_date: {
          [db.Sequelize.Op.gte]: new Date()
        },
        status: 'published'
      },
      include: [
        {
          model: Venue,
          attributes: ['id', 'name', 'city']
        }
      ],
      order: [['start_date', 'ASC']],
      limit: 10
    });
    
    // Render events page
    res.render('events/index', {
      title: 'Events',
      events: upcomingEvents
    });
  } catch (error) {
    logger.error(`Error rendering events page: ${error.message}`);
    req.flash('error_msg', 'Failed to load events');
    res.redirect('/');
  }
};

/**
 * Render event details page
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.renderEventDetailsPage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get event with relationships
    const event = await Event.findByPk(id, {
      include: [
        {
          model: Venue,
          attributes: ['id', 'name', 'address', 'city']
        },
        {
          model: Guest,
          through: { attributes: [] }
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
      // Allow organizer or admin to view
      const isOrganizer = event.created_by === req.user.id;
      const isAdmin = req.user && req.user.Roles.some(role => role.name === 'admin');
      
      if (!isOrganizer && !isAdmin) {
        req.flash('error_msg', 'Event not available');
        return res.redirect('/events');
      }
    }
    
    // Render event details page
    res.render('events/details', {
      title: event.title,
      event,
      formattedStartDate: helpers.formatDate(event.start_date),
      formattedEndDate: helpers.formatDate(event.end_date),
      formattedStartTime: helpers.formatTime(event.start_time),
      formattedEndTime: helpers.formatTime(event.end_time)
    });
  } catch (error) {
    logger.error(`Error rendering event details page: ${error.message}`);
    req.flash('error_msg', 'Failed to load event details');
    res.redirect('/events');
  }
};

/**
 * Get event by ID
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get event with relationships
    const event = await Event.findByPk(id, {
      include: [
        {
          model: Venue,
          attributes: ['id', 'name', 'address', 'city', 'capacity', 'contact_person', 'contact_email', 'contact_phone']
        },
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: Guest,
          through: { 
            attributes: ['role'] // Include role from junction table
          }
        },
        {
          model: TicketType,
          include: [
            {
              model: Ticket,
              attributes: ['id', 'ticket_code', 'status', 'payment_status', 'checked_in', 'checked_in_at', 'created_at']
            }
          ]
        }
      ]
    });
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    // Return event
    res.status(200).json({
      status: 'success',
      data: {
        event
      }
    });
  } catch (error) {
    logger.error(`Error getting event: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch event'
    });
  }
};
/**
 * Render event details page
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.renderEventDetailsPage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get event with relationships
    const event = await Event.findByPk(id, {
      include: [
        {
          model: Venue,
          attributes: ['id', 'name', 'address', 'city']
        },
        {
          model: Guest,
          through: { 
            attributes: ['role'] // Include role from junction table
          }
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
      // Allow organizer or admin to view
      const isOrganizer = event.created_by === req.user.id;
      const isAdmin = req.user && req.user.Roles.some(role => role.name === 'admin');
      
      if (!isOrganizer && !isAdmin) {
        req.flash('error_msg', 'Event not available');
        return res.redirect('/events');
      }
    }
    
    // Check user permissions for managing event
    const canManageEvent = req.user && 
      (event.created_by === req.user.id || req.user.Roles.some(role => role.name === 'admin' || role.name === 'organizer'));
    
    // Render event details page
    res.render('events/details', {
      title: event.title,
      event,
      canManageEvent,
      formattedStartDate: helpers.formatDate(event.start_date),
      formattedEndDate: helpers.formatDate(event.end_date),
      formattedStartTime: helpers.formatTime(event.start_time),
      formattedEndTime: helpers.formatTime(event.end_time)
    });
  } catch (error) {
    logger.error(`Error rendering event details page: ${error.message}`);
    req.flash('error_msg', 'Failed to load event details');
    res.redirect('/events');
  }
};