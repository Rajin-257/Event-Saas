/**
 * Database Initialization Script
 * 
 * This script creates the initial database tables and populates them with default data.
 * Run with: node scripts/init-db.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../models');
const logger = require('../utils/logger');

// Models
const User = db.User;
const Role = db.Role;
const Department = db.Department;
const PaymentMethod = db.PaymentMethod;

// Main function
async function initializeDatabase() {
  try {
    logger.info('Starting database initialization...');
    
    // Sync database with force option to drop existing tables
    await db.sequelize.sync({ force: true });
    logger.info('Database schema created');
    
    // Create default roles
    await createRoles();
    
    // Create admin user
    await createAdminUser();
    
    // Create default departments
    await createDepartments();
    
    // Create payment methods
    await createPaymentMethods();
    
    logger.info('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error(`Database initialization failed: ${error.message}`);
    process.exit(1);
  }
}

// Create default roles
async function createRoles() {
  logger.info('Creating default roles...');
  
  const roles = [
    {
      name: 'admin',
      description: 'Administrator with full access'
    },
    {
      name: 'organizer',
      description: 'Can create and manage events'
    },
    {
      name: 'user',
      description: 'Regular user with limited access'
    },
    {
      name: 'guest',
      description: 'Guest user for event attendees'
    }
  ];
  
  await Role.bulkCreate(roles);
  logger.info(`Created ${roles.length} roles`);
}

// Create admin user
async function createAdminUser() {
  logger.info('Creating admin user...');
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);
  
  // Create admin user
  const admin = await User.create({
    first_name: 'Admin',
    last_name: 'User',
    email: 'admin@example.com',
    phone: '+1234567890',
    password: hashedPassword,
    is_verified: true,
    status: 'active'
  });
  
  // Assign admin role
  const adminRole = await Role.findOne({ where: { name: 'admin' } });
  await admin.addRole(adminRole);
  
  logger.info('Admin user created');
}

// Create default departments
async function createDepartments() {
  logger.info('Creating default departments...');
  
  const admin = await User.findOne({ where: { email: 'admin@example.com' } });
  
  const departments = [
    {
      name: 'Management',
      description: 'Management and executive team',
      created_by: admin.id
    },
    {
      name: 'Marketing',
      description: 'Marketing and PR team',
      created_by: admin.id
    },
    {
      name: 'Technology',
      description: 'IT and technical support',
      created_by: admin.id
    },
    {
      name: 'Operations',
      description: 'Event operations team',
      created_by: admin.id
    },
    {
      name: 'Finance',
      description: 'Finance and accounting',
      created_by: admin.id
    }
  ];
  
  await Department.bulkCreate(departments);
  logger.info(`Created ${departments.length} departments`);
}

// Create payment methods
async function createPaymentMethods() {
  logger.info('Creating payment methods...');
  
  const paymentMethods = [
    {
      name: 'Credit Card',
      description: 'Pay with Visa, Mastercard, or American Express',
      is_active: true
    },
    {
      name: 'bKash',
      description: 'Pay using bKash mobile banking',
      is_active: true
    },
    {
      name: 'Nagad',
      description: 'Pay using Nagad mobile banking',
      is_active: true
    },
    {
      name: 'Bank Transfer',
      description: 'Direct bank transfer to our account',
      is_active: true
    },
    {
      name: 'Cash',
      description: 'Pay in cash at our office',
      is_active: true
    }
  ];
  
  await PaymentMethod.bulkCreate(paymentMethods);
  logger.info(`Created ${paymentMethods.length} payment methods`);
}

// Run initialization
initializeDatabase();