const Event = require('../models/Event');
const EventCategory = require('../models/EventCategory');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const logger = require('../utils/logger');
const dateFormatter = require('../utils/dateFormatter');
const { Op } = require('sequelize');

// Home page
exports.getHomePage = async (req, res) => {
  try {
    // Get featured events (ongoing and upcoming)
    const featuredEvents = await Event.findAll({
      where: {
        isPublished: true,
        status: {
          [Op.in]: ['Ongoing', 'Upcoming']
        },
        endDate: {
          [Op.gte]: new Date()
        }
      },
      include: [
        { model: EventCategory, as: 'category' }
      ],
      order: [
        ['status', 'ASC'],
        ['startDate', 'ASC']
      ],
      limit: 6
    });
    
    // Get event categories
    const categories = await EventCategory.findAll({
      order: [['name', 'ASC']],
      limit: 8
    });
    
    res.render('public/home', {
      title: 'Home',
      featuredEvents,
      categories,
      dateFormatter,
      user: req.user || null,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error loading home page', { error: error.message });
    res.render('public/home', {
      title: 'Home',
      featuredEvents: [],
      categories: [],
      dateFormatter,
      user: req.user || null,
      messages: { error: ['Failed to load content. Please try again later.'] }
    });
  }
};

// Events listing
exports.getEventsPage = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const offset = (page - 1) * limit;
    
    // Filters
    const filters = {
      isPublished: true
    };
    
    if (req.query.category) {
      filters.categoryId = req.query.category;
    }
    
    if (req.query.status) {
      filters.status = req.query.status;
    } else {
      // By default, show ongoing and upcoming events
      filters.endDate = {
        [Op.gte]: new Date()
      };
    }
    
    if (req.query.search) {
      filters.title = {
        [Op.like]: `%${req.query.search}%`
      };
    }
    
    // Get events
    const { count, rows: events } = await Event.findAndCountAll({
      where: filters,
      include: [
        { model: EventCategory, as: 'category' }
      ],
      order: [
        ['status', 'ASC'],
        ['startDate', 'ASC']
      ],
      limit,
      offset
    });
    
    // Get categories for filter
    const categories = await EventCategory.findAll({
      order: [['name', 'ASC']]
    });
    
    res.render('public/events', {
      title: 'Events',
      events,
      categories,
      filters: req.query,
      pagination: {
        page,
        pageCount: Math.ceil(count / limit),
        count
      },
      dateFormatter,
      user: req.user || null,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error loading events page', { error: error.message });
    req.flash('error', 'Failed to load events');
    res.redirect('/');
  }
};

// Single event detail
exports.getEventDetailPage = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Find event by ID or slug
    const eventQuery = isNaN(slug) 
      ? { slug, isPublished: true }
      : { id: slug, isPublished: true };
    
    const event = await Event.findOne({
      where: eventQuery,
      include: [
        { model: EventCategory, as: 'category' },
        { model: Sponsor, as: 'sponsors' },
        { 
          model: Ticket, 
          as: 'tickets',
          where: {
            isActive: true,
            quantity: {
              [Op.gt]: sequelize.col('quantitySold')
            },
            saleStartDate: {
              [Op.lte]: new Date()
            },
            saleEndDate: {
              [Op.gte]: new Date()
            }
          },
          required: false
        }
      ]
    });
    
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }
    
    // Get related events
    const relatedEvents = await Event.findAll({
      where: {
        categoryId: event.categoryId,
        id: {
          [Op.ne]: event.id
        },
        isPublished: true,
        endDate: {
          [Op.gte]: new Date()
        }
      },
      limit: 3
    });
    
    res.render('public/event-detail', {
      title: event.title,
      event,
      relatedEvents,
      dateFormatter,
      user: req.user || null,
      canBook: req.user && event.status !== 'Completed' && new Date(event.endDate) >= new Date(),
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error loading event detail page', { error: error.message });
    req.flash('error', 'Failed to load event details');
    res.redirect('/events');
  }
};

// About page
exports.getAboutPage = (req, res) => {
  res.render('public/about', {
    title: 'About Us',
    user: req.user || null
  });
};

// Contact page
exports.getContactPage = (req, res) => {
  res.render('public/contact', {
    title: 'Contact Us',
    user: req.user || null,
    messages: req.flash()
  });
};

// Process contact form
exports.postContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Here you would typically save to a database or send an email
    
    req.flash('success', 'Your message has been sent. We will contact you soon!');
    res.redirect('/contact');
  } catch (error) {
    logger.error('Error processing contact form', { error: error.message });
    req.flash('error', 'Failed to send message');
    res.redirect('/contact');
  }
};