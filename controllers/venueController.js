/**
 * Venue Controller
 */
const db = require('../models');
const helpers = require('../utils/helpers');
const logger = require('../utils/logger');

// Models
const Venue = db.Venue;
const Event = db.Event;
const User = db.User;

/**
 * Get all venues
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getAllVenues = async (req, res) => {
  try {
    // Parse pagination parameters
    const { page, limit } = helpers.parsePaginationQuery(req.query);
    
    // Build query
    const query = {
      include: [
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'first_name', 'last_name']
        }
      ],
      order: [['name', 'ASC']],
      ...helpers.getPaginationOptions(page, limit)
    };
    
    // Apply filters
    if (req.query.search) {
      query.where = {
        [db.Sequelize.Op.or]: [
          { name: { [db.Sequelize.Op.like]: `%${req.query.search}%` } },
          { city: { [db.Sequelize.Op.like]: `%${req.query.search}%` } }
        ]
      };
    }
    
    // Execute query
    const { count, rows: venues } = await Venue.findAndCountAll(query);
    
    // Generate pagination metadata
    const pagination = helpers.getPaginationMetadata(count, limit, page);
    
    // Return venues
    res.status(200).json({
      status: 'success',
      data: {
        venues,
        pagination
      }
    });
  } catch (error) {
    logger.error(`Error getting venues: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch venues'
    });
  }
};

/**
 * Get venue by ID
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getVenueById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get venue with creator
    const venue = await Venue.findByPk(id, {
      include: [
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'first_name', 'last_name']
        }
      ]
    });
    
    if (!venue) {
      return res.status(404).json({
        status: 'error',
        message: 'Venue not found'
      });
    }
    
    // Return venue
    res.status(200).json({
      status: 'success',
      data: {
        venue
      }
    });
  } catch (error) {
    logger.error(`Error getting venue: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch venue'
    });
  }
};

/**
 * Create new venue
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.createVenue = async (req, res) => {
  try {
    const { name, address, city, capacity, description, contact_person, contact_email, contact_phone } = req.body;
    
    // Create venue
    const venue = await Venue.create({
      name,
      address,
      city,
      capacity,
      description,
      contact_person,
      contact_email,
      contact_phone,
      created_by: req.user.id
    });
    
    // Return created venue
    res.status(201).json({
      status: 'success',
      message: 'Venue created successfully',
      data: {
        venue
      }
    });
  } catch (error) {
    logger.error(`Error creating venue: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create venue'
    });
  }
};

/**
 * Update venue
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.updateVenue = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, city, capacity, description, contact_person, contact_email, contact_phone } = req.body;
    
    // Get venue
    const venue = await Venue.findByPk(id);
    
    if (!venue) {
      return res.status(404).json({
        status: 'error',
        message: 'Venue not found'
      });
    }
    
    // Check if user is authorized (creator or admin)
    const isAdmin = req.user.Roles.some(role => role.name === 'admin');
    
    if (venue.created_by !== req.user.id && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this venue'
      });
    }
    
    // Update venue
    await venue.update({
      name,
      address,
      city,
      capacity,
      description,
      contact_person,
      contact_email,
      contact_phone
    });
    
    // Return updated venue
    res.status(200).json({
      status: 'success',
      message: 'Venue updated successfully',
      data: {
        venue
      }
    });
  } catch (error) {
    logger.error(`Error updating venue: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update venue'
    });
  }
};

/**
 * Delete venue
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.deleteVenue = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get venue
    const venue = await Venue.findByPk(id);
    
    if (!venue) {
      return res.status(404).json({
        status: 'error',
        message: 'Venue not found'
      });
    }
    
    // Check if user is authorized (creator or admin)
    const isAdmin = req.user.Roles.some(role => role.name === 'admin');
    
    if (venue.created_by !== req.user.id && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this venue'
      });
    }
    
    // Check if venue has events
    const eventsCount = await Event.count({ where: { venue_id: id } });
    
    if (eventsCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete venue with events. Please delete or reassign the events first.'
      });
    }
    
    // Delete venue
    await venue.destroy();
    
    // Return success
    res.status(200).json({
      status: 'success',
      message: 'Venue deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting venue: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete venue'
    });
  }
};

/**
 * Get venue events
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getVenueEvents = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if venue exists
    const venue = await Venue.findByPk(id);
    
    if (!venue) {
      return res.status(404).json({
        status: 'error',
        message: 'Venue not found'
      });
    }
    
    // Parse pagination parameters
    const { page, limit } = helpers.parsePaginationQuery(req.query);
    
    // Build query
    const query = {
      where: { venue_id: id },
      include: [
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'first_name', 'last_name']
        }
      ],
      order: [['start_date', 'ASC']],
      ...helpers.getPaginationOptions(page, limit)
    };
    
    // Apply status filter if provided
    if (req.query.status) {
      query.where.status = req.query.status;
    }
    
    // Execute query
    const { count, rows: events } = await Event.findAndCountAll(query);
    
    // Generate pagination metadata
    const pagination = helpers.getPaginationMetadata(count, limit, page);
    
    // Return events
    res.status(200).json({
      status: 'success',
      data: {
        venue,
        events,
        pagination
      }
    });
  } catch (error) {
    logger.error(`Error getting venue events: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch venue events'
    });
  }
};

/**
 * Render venues page
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.renderVenuesPage = async (req, res) => {
  try {
    // Get all venues
    const venues = await Venue.findAll({
      include: [
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'first_name', 'last_name']
        }
      ],
      order: [['name', 'ASC']]
    });
    
    res.render('venues/index', {
      title: 'Venues',
      user: req.user,
      venues
    });
  } catch (error) {
    logger.error(`Error rendering venues page: ${error.message}`);
    req.flash('error_msg', 'Error loading venues');
    res.redirect('/dashboard');
  }
};

/**
 * Render venue details page
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.renderVenueDetailsPage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get venue with upcoming events
    const venue = await Venue.findByPk(id, {
      include: [
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'first_name', 'last_name']
        },
        {
          model: Event,
          where: {
            start_date: {
              [db.Sequelize.Op.gte]: new Date()
            },
            status: 'published'
          },
          required: false
        }
      ]
    });
    
    if (!venue) {
      req.flash('error_msg', 'Venue not found');
      return res.redirect('/venues');
    }
    
    res.render('venues/details', {
      title: venue.name,
      user: req.user,
      venue
    });
  } catch (error) {
    logger.error(`Error rendering venue details: ${error.message}`);
    req.flash('error_msg', 'Error loading venue details');
    res.redirect('/venues');
  }
};

/**
 * Render create venue page
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.renderCreateVenuePage = async (req, res) => {
  try {
    res.render('venues/create', {
      title: 'Create Venue',
      user: req.user
    });
  } catch (error) {
    logger.error(`Error rendering create venue page: ${error.message}`);
    req.flash('error_msg', 'Error loading create venue page');
    res.redirect('/venues');
  }
};

/**
 * Render edit venue page
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.renderEditVenuePage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get venue
    const venue = await Venue.findByPk(id);
    
    if (!venue) {
      req.flash('error_msg', 'Venue not found');
      return res.redirect('/venues');
    }
    
    // Check if user is authorized (creator or admin)
    const isAdmin = req.user.Roles.some(role => role.name === 'admin');
    
    if (venue.created_by !== req.user.id && !isAdmin) {
      req.flash('error_msg', 'Not authorized to edit this venue');
      return res.redirect('/venues');
    }
    
    res.render('venues/edit', {
      title: 'Edit Venue',
      user: req.user,
      venue
    });
  } catch (error) {
    logger.error(`Error rendering edit venue page: ${error.message}`);
    req.flash('error_msg', 'Error loading edit venue page');
    res.redirect('/venues');
  }
};