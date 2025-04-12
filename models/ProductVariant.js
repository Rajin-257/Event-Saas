const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductVariant = sequelize.define('ProductVariant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  size: {
    type: DataTypes.STRING,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true
  },
  additionalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  variantSku: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
});

module.exports = ProductVariant;