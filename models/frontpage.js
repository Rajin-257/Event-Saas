const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrontpageSettings = sequelize.define(
  "FrontpageSettings",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Logo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fav: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    main_photo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    webtitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    office_location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    soc_fb: {
      type: DataTypes.STRING(255),
      defaultValue: "https://www.facebook.com/",
    },
    soc_insta: {
      type: DataTypes.STRING(255),
      defaultValue: "https://www.instagram.com/",
    },
    soc_youtube: {
      type: DataTypes.STRING(255),
      defaultValue: "https://www.youtube.com/",
    },
  },
  {
    tableName: "frontpage_settings", // Corrected the typo from "fronpage_settings"
    timestamps: true, // Adding timestamps to be consistent with your User model
  },
);

module.exports = FrontpageSettings;
