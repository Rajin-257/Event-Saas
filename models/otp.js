// models/otp.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OTP = sequelize.define('OTP', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    ticket_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tickets',
        key: 'id'
      }
    },
    code: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    purpose: {
      type: DataTypes.ENUM('ticket_view', 'verification', 'reset_password', 'login'),
      allowNull: false
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    is_used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'otps',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { fields: ['code'] },
      { fields: ['expires_at'] }
    ]
  });

  return OTP;
};