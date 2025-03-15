/**
 * Admin Controller
 */
const db = require('../models');
const helpers = require('../utils/helpers');
const security = require('../utils/security');
const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');

const emailService = require('../services/emailService');
const otpService = require('../services/otpService');


// Models
const User = db.User;
const Role = db.Role;
const Department = db.Department;
const Event = db.Event;
const Ticket = db.Ticket;
const Payment = db.Payment;
const PaymentMethod = db.PaymentMethod;

/**
 * Get all users
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Build query
    const query = {
      include: [
        {
          model: Role,
          through: { attributes: [] }
        }
      ],
      attributes: { exclude: ['password', 'reset_token', 'reset_token_expires', 'verification_token'] },
      order: [['created_at', 'DESC']]
    };
    
    // Apply status filter if provided
    if (req.query.status) {
      query.where = {
        status: req.query.status
      };
    }
    
    // Execute query
    const users = await User.findAll(query);
    
    // Return users
    return res.render('users/allusers', {
      messages: req.flash(),
      data: {
        users
      }
    });

  } catch (error) {
    logger.error(`Error getting users: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users'
    });
  }
};

/**
 * Get user by ID
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user with roles
    const user = await User.findByPk(id, {
      include: [
        {
          model: Role,
          through: { attributes: [] }
        }
      ],
      attributes: { exclude: ['password', 'reset_token', 'reset_token_expires', 'verification_token'] }
    });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Return user
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    logger.error(`Error getting user: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user'
    });
  }
};

/**
 * Create new user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.createUser = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password, roles, is_verified } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      req.flash('error', 'Email already in use');
      // Fetch all users before rendering
      const users = await User.findAll({
        include: [{
          model: Role,
          through: { attributes: [] }
        }],
        attributes: { exclude: ['password', 'reset_token', 'reset_token_expires', 'verification_token'] }
      });
      return res.render('users/allusers', {
        messages: req.flash(),
        data: {
          users
        }
      });
    }
    
    // Check if phone already exists if provided
    if (phone) {
      const existingPhone = await User.findOne({ where: { phone } });
      
      if (existingPhone) {
        req.flash('error', 'Phone number already in use');
        // Fetch all users before rendering
        const users = await User.findAll({
          include: [{
            model: Role,
            through: { attributes: [] }
          }],
          attributes: { exclude: ['password', 'reset_token', 'reset_token_expires', 'verification_token'] }
        });
        return res.render('users/allusers', {
          messages: req.flash(),
          data: {
            users
          }
        });
      }
    }
    
    // Hash password
    const hashedPassword = await security.hashPassword(password);
    
    // Initialize verificationToken
    let verificationToken = '';
    let status = 'active' ; 
    
    // Generate verification token if user is not verified
    if(is_verified == 0){
      verificationToken = security.generateRandomToken();
      status = 'inactive';
    }
    
    // Create user
    const user = await User.create({
      first_name,
      last_name,
      email,
      phone,
      password: hashedPassword,
      verification_token: verificationToken,
      is_verified: is_verified || false,
      status: status
    });
    
    // Assign roles if provided
    if (roles && roles.length > 0) {
      if (Array.isArray(roles)) {
        // If roles is an array, find all matching roles
        const userRoles = await Role.findAll({
          where: {
            name: {
              [db.Sequelize.Op.in]: roles
            }
          }
        });

        if (userRoles.length > 0) {
          await user.setRoles(userRoles);
        }
      } else {
        // If roles is a string (single role), find that role
        const userRole = await Role.findOne({ where: { name: roles } });

        if (userRole) {
          await user.addRole(userRole);
        }
      }
    } else {
      // Assign default 'user' role if no roles specified
      const userRole = await Role.findOne({ where: { name: 'user' } });

      if (userRole) {
        await user.addRole(userRole);
      }
    }

    // Only send verification email if user is not verified
    if (is_verified == 0) {
      const otp = await otpService.generateOTP(user.id, 'verification');
      await emailService.sendVerificationEmail(email, {
        code: otp.code,
        name: `${first_name} ${last_name}`,
        verificationUrl: `${process.env.APP_URL}/verify-email?token=${verificationToken}`
      });
    }
    
    // Fetch user with roles
    const createdUser = await User.findByPk(user.id, {
      include: [
        {
          model: Role,
          through: { attributes: [] }
        }
      ],
      attributes: { exclude: ['password', 'reset_token', 'reset_token_expires', 'verification_token'] }
    });
    
    // Fetch all users for display
    const users = await User.findAll({
      include: [{
        model: Role,
        through: { attributes: [] }
      }],
      attributes: { exclude: ['password', 'reset_token', 'reset_token_expires', 'verification_token'] }
    });
    
    // Return created user
    req.flash('success', 'User Created Successfully');
    return res.render('users/allusers', {
      messages: req.flash(),
      data: {
        users
      }
    });
  } catch (error) {
    logger.error(`Error creating user: ${error.message}`);
    req.flash('error', error.message);
    
    // Fetch all users in case of error too
    try {
      const users = await User.findAll({
        include: [{
          model: Role,
          through: { attributes: [] }
        }],
        attributes: { exclude: ['password', 'reset_token', 'reset_token_expires', 'verification_token'] }
      });
      
      return res.render('users/allusers', {
        messages: req.flash(),
        data: {
          users
        }
      });
    } catch (fetchError) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to create user and fetch user list'
      });
    }
  }
};


/**
 * Update user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.updateUser = async (req, res) => {
  try {
    const { role, status,id } = req.body;
    
    // Get user
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Prepare update data
    const updateData = {};
    
    if (status !== undefined) updateData.status = status;
    
    // Update user
    await user.update(updateData);
    
    // Update role if provided
    if (role) {
      const userRole = await Role.findOne({
        where: {
          name: role
        }
      });
      
      if (userRole) {
        await user.setRoles([userRole]);
      }
    }
    
    // Fetch updated user with roles
    const updatedUser = await User.findByPk(id, {
      include: [
        {
          model: Role,
          through: { attributes: [] }
        }
      ],
      attributes: { exclude: ['password', 'reset_token', 'reset_token_expires', 'verification_token'] }
    });
    
    // Return updated user
    res.status(200).json({
      status: 'success',
      message: 'User status and role updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    logger.error(`Error updating user: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user'
    });
  }
};

/**
 * Reset user password
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    // Get user
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Hash new password
    const hashedPassword = await security.hashPassword(password);
    
    // Update user password
    await user.update({
      password: hashedPassword,
      reset_token: null,
      reset_token_expires: null
    });
    
    // Return success
    res.status(200).json({
      status: 'success',
      message: 'User password reset successfully'
    });
  } catch (error) {
    logger.error(`Error resetting user password: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reset password'
    });
  }
};

/**
 * Delete user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.body;
    
    // Get user
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Check if user is admin
    const isAdmin = await user.getRoles({ where: { name: 'admin' } });
    
    if (isAdmin.length > 0 && isAdmin[0].name === 'admin') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete admin user'
      });
    }
    
    // Check if user is the last admin
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete your own account'
      });
    }
    
    // Check if user has created events, venues, or guests
    const eventsCount = await Event.count({ where: { created_by: id } });
    
    if (eventsCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete user with events. Please reassign or delete the events first.'
      });
    }
    
    // Delete user's profile image if exists
    if (user.profile_image) {
      const fs = require('fs');
      const path = require('path');
      const imagePath = path.join(__dirname, '../public', user.profile_image);
      
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete user
    await user.destroy();
    
    // Return success
    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting user: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user'
    });
  }
};

/**
 * Get all departments
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getAllDepartments = async (req, res) => {
  try {
    // Build query
    const query = {
      include: [
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'first_name', 'last_name']
        }
      ],
      order: [['name', 'ASC']]
    };
    
    // Execute query
    const departments = await Department.findAll(query);
    
    // Return departments
    res.status(200).json({
      status: 'success',
      data: {
        departments
      }
    });
  } catch (error) {
    logger.error(`Error getting departments: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch departments'
    });
  }
};

/**
 * Create department
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Check if department already exists
    const existingDepartment = await Department.findOne({ where: { name } });
    
    if (existingDepartment) {
      return res.status(400).json({
        status: 'error',
        message: 'Department with this name already exists'
      });
    }
    
    // Create department
    const department = await Department.create({
      name,
      description,
      created_by: req.user.id
    });
    
    // Return created department
    res.status(201).json({
      status: 'success',
      message: 'Department created successfully',
      data: {
        department
      }
    });
  } catch (error) {
    logger.error(`Error creating department: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create department'
    });
  }
};

/**
 * Update department
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // Get department
    const department = await Department.findByPk(id);
    
    if (!department) {
      return res.status(404).json({
        status: 'error',
        message: 'Department not found'
      });
    }
    
    // Check if name is unique if changing
    if (name && name !== department.name) {
      const existingDepartment = await Department.findOne({ where: { name } });
      
      if (existingDepartment) {
        return res.status(400).json({
          status: 'error',
          message: 'Department with this name already exists'
        });
      }
    }
    
    // Update department
    await department.update({
      name: name || department.name,
      description: description !== undefined ? description : department.description
    });
    
    // Return updated department
    res.status(200).json({
      status: 'success',
      message: 'Department updated successfully',
      data: {
        department
      }
    });
  } catch (error) {
    logger.error(`Error updating department: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update department'
    });
  }
};

/**
 * Delete department
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get department
    const department = await Department.findByPk(id);
    
    if (!department) {
      return res.status(404).json({
        status: 'error',
        message: 'Department not found'
      });
    }
    
    // Check if department has guests
    const guestsCount = await db.Guest.count({ where: { department_id: id } });
    
    if (guestsCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete department with guests. Please reassign or delete the guests first.'
      });
    }
    
    // Delete department
    await department.destroy();
    
    // Return success
    res.status(200).json({
      status: 'success',
      message: 'Department deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting department: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete department'
    });
  }
};

/**
 * Get all payment methods
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getAllPaymentMethods = async (req, res) => {
  try {
    // Get all payment methods
    const paymentMethods = await PaymentMethod.findAll({
      order: [['name', 'ASC']]
    });
    
    // Return payment methods
    res.status(200).json({
      status: 'success',
      data: {
        paymentMethods
      }
    });
  } catch (error) {
    logger.error(`Error getting payment methods: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch payment methods'
    });
  }
};

/**
 * Create payment method
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.createPaymentMethod = async (req, res) => {
  try {
    const { name, description, is_active } = req.body;
    
    // Check if payment method already exists
    const existingMethod = await PaymentMethod.findOne({ where: { name } });
    
    if (existingMethod) {
      return res.status(400).json({
        status: 'error',
        message: 'Payment method with this name already exists'
      });
    }
    
    // Create payment method
    const paymentMethod = await PaymentMethod.create({
      name,
      description,
      is_active: is_active !== undefined ? is_active : true
    });
    
    // Return created payment method
    res.status(201).json({
      status: 'success',
      message: 'Payment method created successfully',
      data: {
        paymentMethod
      }
    });
  } catch (error) {
    logger.error(`Error creating payment method: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create payment method'
    });
  }
};

/**
 * Update payment method
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.updatePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;
    
    // Get payment method
    const paymentMethod = await PaymentMethod.findByPk(id);
    
    if (!paymentMethod) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment method not found'
      });
    }
    
    // Check if name is unique if changing
    if (name && name !== paymentMethod.name) {
      const existingMethod = await PaymentMethod.findOne({ where: { name } });
      
      if (existingMethod) {
        return res.status(400).json({
          status: 'error',
          message: 'Payment method with this name already exists'
        });
      }
    }
    
    // Update payment method
    await paymentMethod.update({
      name: name || paymentMethod.name,
      description: description !== undefined ? description : paymentMethod.description,
      is_active: is_active !== undefined ? is_active : paymentMethod.is_active
    });
    
    // Return updated payment method
    res.status(200).json({
      status: 'success',
      message: 'Payment method updated successfully',
      data: {
        paymentMethod
      }
    });
  } catch (error) {
    logger.error(`Error updating payment method: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update payment method'
    });
  }
};

/**
 * Get system stats
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getSystemStats = async (req, res) => {
  try {
    // Get counts
    const usersCount = await User.count();
    const eventsCount = await Event.count();
    const upcomingEventsCount = await Event.count({
      where: {
        start_date: {
          [db.Sequelize.Op.gte]: new Date()
        }
      }
    });
    const ticketsCount = await Ticket.count();
    const ticketsSoldCount = await Ticket.count({
      where: {
        status: 'confirmed'
      }
    });
    const totalRevenue = await Payment.sum('amount', {
      where: {
        status: 'completed'
      }
    });
    
    // Return stats
    res.status(200).json({
      status: 'success',
      data: {
        users: usersCount,
        events: eventsCount,
        upcomingEvents: upcomingEventsCount,
        tickets: ticketsCount,
        ticketsSold: ticketsSoldCount,
        totalRevenue: totalRevenue || 0
      }
    });
  } catch (error) {
    logger.error(`Error getting system stats: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch system stats'
    });
  }
};

/**
 * Render admin dashboard
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.renderDashboard = async (req, res) => {
  try {
    // Get stats
    const usersCount = await User.count();
    const eventsCount = await Event.count();
    const upcomingEventsCount = await Event.count({
      where: {
        start_date: {
          [db.Sequelize.Op.gte]: new Date()
        }
      }
    });
    const ticketsCount = await Ticket.count();
    const ticketsSoldCount = await Ticket.count({
      where: {
        status: 'confirmed'
      }
    });
    const totalRevenue = await Payment.sum('amount', {
      where: {
        status: 'completed'
      }
    });
    
    // Get recent users
    const recentUsers = await User.findAll({
      attributes: { exclude: ['password', 'reset_token', 'reset_token_expires', 'verification_token'] },
      order: [['created_at', 'DESC']],
      limit: 5
    });
    
    // Get upcoming events
    const upcomingEvents = await Event.findAll({
      where: {
        start_date: {
          [db.Sequelize.Op.gte]: new Date()
        }
      },
      include: [
        {
          model: db.Venue,
          attributes: ['id', 'name', 'city']
        }
      ],
      order: [['start_date', 'ASC']],
      limit: 5
    });
    
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      user: req.user,
      stats: {
        users: usersCount,
        events: eventsCount,
        upcomingEvents: upcomingEventsCount,
        tickets: ticketsCount,
        ticketsSold: ticketsSoldCount,
        totalRevenue: totalRevenue || 0
      },
      recentUsers,
      upcomingEvents
    }); 
  } catch (error) {
    logger.error(`Error rendering admin dashboard: ${error.message}`);
    req.flash('error_msg', 'Error loading dashboard');
    res.redirect('/dashboard');
  }
};

/**
 * Render users management page
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.renderUsersPage = async (req, res) => {
  try {
    // Get roles
    const roles = await Role.findAll();
    
    // Get all users
    const users = await User.findAll({
      include: [
        {
          model: Role,
          through: { attributes: [] }
        }
      ],
      attributes: { exclude: ['password', 'reset_token', 'reset_token_expires', 'verification_token'] },
      order: [['created_at', 'DESC']]
    });
    
    res.render('admin/users', {
      title: 'Users Management',
      user: req.user,
      users,
      roles
    });
  } catch (error) {
    logger.error(`Error rendering users page: ${error.message}`);
    req.flash('error_msg', 'Error loading users');
    res.redirect('/admin');
  }
};

/**
 * Render departments page
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.renderDepartmentsPage = async (req, res) => {
  try {
    // Get departments
    const departments = await Department.findAll({
      include: [
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'first_name', 'last_name']
        }
      ],
      order: [['name', 'ASC']]
    });
    
    res.render('admin/departments', {
      title: 'Departments',
      user: req.user,
      departments
    });
  } catch (error) {
    logger.error(`Error rendering departments page: ${error.message}`);
    req.flash('error_msg', 'Error loading departments');
    res.redirect('/admin');
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
    // Get payment methods
    const paymentMethods = await PaymentMethod.findAll({
      order: [['name', 'ASC']]
    });
    
    // Get recent payments
    const recentPayments = await Payment.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: Ticket,
          include: [{
            model: Event,
            attributes: ['id', 'title']
          }]
        },
        {
          model: PaymentMethod
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 20
    });
    
    res.render('admin/payments', {
      title: 'Payments',
      user: req.user,
      paymentMethods,
      recentPayments
    });
  } catch (error) {
    logger.error(`Error rendering payments page: ${error.message}`);
    req.flash('error_msg', 'Error loading payments');
    res.redirect('/admin');
  }
};

/**
 * Render settings page
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.renderSettingsPage = async (req, res) => {
  try {
    res.render('admin/settings', {
      title: 'Settings',
      user: req.user
    });
  } catch (error) {
    logger.error(`Error rendering settings page: ${error.message}`);
    req.flash('error_msg', 'Error loading settings');
    res.redirect('/admin');
  }
};