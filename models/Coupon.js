const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Event = require('./Event');

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  discountType: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    allowNull: false,
    defaultValue: 'percentage'
  },
  discountValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  minPurchaseAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  maxDiscountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  usageLimit: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  usedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  eventId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: Event,
      key: 'id'
    }
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// CouponUsage Model to track which user used which coupon
const CouponUsage = sequelize.define('CouponUsage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  couponId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Coupon,
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  ticketId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  usedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
});

// Cupon Associations
Coupon.belongsTo(Event, { foreignKey: 'eventId',onDelete:'CASCADE' });
Event.hasMany(Coupon, { foreignKey: 'eventId',onDelete:'CASCADE' });

Coupon.hasMany(CouponUsage, { foreignKey: 'couponId',onDelete:'CASCADE' });
CouponUsage.belongsTo(Coupon, { foreignKey: 'couponId',onDelete:'CASCADE' });



module.exports = { Coupon, CouponUsage };