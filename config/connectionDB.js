import Sequelize from "sequelize";
import "dotenv/config";

// Fetch timezone from .env or default to 'UTC'
const timezone = process.env.DB_TIMEZONE || "UTC";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      underscored: true,
      freezeTableName: false,
      charset: "utf8",
      dialectOptions: {
        collate: "utf8_general_ci",
      },
      timestamps: true,
    },
    timezone: "+06:00", //Only For Bangladesh Time Zone
  },
);

export default sequelize;
