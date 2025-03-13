/**
 * Guest Controller
 */
const db = require('../models');
const helpers = require('../utils/helpers');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

// Models
const Guest = db.Guest;
const Department = db.Department;
const Event = db.Event;
const User = db.User;

/**
 * Get all guests
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getAllGuests = async (req, res) => {
  try {
    // Parse pagination parameters
    const { page, limit } = helpers.parsePaginationQuery(req.query);
    
    // Build query
    const query = {
      include: [
        {
          model: Department,
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'first_name', 'last_name']
        }
      ],
      order: [['first_name', 'ASC'], ['last_name', 'ASC']],
      ...helpers.getPaginationOptions(page, limit)
    };
    
    // Apply filters
    if (req.query.search) {
      query.where = {
        [db.Sequelize.Op.or]: [
          { first_name: { [db.Sequelize.Op.like]: `%${req.query.search}%` } },
          { last_name: { [db.Sequelize.Op.like]: `%${req.query.search}%` } },
          { email: { [db.Sequelize.Op.like]: `%${req.query.search}%` } }
        ]
      };
    }
    
    if (req.query.department_id) {
      query.where = {
        ...query.where,
        department_id: req.query.department_id
      };
    }
    
    if (req.query.status) {
      query.where = {
        ...query.where,
        status: req.query.status
      };
    }
    
    // Execute query
    const { count, rows: guests } = await Guest.findAndCountAll(query);
    
    // Generate pagination metadata
    const pagination = helpers.getPaginationMetadata(count, limit, page);
    
    // Return guests
    res.status(200).json({
      status: 'success',
      data: {
        guests,
        pagination
      }
    });
  } catch (error) {
    logger.error(`Error getting guests: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch guests'
    });
  }
};

/**
 * Get guest by ID
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getGuestById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get guest with relationships
    const guest = await Guest.findByPk(id, {
      include: [
        {
          model: Department,
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'first_name', 'last_name']
        },
        {
          model: Event,
          through: { attributes: [] }
        }
      ]
    });
    
    if (!guest) {
      return res.status(404).json({
        status: 'error',
        message: 'Guest not found'
      });
    }
    
    // Return guest
    res.status(200).json({
      status: 'success',
      data: {
        guest
      }
    });
  } catch (error) {
    logger.error(`Error getting guest: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch guest'
    });
  }
};

/**
 * Create new guest
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.createGuest = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, bio, department_id, status } = req.body;
    
    // Check if department exists if provided
    if (department_id) {
      const department = await Department.findByPk(department_id);
      
      if (!department) {
        // If file was uploaded, remove it
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        
        return res.status(404).json({
          status: 'error',
          message: 'Department not found'
        });
      }
    }
    
    // Prepare guest data
    const guestData = {
      first_name,
      last_name,
      email,
      phone,
      bio,
      department_id,
      status: status || 'active',
      created_by: req.user.id
    };
    
    // Handle profile image upload
    if (req.file) {
      guestData.profile_image = req.file.path.replace('public/', '');
    }
    
    // Create guest
    const guest = await Guest.create(guestData);
    
    // Return created guest
    res.status(201).json({
      status: 'success',
      message: 'Guest created successfully',
      data: {
        guest
      }
    });
  } catch (error) {
    logger.error(`Error creating guest: ${error.message}`);
    
    // If file was uploaded, remove it
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to create guest'
    });
  }
};

/**
 * Update guest
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.updateGuest = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, bio, department_id, status } = req.body;
    
    // Get guest
    const guest = await Guest.findByPk(id);
    
    if (!guest) {
      // If file was uploaded, remove it
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(404).json({
        status: 'error',
        message: 'Guest not found'
      });
    }
    
    // Check if department exists if provided
    if (department_id) {
      const department = await Department.findByPk(department_id);
      
      if (!department) {
        // If file was uploaded, remove it
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        
        return res.status(404).json({
          status: 'error',
          message: 'Department not found'
        });
      }
    }
    
    // Prepare update data
    const updateData = {};
    
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (department_id !== undefined) updateData.department_id = department_id;
    if (status !== undefined) updateData.status = status;
    
    // Handle profile image upload
    if (req.file) {
      // Delete old image if exists
      if (guest.profile_image) {
        const oldImagePath = path.join(__dirname, '../public', guest.profile_image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      updateData.profile_image = req.file.path.replace('public/', '');
    }
    
    // Update guest
    await guest.update(updateData);
    
    // Return updated guest
    res.status(200).json({
      status: 'success',
      message: 'Guest updated successfully',
      data: {
        guest
      }
    });
  } catch (error) {
    logger.error(`Error updating guest: ${error.message}`);
    
    // If file was uploaded, remove it
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to update guest'
    });
  }
};

/**
 * Delete guest
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.deleteGuest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get guest
    const guest = await Guest.findByPk(id);
    
    if (!guest) {
      return res.status(404).json({
        status: 'error',
        message: 'Guest not found'
      });
    }
    
    // Check if guest has events
    const eventsCount = await db.EventGuest.count({ where: { guest_id: id } });
    
    if (eventsCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete guest that is associated with events. Please remove from events first.'
      });
    }
    
    // Delete profile image if exists
    if (guest.profile_image) {
      const imagePath = path.join(__dirname, '../public', guest.profile_image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete guest
    await guest.destroy();
    
    // Return success
    res.status(200).json({
      status: 'success',
      message: 'Guest deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting guest: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete guest'
    });
  }
};

/**
 * Get guest events
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getGuestEvents = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if guest exists
    const guest = await Guest.findByPk(id);
    
    if (!guest) {
      return res.status(404).json({
        status: 'error',
        message: 'Guest not found'
      });
    }
    
    // Get guest events
    const events = await guest.getEvents({
      attributes: ['id', 'title', 'start_date', 'end_date', 'start_time', 'end_time', 'status'],
      include: [
        {
          model: db.Venue,
          attributes: ['id', 'name', 'city']
        }
      ],
      order: [['start_date', 'ASC']]
    });
    
    // Return events
    res.status(200).json({
      status: 'success',
      data: {
        guest,
        events
      }
    });
  } catch (error) {
    logger.error(`Error getting guest events: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch guest events'
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
    const { id } = req.params;
    const { event_id } = req.body;
    
    // Check if guest exists
    const guest = await Guest.findByPk(id);
    
    if (!guest) {
      return res.status(404).json({
        status: 'error',
        message: 'Guest not found'
      });
    }
    
    // Check if event exists
    const event = await Event.findByPk(event_id);
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    // Check if guest is already added to event
    const exists = await db.EventGuest.findOne({
      where: {
        guest_id: id,
        event_id
      }
    });
    
    if (exists) {
      return res.status(400).json({
        status: 'error',
        message: 'Guest is already added to this event'
      });
    }
    
    // Add guest to event
    await db.EventGuest.create({
      guest_id: id,
      event_id
    });
    
    // Return success
    res.status(200).json({
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
 * Remove guest from event
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.removeGuestFromEvent = async (req, res) => {
  try {
    const { id, event_id } = req.params;
    
    // Check if guest exists
    const guest = await Guest.findByPk(id);
    
    if (!guest) {
      return res.status(404).json({
        status: 'error',
        message: 'Guest not found'
      });
    }
    
    // Check if event exists
    const event = await Event.findByPk(event_id);
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    // Remove guest from event
    const deleted = await db.EventGuest.destroy({
      where: {
        guest_id: id,
        event_id
      }
    });
    
    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Guest is not associated with this event'
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
 * Render guests page
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.renderGuestsPage = async (req, res) => {
  try {
    // Get departments for filter
    const departments = await Department.findAll({
      order: [['name', 'ASC']]
    });
    
    // Get guests with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const { count, rows: guests } = await Guest.findAndCountAll({
      include: [
        {
          model: Department,
          attributes: ['id', 'name']
        }
      ],
      order: [['first_name', 'ASC'], ['last_name', 'ASC']],
      offset: (page - 1) * limit,
      limit
    });
    
    // Calculate pagination
    const totalPages = Math.ceil(count / limit);
    
    res.render('guests/index', {
      title: 'Guests',
      user: req.user,
      guests,
      departments,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      query: req.query
    });
  } catch (error) {
    logger.error(`Error rendering guests page: ${error.message}`);
    req.flash('error_msg', 'Error loading guests');
    res.redirect('/dashboard');
  }
};

/**
 * Render guest details page
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.renderGuestDetailsPage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get guest with relationships
    const guest = await Guest.findByPk(id, {
      include: [
        {
          model: Department,
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'first_name', 'last_name']
        },
        {
          model: Event,
          include: [
            {
              model: db.Venue,
              attributes: ['id', 'name', 'city']
            }
          ]
        }
      ]
    });
    
    if (!guest) {
      req.flash('error_msg', 'Guest not found');
      return res.redirect('/guests');
    }
    
    res.render('guests/details', {
      title: `${guest.first_name} ${guest.last_name}`,
      user: req.user,
      guest
    });
  } catch (error) {
    logger.error(`Error rendering guest details: ${error.message}`);
    req.flash('error_msg', 'Error loading guest details');
    res.redirect('/guests');
  }
};

/**
 * Render create guest page
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.renderCreateGuestPage = async (req, res) => {
  try {
    // Get departments for dropdown
    const departments = await Department.findAll({
      order: [['name', 'ASC']]
    });
    
    res.render('guests/create', {
      title: 'Create Guest',
      user: req.user,
      departments
    });
  } catch (error) {
    logger.error(`Error rendering create guest page: ${error.message}`);
    req.flash('error_msg', 'Error loading create guest page');
    res.redirect('/guests');
  }
};

/**
 * Render edit guest page
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.renderEditGuestPage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get guest
    const guest = await Guest.findByPk(id);
    
    if (!guest) {
      req.flash('error_msg', 'Guest not found');
      return res.redirect('/guests');
    }
    
    // Get departments for dropdown
    const departments = await Department.findAll({
      order: [['name', 'ASC']]
    });
    
    res.render('guests/edit', {
      title: 'Edit Guest',
      user: req.user,
      guest,
      departments
    });
  } catch (error) {
    logger.error(`Error rendering edit guest page: ${error.message}`);
    req.flash('error_msg', 'Error loading edit guest page');
    res.redirect('/guests');
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
    const { id } = req.params;
    const { event_id, role } = req.body;
    
    // Check if guest exists
    const guest = await Guest.findByPk(id);
    
    if (!guest) {
      return res.status(404).json({
        status: 'error',
        message: 'Guest not found'
      });
    }
    
    // Check if event exists
    const event = await Event.findByPk(event_id);
    
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
        message: 'Not authorized to add guests to this event'
      });
    }
    
    // Check if guest is already added to event
    const isGuestAdded = await db.EventGuest.findOne({
      where: {
        event_id,
        guest_id: id
      }
    });
    
    if (isGuestAdded) {
      return res.status(400).json({
        status: 'error',
        message: 'Guest already added to event'
      });
    }
    
    // Add guest to event with role
    await db.EventGuest.create({
      event_id,
      guest_id: id,
      role: role || null
    });
    
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
exports.removeGuestFromEvent = async (req, res) => {
  try {
    const { id, event_id } = req.params;
    
    // Check if guest exists
    const guest = await Guest.findByPk(id);
    
    if (!guest) {
      return res.status(404).json({
        status: 'error',
        message: 'Guest not found'
      });
    }
    
    // Check if event exists
    const event = await Event.findByPk(event_id);
    
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
        message: 'Not authorized to remove guests from this event'
      });
    }
    
    // Remove guest from event
    const deleted = await db.EventGuest.destroy({
      where: {
        event_id,
        guest_id: id
      }
    });
    
    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Guest is not associated with this event'
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