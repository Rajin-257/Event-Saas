const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Event = require('./Event');

const Speaker = sequelize.define('Speaker', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  eventId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Event,
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  designation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  organization: {
    type: DataTypes.STRING,
    allowNull: true
  },
  speakerType: {
    type: DataTypes.ENUM('keynote', 'guest', 'regular', 'panel'),
    defaultValue: 'regular'
  },
  sessionTopic: {
    type: DataTypes.STRING,
    allowNull: true
  },
  sessionTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sessionDuration: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: true
  },
  socialLinks: {
    type: DataTypes.JSON,
    allowNull: true
  }
});

// Speaker Associations
Speaker.belongsTo(Event, { foreignKey: 'eventId' });
Event.hasMany(Speaker, { foreignKey: 'eventId' });



module.exports = Speaker;