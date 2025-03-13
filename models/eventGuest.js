// models/eventGuest.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EventGuest = sequelize.define('EventGuest', {
    event_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'events',
        key: 'id'
      }
    },
    guest_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'guests',
        key: 'id'
      }
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'event_guests',
    timestamps: false
  });

  return EventGuest;
};