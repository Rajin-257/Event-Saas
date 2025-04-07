const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const { Ticket } = require('./Ticket');

const Referral = sequelize.define('Referral', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  referrerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  referredUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  ticketId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: Ticket,
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  commissionRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 5.00 // Default 5% commission
  },
  commissionAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

// Commission payout tracking
const CommissionPayout = sequelize.define('CommissionPayout', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'processed', 'failed'),
    defaultValue: 'pending'
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  requestedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

// Referral Associations
Referral.belongsTo(User, { as: 'referrer', foreignKey: 'referrerId',onDelete:'CASCADE' });
Referral.belongsTo(User, { as: 'referredUser', foreignKey: 'referredUserId',onDelete:'CASCADE' });
Referral.belongsTo(Ticket, { foreignKey: 'ticketId',onDelete:'CASCADE' });

CommissionPayout.belongsTo(User, { foreignKey: 'userId',onDelete:'CASCADE' });
User.hasMany(CommissionPayout, { foreignKey: 'userId',onDelete:'CASCADE' });



module.exports = { Referral, CommissionPayout };