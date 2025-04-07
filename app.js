require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const methodOverride = require('method-override');

// Initialize Express
const app = express();

// Initialize all models and their associations
const initializeModels = async () => {
  // Import models
  const User = require('./models/User');
  const Event = require('./models/Event');
  const { Ticket, TicketType } = require('./models/Ticket');
  const CheckIn = require('./models/CheckIn');
  const { Coupon, CouponUsage } = require('./models/Coupon');
  const Payment = require('./models/Payment');
  const { Referral, CommissionPayout } = require('./models/Referral');
  const Speaker = require('./models/Speaker');
  
  // Get DB instance
  const sequelize = require('./config/db');
  
  // Sync database in development environment
  if (process.env.NODE_ENV !== 'production') {
    try {
      await sequelize.sync({ alter: false });
      console.log('All database models synced successfully');
    } catch (error) {
      console.error('Error syncing database models:', error);
      process.exit(1); // Exit if database sync fails
    }
  }
  
  return {
    User, Event, Ticket, TicketType, CheckIn, Coupon, 
    CouponUsage, Payment, Referral, CommissionPayout, Speaker
  };
};

// Passport Config
require('./config/passport')(passport);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// EJS
app.set('view engine', 'ejs');

// Express Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

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
  res.locals.user = req.user || null;
  next();
});

// Initialize models and start server
const startServer = async () => {
  // Initialize and sync models
  await initializeModels();
  
  // Routes
  app.use('/', require('./routes/authRoutes'));
  app.use('/events', require('./routes/eventRoutes'));
  app.use('/tickets', require('./routes/ticketRoutes'));
  app.use('/users', require('./routes/userRoutes'));
  app.use('/payments', require('./routes/paymentRoutes'));
  app.use('/reports', require('./routes/reportRoutes'));
  
  // 404 handler
  app.use((req, res) => {
    res.status(404).render('errors/404', { title: 'Page Not Found' });
  });
  
  // Error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('errors/500', { title: 'Server Error' });
  });
  
  // Start server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

// Start the application
startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});