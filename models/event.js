const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  categoryId: {
    type: DataTypes.INTEGER,
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
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Upcoming', 'Ongoing', 'Completed'),
    defaultValue: 'Upcoming'
  },
  featuredImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = Event;