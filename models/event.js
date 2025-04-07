const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('concert', 'seminar', 'workshop', 'conference', 'exhibition', 'other'),
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  venue: {
    type: DataTypes.STRING,
    allowNull: false
  },
  venueAddress: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'upcoming', 'ongoing', 'completed', 'cancelled'),
    defaultValue: 'draft'
  },
  bannerImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  organizerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  maxAttendees: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  cancellationPolicy: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  organizerCommissionRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 10.00 // Default 10% commission
  }
});

// Event Associations
Event.belongsTo(User, { as: 'organizer', foreignKey: 'organizerId' });



module.exports = Event;