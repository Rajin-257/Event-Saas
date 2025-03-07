const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Department = require("./department");

const Guest = sequelize.define(
  "Guest",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    picture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    department: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Department,
        key: "id",
      },
    },
    designation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    organization: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    soc_youtube: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    soc_fb: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    soc_insta: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    soc_tiktok: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    soc_likee: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    soc_youtube_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    soc_fb_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    soc_insta_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    soc_tiktok_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    soc_likee_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
    tableName: "guests",
  },
);

// Create association with Department model
Guest.belongsTo(Department, { foreignKey: "department" });
Department.hasMany(Guest, { foreignKey: "department" });

module.exports = Guest;
