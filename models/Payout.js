const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payout = sequelize.define('Payout', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Paid', 'Cancelled'),
    defaultValue: 'Pending'
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  processedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = Payout;