const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Guest = require("./guest");

const EventDetails = sequelize.define(
  "EventDetails",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    event_location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    event_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hosted_by: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    guest_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Guest,
        key: "id",
      },
    },
    guest_topic: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    underscored: true,
    timestamps: true,
    tableName: "event_details",
  },
);

// Set up the associations
EventDetails.belongsTo(Guest, { foreignKey: "guest_id" });
Guest.hasMany(EventDetails, { foreignKey: "guest_id" });

module.exports = EventDetails;
