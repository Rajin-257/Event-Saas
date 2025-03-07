const sequelize = require("../config/database");
const User = require("./User");
const Department = require("./department");
const EventDetails = require("./eventDetails");
const FrontPage = require("./frontpage");
const Gallery = require("./gallery");
const Guest = require("./guest");
const menuSettings = require("./menusetting");
const Sponsor = require("./sponsor");

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: process.env.NODE_ENV === "development" });
    console.log("Database synced successfully");
  } catch (error) {
    console.error("Error syncing database:", error);
  }
};

module.exports = {
  sequelize,
  User,
  FrontPage,
  menuSettings,
  Guest,
  Department,
  EventDetails,
  Gallery,
  Sponsor,
  syncDatabase,
};
