const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const { Ticket } = require('./Ticket');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ticketId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Ticket,
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('bkash', 'nagad', 'rocket', 'card', 'manual'),
    allowNull: false
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  paymentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  gatewayResponse: {
    type: DataTypes.JSON,
    allowNull: true
  },
  refundAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  refundDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refundReason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  }
});

// Payment Associations
Payment.belongsTo(Ticket, { foreignKey: 'ticketId',onDelete:'CASCADE' });
Ticket.hasOne(Payment, { foreignKey: 'ticketId',onDelete:'CASCADE' });

Payment.belongsTo(User, { foreignKey: 'userId',onDelete:'CASCADE' });
User.hasMany(Payment, { foreignKey: 'userId',onDelete:'CASCADE' });



module.exports = Payment;