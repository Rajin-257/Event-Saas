// models/sponsor.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Sponsor = sequelize.define(
  "Sponsor",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING, // Stores the path to the sponsor logo/image
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "sponsors",
    timestamps: true, // Automatically manages createdAt and updatedAt
  },
);

module.exports = Sponsor;
