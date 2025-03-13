/**
 * Event Guest Controller
 */
const db = require('../models');
const helpers = require('../utils/helpers');
const logger = require('../utils/logger');

// Models
const Event = db.Event;
const Guest = db.Guest;
const EventGuest = db.EventGuest;
const Venue = db.Venue;
const User = db.User;

/**
 * Get all event guests
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getAllEventGuests = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Verify event exists
    const event = await Event.findByPk(eventId, {
      include: [{
        model: Venue,
        attributes: ['id', 'name']
      }]
    });
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    // Check authorization
    const isOrganizer = event.created_by === req.user.id;
    const isAdmin = req.user.Roles.some(role => role.name === 'admin');
    
    if (!isOrganizer && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view guests for this event'
      });
    }
    
    // Parse pagination parameters
    const { page, limit } = helpers.parsePaginationQuery(req.query);
    
    // Get all guests for this event
    const guests = await event.getGuests({
      include: [{
        model: db.Department,
        attributes: ['id', 'name']
      }],
      order: [['first_name', 'ASC'], ['last_name', 'ASC']],
      ...helpers.getPaginationOptions(page, limit)
    });
    
    // Get total count for pagination
    const count = await EventGuest.count({
      where: { event_id: eventId }
    });
    
    // Format the guest data to include role from junction table
    const formattedGuests = guests.map(guest => {
      const plainGuest = guest.toJSON();
      plainGuest.role = guest.EventGuest.role;
      return plainGuest;
    });
    
    // Generate pagination metadata
    const pagination = helpers.getPaginationMetadata(count, limit, page);
    
    // Return result
    res.status(200).json({
      status: 'success',
      data: {
        event,
        guests: formattedGuests,
        pagination
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
exports.addGuestToEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { guest_id, role } = req.body;
    
    // Verify event exists
    const event = await Event.findByPk(eventId);
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    // Check authorization
    const isOrganizer = event.created_by === req.user.id;
    const isAdmin = req.user.Roles.some(role => role.name === 'admin');
    
    if (!isOrganizer && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to add guests to this event'
      });
    }
    
    // Verify guest exists
    const guest = await Guest.findByPk(guest_id);
    
    if (!guest) {
      return res.status(404).json({
        status: 'error',
        message: 'Guest not found'
      });
    }
    
    // Check if guest is already added to event
    const existingGuest = await EventGuest.findOne({
      where: {
        event_id: eventId,
        guest_id
      }
    });
    
    if (existingGuest) {
      return res.status(400).json({
        status: 'error',
        message: 'Guest is already added to this event'
      });
    }
    
    // Add guest to event with role
    await EventGuest.create({
      event_id: eventId,
      guest_id,
      role: role || null
    });
    
    // Return success
    res.status(201).json({
      status: 'success',
      message: 'Guest added to event successfully'
    });
  } catch (error) {
    logger.error(`Error adding guest to event: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add guest to event'
    });
  }
};

/**
 * Update event guest
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.updateEventGuest = async (req, res) => {
  try {
    const { eventId, guestId } = req.params;
    const { role } = req.body;
    
    // Verify event exists
    const event = await Event.findByPk(eventId);
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    // Check authorization
    const isOrganizer = event.created_by === req.user.id;
    const isAdmin = req.user.Roles.some(role => role.name === 'admin');
    
    if (!isOrganizer && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update guests for this event'
      });
    }
    
    // Find event guest
    const eventGuest = await EventGuest.findOne({
      where: {
        event_id: eventId,
        guest_id: guestId
      }
    });
    
    if (!eventGuest) {
      return res.status(404).json({
        status: 'error',
        message: 'Guest not found in this event'
      });
    }
    
    // Update role
    await eventGuest.update({
      role: role
    });
    
    // Return success
    res.status(200).json({
      status: 'success',
      message: 'Event guest updated successfully'
    });
  } catch (error) {
    logger.error(`Error updating event guest: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update event guest'
    });
  }
};

/**
 * Remove guest from event
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.removeGuestFromEvent = async (req, res) => {
  try {
    const { eventId, guestId } = req.params;
    
    // Verify event exists
    const event = await Event.findByPk(eventId);
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    // Check authorization
    const isOrganizer = event.created_by === req.user.id;
    const isAdmin = req.user.Roles.some(role => role.name === 'admin');
    
    if (!isOrganizer && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to remove guests from this event'
      });
    }
    
    // Remove guest from event
    const deleted = await EventGuest.destroy({
      where: {
        event_id: eventId,
        guest_id: guestId
      }
    });
    
    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Guest not found in this event'
      });
    }
    
    // Return success
    res.status(200).json({
      status: 'success',
      message: 'Guest removed from event successfully'
    });
  } catch (error) {
    logger.error(`Error removing guest from event: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove guest from event'
    });
  }
};

/**
 * Render event guests management page
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.renderEventGuestsPage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get event with venue
    const event = await Event.findByPk(id, {
      include: [{
        model: Venue,
        attributes: ['id', 'name', 'city']
      }]
    });
    
    if (!event) {
      req.flash('error_msg', 'Event not found');
      return res.redirect('/events');
    }
    
    // Check authorization
    const isOrganizer = event.created_by === req.user.id;
    const isAdmin = req.user.Roles.some(role => role.name === 'admin');
    
    if (!isOrganizer && !isAdmin) {
      req.flash('error_msg', 'Not authorized to manage guests for this event');
      return res.redirect('/events');
    }
    
    // Get all event guests
    const eventGuests = await event.getGuests({
      include: [{
        model: db.Department,
        attributes: ['id', 'name']
      }],
      order: [['first_name', 'ASC'], ['last_name', 'ASC']]
    });
    
    // Get all available guests (not already in event)
    const allGuestIds = eventGuests.map(guest => guest.id);
    
    const availableGuests = await Guest.findAll({
      where: {
        id: {
          [db.Sequelize.Op.notIn]: allGuestIds.length > 0 ? allGuestIds : [0]
        },
        status: 'active'
      },
      include: [{
        model: db.Department,
        attributes: ['id', 'name']
      }],
      order: [['first_name', 'ASC'], ['last_name', 'ASC']]
    });
    
    res.render('events/guests', {
      title: 'Event Guests',
      user: req.user,
      event,
      eventGuests,
      availableGuests
    });
  } catch (error) {
    logger.error(`Error rendering event guests page: ${error.message}`);
    req.flash('error_msg', 'Error loading event guests');
    res.redirect('/events');
  }
};