const express = require('express');
const path = require('path');
const createError = require('http-errors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const rateLimit = require('express-rate-limit');

// Routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const userRoutes = require('./routes/userRoutes');
const venueRoutes = require('./routes/venueRoutes');
const guestRoutes = require('./routes/guestRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const eventGuestRoutes = require('./routes/eventGuestRoutes');
require('dotenv').config();

// Error handler middleware
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./utils/logger');

// Initialize Express app
const app = express();

// Set up passport configuration
require('./config/passport')(passport);

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Global middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use((req, res, next) => {
  res.locals.APP_URL = process.env.APP_URL;
  next();
});

// Set security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
        fontSrc: ["'self'", 'fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
      },
    },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter);

// Enable CORS
app.use(cors());

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Express session
// Express session
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_very_secure_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'development' && process.env.HTTPS === 'true',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    }
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.messages = req.flash();
  res.locals.user = req.user || null;
  next();
});

// Routes
app.use('/', authRoutes);
app.use('/events', eventRoutes);
app.use('/tickets', ticketRoutes);
app.use('/users', userRoutes);
app.use('/venues', venueRoutes);
app.use('/guests', guestRoutes);
app.use('/payments', paymentRoutes);
app.use('/admin', adminRoutes);
app.use('/eventguest', eventGuestRoutes);

// 404 handler
app.use((req, res, next) => {
  next(createError(404, 'Page not found'));
});

// Error handler
app.use(errorHandler);

module.exports = app;