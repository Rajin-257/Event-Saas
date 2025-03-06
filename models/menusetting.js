const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Adjust path as needed

const MenuSettings = sequelize.define(
  "MenuSettings",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    web_title: {
      type: DataTypes.STRING,
      defaultValue: "Menu",
    },
    menu_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    address_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    fb_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    insta_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    youtube_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "menu_settings",
    timestamps: true,
  },
);

module.exports = MenuSettings;
