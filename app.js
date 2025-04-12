const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cors = require('cors');
const expressLayouts = require('express-ejs-layouts'); // Add this
const sequelize = require('./config/database');
const logger = require('./utils/logger');
require('dotenv').config();
require('./models/index');


// Initialize Express app
const app = express();

// Set the port
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts); // Add this
app.set('layout', 'layouts/main'); // Set default layout

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://code.jquery.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdn.jsdelivr.net'],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'"],
    },
  },
}));
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Flash messages
app.use(flash());

// Make user available to all views
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.currentPath = req.path;
  next();
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');
const ticketRoutes = require('./routes/tickets');
const bookingRoutes = require('./routes/bookings');
const productRoutes = require('./routes/products');
const reportRoutes = require('./routes/reports');
const dashboardRoutes = require('./routes/dashboard');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const newsletterRoutes = require('./routes/newsletter');

// Define routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/events', eventRoutes);
app.use('/tickets', ticketRoutes);
app.use('/bookings', bookingRoutes);
app.use('/products', productRoutes);
app.use('/reports', reportRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/', publicRoutes);
app.use('/admin', adminRoutes);
app.use('/newsletter', newsletterRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).render('errors/404', {
    title: 'Page Not Found',
    layout: 'layouts/main'
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Application error', { error: err.message, stack: err.stack });
  
  res.status(err.status || 500).render('errors/500', {
    title: 'Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    layout: 'layouts/main'
  });
});

// Database connection and server start
sequelize.sync({ alter: process.env.NODE_ENV !== 'production' })
  .then(() => {
    logger.info('Database connected');
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    logger.error('Database connection error', { error: err.message });
    console.error('Database connection error:', err);
  });

module.exports = app;