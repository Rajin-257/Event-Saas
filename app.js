import express from "express";
import dotenv from "dotenv";
import path from "path";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";

//import Local Module
import sequelize from "./config/connectionDB.js";
import routes from "./routes/index.js";

dotenv.config();
const PORT = process.env.PORT || 8000;
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    credentials: true,
    origin: process.env.frontend_url,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);
app.use("/static", express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/", routes);

app.get("/", (req, res) => {
  res.json({
    message: "Server is running on port " + PORT,
  });
});

app.get("/dashboard", (req, res) => {
  res.render("backend/index");
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

startServer();
