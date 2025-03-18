/**
 * Guest Controller
 */
const db = require('../models');
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
    // Get departments for dropdown
    const departments = await Department.findAll({
      order: [['name', 'ASC']]
    });
    
    // Build guest query
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
      order: [['first_name', 'ASC'], ['last_name', 'ASC']]
    };
    
    // Add filters if provided
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
    const guests = await Guest.findAll(query);
    
    // Return with complete data object
    return res.render('guest/guestpage', {
      messages: req.flash(),
      data: {
        guests: guests,
        departments: departments
      }
    });
  } catch (error) {
    logger.error(`Error getting guests: ${error.message}`);
    req.flash('error', 'Failed to fetch guests');
    return res.redirect('/dashboard');
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
        
        req.flash('error', 'Department not found');
        return res.redirect('/guests'); // Redirect to guests page with error
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
      guestData.profile_image = req.file.path.replace(/^public[\/\\]/, '').replace(/\\/g, '/');
    }
    
    // Create guest
    const guest = await Guest.create(guestData);
    
    // Set success message and redirect
    req.flash('success', 'Guest Created Successfully');
    return res.redirect('/guests/api'); // Correct redirect path
  } catch (error) {
    logger.error(`Error creating guest: ${error.message}`);
    
    // If file was uploaded, remove it
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    req.flash('error', 'Failed to create guest: ' + error.message);
    return res.redirect('/guests/api'); // Redirect with error
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
    const { first_name, last_name, email, phone, bio, department_id, status,id } = req.body;
    
    // Get guest
    const guest = await Guest.findByPk(id);
    
    if (!guest) {
      // If file was uploaded, remove it
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      
      req.flash('error', 'Guest Created Successfully');
      return res.redirect('/guests/api'); // Correct redirect path
    }
    
    // Check if department exists if provided
    if (department_id) {
      const department = await Department.findByPk(department_id);
      
      if (!department) {
        // If file was uploaded, remove it
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        
        req.flash('error', 'Guest Created Successfully');
        return res.redirect('/guests/api'); // Correct redirect path
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
      
      const filePath = req.file.path.replace(/^public[\/\\]/, '').replace(/\\/g, '/');
      updateData.profile_image = filePath;
    }
    
    // Update guest
    await guest.update(updateData);
    
    // Return updated guest
    
    req.flash('success', 'Guest Updated Successfully');
    return res.redirect('/guests/api'); // Correct redirect path

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
    const { id } = req.body;
    
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
    req.flash('success', 'Guest Deleted Successfully');
    return res.redirect('/guests/api'); // Correct redirect path

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
    
    // Get all guests
    const guests = await Guest.findAll({
      include: [
        {
          model: Department,
          attributes: ['id', 'name']
        }
      ],
      order: [['first_name', 'ASC'], ['last_name', 'ASC']]
    });
    
    res.render('guests/index', {
      title: 'Guests',
      user: req.user,
      guests,
      departments,
      query: req.query
    });
  } catch (error) {
    logger.error(`Error rendering guests page: ${error.message}`);
    req.flash('error_msg', 'Error loading guests');
    res.redirect('/dashboard');
  }
};

