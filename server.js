const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const helmet = require("helmet");
const methodOverride = require("method-override");
const passport = require("passport");
const rateLimit = require("express-rate-limit");

// Load environment variables
dotenv.config();

// Initialize database
const db = require("./config/database");

// Test database connection
db.authenticate()
  .then(() => console.log("Database connection established"))
  .catch((err) => console.error("Database connection error:", err));

// Initialize Express app
const app = express();

// Set security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
      },
    },
  }),
);

// Set up rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
});
app.use("/api", limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Method override for PUT and DELETE requests
app.use(methodOverride("_method"));

// Cookie parser
app.use(cookieParser());

// Set up sessions
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true, // This will reset the expiration countdown on every request
    cookie: {
      httpOnly: true,
      maxAge: 5 * 1000, // 30 minutes in milliseconds
    },
  }),
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());
require("./config/passport")(passport);

// Connect flash for flash messages
app.use(flash());

// Global variables for flash messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Import routes
const indexRoutes = require("./routes/indexRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

// Use routes
app.use("/", indexRoutes);
app.use("/auth", authRoutes);
app.use("/user", userRoutes);

// Error handling middleware
const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);

// Handle 404s
app.use((req, res) => {
  res.status(404).render("error", {
    title: "404 Not Found",
    message: "The page you are looking for does not exist.",
  });
});

// Set PORT
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
