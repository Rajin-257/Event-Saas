const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ticketId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  promoCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  referralCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Confirmed', 'Cancelled', 'Refunded'),
    defaultValue: 'Pending'
  },
  paymentMethod: {
    type: DataTypes.ENUM('Bkash', 'Nagad', 'Card', 'Cash'),
    allowNull: false
  },
  paymentStatus: {
    type: DataTypes.ENUM('Pending', 'Paid', 'Failed', 'Refunded'),
    defaultValue: 'Pending'
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  qrCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isCheckedIn: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  checkedInAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  checkedInBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
});

module.exports = Booking;