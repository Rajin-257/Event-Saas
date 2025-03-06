// models/index.js
const sequelize = require("../config/database");
const User = require("./User");
const FrontPage = require("./frontpage");
const menuSettings = require("./menusetting");

// Initialize models if needed
// Add any model associations here if needed

// Function to sync database
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
  syncDatabase,
};
