const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sponsor = sequelize.define('Sponsor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('Sponsor', 'Partner'),
    defaultValue: 'Sponsor'
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = Sponsor;