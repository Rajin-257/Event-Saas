const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NewsletterSubscriber = sequelize.define('NewsletterSubscriber', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = NewsletterSubscriber;