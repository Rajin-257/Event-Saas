/**
 * Database Update Script
 * 
 * This script updates the database schema and adds the necessary data for the EventGuest and Payment models.
 * Run with: node scripts/update-db.js
 */

require('dotenv').config();
const db = require('../models');
const logger = require('../utils/logger');

// Main function
async function updateDatabase() {
  try {
    logger.info('Starting database update...');
    
    // Sync database without dropping tables
    await db.sequelize.sync({ alter: true });
    logger.info('Database schema updated');
    
    // Create default payment methods if they don't exist
    await createDefaultPaymentMethods();
    
    logger.info('Database update completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error(`Database update failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Create default payment methods
async function createDefaultPaymentMethods() {
  logger.info('Creating default payment methods...');
  
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
  
  for (const method of paymentMethods) {
    await db.PaymentMethod.findOrCreate({
      where: { name: method.name },
      defaults: method
    });
  }
  
  const count = await db.PaymentMethod.count();
  logger.info(`${count} payment methods available`);
}

// Run update
updateDatabase();