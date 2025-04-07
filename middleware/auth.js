module.exports = {
    // Ensure user is authenticated
    ensureAuthenticated: (req, res, next) => {
      if (req.isAuthenticated()) {
        return next();
      }
      req.flash('error_msg', 'Please log in to access this page');
      res.redirect('/login');
    },
    
    // Ensure user is not authenticated (for login/register pages)
    forwardAuthenticated: (req, res, next) => {
      if (!req.isAuthenticated()) {
        return next();
      }
      res.redirect('/dashboard');
    },
  
    // Check if user has admin role
    ensureAdmin: (req, res, next) => {
      if (req.isAuthenticated() && req.user.role === 'super_admin') {
        return next();
      }
      req.flash('error_msg', 'You do not have permission to access this page');
      res.redirect('/dashboard');
    },
  
    // Check if user is an organizer or admin
    ensureOrganizer: (req, res, next) => {
      if (req.isAuthenticated() && (req.user.role === 'organizer' || req.user.role === 'super_admin')) {
        return next();
      }
      req.flash('error_msg', 'You need to be an event organizer to access this page');
      res.redirect('/dashboard');
    },
  
    // Check if user is an event owner (for event-specific operations)
    ensureEventOwner: async (req, res, next) => {
      try {
        if (!req.isAuthenticated()) {
          req.flash('error_msg', 'Please log in to access this page');
          return res.redirect('/login');
        }
  
        const Event = require('../models/Event');
        const eventId = req.params.id || req.body.eventId;
        
        // If no event ID provided
        if (!eventId) {
          req.flash('error_msg', 'Invalid event');
          return res.redirect('/events');
        }
  
        const event = await Event.findByPk(eventId);
        
        // If event not found
        if (!event) {
          req.flash('error_msg', 'Event not found');
          return res.redirect('/events');
        }
  
        // Allow if user is event organizer or admin
        if (event.organizerId === req.user.id || req.user.role === 'super_admin') {
          return next();
        }
  
        req.flash('error_msg', 'You do not have permission to manage this event');
        res.redirect('/events');
      } catch (err) {
        console.error('Error in ensureEventOwner middleware:', err);
        req.flash('error_msg', 'An error occurred');
        res.redirect('/dashboard');
      }
    }
  };