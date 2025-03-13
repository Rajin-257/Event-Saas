// models/ticket.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Ticket = sequelize.define('Ticket', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    ticket_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    event_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'events',
        key: 'id'
      }
    },
    ticket_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ticket_types',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    purchaser_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    purchaser_email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    purchaser_phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    referral_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'used'),
      defaultValue: 'pending'
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      defaultValue: 'pending'
    },
    checked_in: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    checked_in_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    attendee_photo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    qr_code: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'tickets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['ticket_code'] },
      { fields: ['status'] },
      { fields: ['payment_status'] }
    ]
  });

  return Ticket;
};