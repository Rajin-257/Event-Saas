const Event = require('../models/Event');
const EventCategory = require('../models/EventCategory');
const Sponsor = require('../models/Sponsor');
const Ticket = require('../models/Ticket');
const { Op } = require('sequelize');
const upload = require('../middleware/upload');
const logger = require('../utils/logger');
const dateFormatter = require('../utils/dateFormatter');
const sequelize = require('../config/database');

// List all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [
        { model: EventCategory, as: 'category' }
      ],
      order: [['startDate', 'DESC']]
    });
    
    res.render('events/index', {
      title: 'All Events',
      events,
      dateFormatter,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error fetching events', { error: error.message });
    req.flash('error', 'Failed to fetch events');
    res.redirect('/dashboard');
  }
};

// Show create event form
exports.getCreateEvent = async (req, res) => {
  try {
    const categories = await EventCategory.findAll();
    
    res.render('events/create', {
      title: 'Create Event',
      categories,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error loading create event page', { error: error.message });
    req.flash('error', 'Failed to load create event page');
    res.redirect('/events');
  }
};

// Process event creation
exports.postCreateEvent = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      title,
      description,
      categoryId,
      startDate,
      endDate,
      venue,
      address,
      capacity,
      isPublished
    } = req.body;
    
    // Check if there's already an ongoing event
    if (req.body.status === 'Ongoing') {
      const ongoingEvent = await Event.findOne({
        where: {
          status: 'Ongoing'
        },
        transaction
      });
      
      if (ongoingEvent) {
        await transaction.rollback();
        req.flash('error', 'There is already an ongoing event. Only one event can be ongoing at a time.');
        return res.redirect('/events/create');
      }
    }
    
    // Create event
    const event = await Event.create({
      title,
      description,
      categoryId,
      startDate,
      endDate,
      venue,
      address,
      status: req.body.status,
      featuredImage: req.file ? `/uploads/events/${req.file.filename}` : null,
      capacity,
      isPublished: isPublished === 'on',
      createdBy: req.user.id
    }, { transaction });
    
    await transaction.commit();
    
    logger.info(`Event created: ${title}`, { userId: req.user.id, eventId: event.id });
    
    req.flash('success', 'Event created successfully');
    res.redirect(`/events/${event.id}`);
  } catch (error) {
    await transaction.rollback();
    logger.error('Event creation error', { error: error.message, userId: req.user.id });
    req.flash('error', 'Failed to create event');
    res.redirect('/events/create');
  }
};

// Show single event
exports.getEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findByPk(id, {
      include: [
        { model: EventCategory, as: 'category' },
        { model: Sponsor, as: 'sponsors' },
        { model: Ticket, as: 'tickets' }
      ]
    });
    
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }
    
    res.render('events/show', {
      title: event.title,
      event,
      dateFormatter,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error fetching event', { error: error.message });
    req.flash('error', 'Failed to fetch event details');
    res.redirect('/events');
  }
};

// Show edit event form
exports.getEditEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findByPk(id);
    
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }
    
    const categories = await EventCategory.findAll();
    
    res.render('events/edit', {
      title: `Edit ${event.title}`,
      event,
      categories,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error loading edit event page', { error: error.message });
    req.flash('error', 'Failed to load edit page');
    res.redirect('/events');
  }
};

// Process event update
exports.postUpdateEvent = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const {
      title,
      description,
      categoryId,
      startDate,
      endDate,
      venue,
      address,
      capacity,
      isPublished
    } = req.body;
    
    const event = await Event.findByPk(id, { transaction });
    
    if (!event) {
      await transaction.rollback();
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }
    
    // Check if there's already an ongoing event
    if (req.body.status === 'Ongoing' && event.status !== 'Ongoing') {
      const ongoingEvent = await Event.findOne({
        where: {
          status: 'Ongoing',
          id: { [Op.ne]: id }
        },
        transaction
      });
      
      if (ongoingEvent) {
        await transaction.rollback();
        req.flash('error', 'There is already an ongoing event. Only one event can be ongoing at a time.');
        return res.redirect(`/events/${id}/edit`);
      }
    }
    
    // Update event
    event.title = title;
    event.description = description;
    event.categoryId = categoryId;
    event.startDate = startDate;
    event.endDate = endDate;
    event.venue = venue;
    event.address = address;
    event.status = req.body.status;
    event.capacity = capacity;
    event.isPublished = isPublished === 'on';
    
    if (req.file) {
      event.featuredImage = `/uploads/events/${req.file.filename}`;
    }
    
    await event.save({ transaction });
    
    await transaction.commit();
    
    logger.info(`Event updated: ${title}`, { userId: req.user.id, eventId: event.id });
    
    req.flash('success', 'Event updated successfully');
    res.redirect(`/events/${id}`);
  } catch (error) {
    await transaction.rollback();
    logger.error('Event update error', { error: error.message, userId: req.user.id });
    req.flash('error', 'Failed to update event');
    res.redirect(`/events/${req.params.id}/edit`);
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    const event = await Event.findByPk(id, { transaction });
    
    if (!event) {
      await transaction.rollback();
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }
    
    // Check if event has tickets or bookings
    const tickets = await Ticket.findAll({
      where: { eventId: id },
      transaction
    });
    
    if (tickets.length > 0) {
      await transaction.rollback();
      req.flash('error', 'Cannot delete event with tickets. Please delete all tickets first.');
      return res.redirect(`/events/${id}`);
    }
    
    // Delete sponsors
    await Sponsor.destroy({
      where: { eventId: id },
      transaction
    });
    
    // Delete event
    await event.destroy({ transaction });
    
    await transaction.commit();
    
    logger.info(`Event deleted: ${event.title}`, { userId: req.user.id, eventId: id });
    
    req.flash('success', 'Event deleted successfully');
    res.redirect('/events');
  } catch (error) {
    await transaction.rollback();
    logger.error('Event deletion error', { error: error.message, userId: req.user.id });
    req.flash('error', 'Failed to delete event');
    res.redirect(`/events/${req.params.id}`);
  }
};

// Event categories
exports.getEventCategories = async (req, res) => {
  try {
    const categories = await EventCategory.findAll();
    
    res.render('events/categories', {
      title: 'Event Categories',
      categories,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error fetching event categories', { error: error.message });
    req.flash('error', 'Failed to fetch categories');
    res.redirect('/dashboard');
  }
};

// Create event category
exports.postCreateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    await EventCategory.create({
      name,
      description,
      icon: req.file ? `/uploads/categories/${req.file.filename}` : null
    });
    
    logger.info(`Event category created: ${name}`, { userId: req.user.id });
    
    req.flash('success', 'Category created successfully');
    res.redirect('/events/categories');
  } catch (error) {
    logger.error('Category creation error', { error: error.message, userId: req.user.id });
    req.flash('error', 'Failed to create category');
    res.redirect('/events/categories');
  }
};

// Update event category
exports.postUpdateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const category = await EventCategory.findByPk(id);
    
    if (!category) {
      req.flash('error', 'Category not found');
      return res.redirect('/events/categories');
    }
    
    category.name = name;
    category.description = description;
    
    if (req.file) {
      category.icon = `/uploads/categories/${req.file.filename}`;
    }
    
    await category.save();
    
    logger.info(`Event category updated: ${name}`, { userId: req.user.id, categoryId: id });
    
    req.flash('success', 'Category updated successfully');
    res.redirect('/events/categories');
  } catch (error) {
    logger.error('Category update error', { error: error.message, userId: req.user.id });
    req.flash('error', 'Failed to update category');
    res.redirect('/events/categories');
  }
};

// Delete event category
exports.deleteCategory = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Check if category is used in any events
    const events = await Event.findAll({
      where: { categoryId: id },
      transaction
    });
    
    if (events.length > 0) {
      await transaction.rollback();
      req.flash('error', 'Cannot delete category that is used in events');
      return res.redirect('/events/categories');
    }
    
    await EventCategory.destroy({
      where: { id },
      transaction
    });
    
    await transaction.commit();
    
    logger.info(`Event category deleted`, { userId: req.user.id, categoryId: id });
    
    req.flash('success', 'Category deleted successfully');
    res.redirect('/events/categories');
  } catch (error) {
    await transaction.rollback();
    logger.error('Category deletion error', { error: error.message, userId: req.user.id });
    req.flash('error', 'Failed to delete category');
    res.redirect('/events/categories');
  }
};

// Sponsors
exports.getEventSponsors = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findByPk(id);
    
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }
    
    const sponsors = await Sponsor.findAll({
      where: { eventId: id }
    });
    
    res.render('events/sponsors', {
      title: `Sponsors - ${event.title}`,
      event,
      sponsors,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error fetching sponsors', { error: error.message });
    req.flash('error', 'Failed to fetch sponsors');
    res.redirect('/events');
  }
};

// Add sponsor
exports.postAddSponsor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, website } = req.body;
    
    const event = await Event.findByPk(id);
    
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }
    
    await Sponsor.create({
      name,
      type,
      website,
      eventId: id,
      logo: req.file ? `/uploads/sponsors/${req.file.filename}` : null
    });
    
    logger.info(`Sponsor added to event: ${event.title}`, { userId: req.user.id, eventId: id });
    
    req.flash('success', 'Sponsor added successfully');
    res.redirect(`/events/${id}/sponsors`);
  } catch (error) {
    logger.error('Sponsor creation error', { error: error.message });
    req.flash('error', 'Failed to add sponsor');
    res.redirect(`/events/${req.params.id}/sponsors`);
  }
};

// Update sponsor
exports.postUpdateSponsor = async (req, res) => {
  try {
    const { id, sponsorId } = req.params;
    const { name, type, website } = req.body;
    
    const event = await Event.findByPk(id);
    
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }
    
    const sponsor = await Sponsor.findOne({
      where: {
        id: sponsorId,
        eventId: id
      }
    });
    
    if (!sponsor) {
      req.flash('error', 'Sponsor not found');
      return res.redirect(`/events/${id}/sponsors`);
    }
    
    sponsor.name = name;
    sponsor.type = type;
    sponsor.website = website;
    
    if (req.file) {
      sponsor.logo = `/uploads/sponsors/${req.file.filename}`;
    }
    
    await sponsor.save();
    
    logger.info(`Sponsor updated: ${name}`, { userId: req.user.id, sponsorId });
    
    req.flash('success', 'Sponsor updated successfully');
    res.redirect(`/events/${id}/sponsors`);
  } catch (error) {
    logger.error('Sponsor update error', { error: error.message });
    req.flash('error', 'Failed to update sponsor');
    res.redirect(`/events/${req.params.id}/sponsors`);
  }
};

// Delete sponsor
exports.deleteSponsor = async (req, res) => {
  try {
    const { id, sponsorId } = req.params;
    
    const event = await Event.findByPk(id);
    
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }
    
    const sponsor = await Sponsor.findOne({
      where: {
        id: sponsorId,
        eventId: id
      }
    });
    
    if (!sponsor) {
      req.flash('error', 'Sponsor not found');
      return res.redirect(`/events/${id}/sponsors`);
    }
    
    await sponsor.destroy();
    
    logger.info(`Sponsor deleted: ${sponsor.name}`, { userId: req.user.id, sponsorId });
    
    req.flash('success', 'Sponsor deleted successfully');
    res.redirect(`/events/${id}/sponsors`);
  } catch (error) {
    logger.error('Sponsor deletion error', { error: error.message });
    req.flash('error', 'Failed to delete sponsor');
    res.redirect(`/events/${req.params.id}/sponsors`);
  }
};

// Generate event report
exports.getEventReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findByPk(id, {
      include: [
        { model: EventCategory, as: 'category' },
        { model: Sponsor, as: 'sponsors' },
        { model: Ticket, as: 'tickets' }
      ]
    });
    
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }
    
    // Get booking stats
    const bookingStats = await Booking.findAll({
      attributes: [
        'status',
        'paymentMethod',
        [sequelize.fn('count', sequelize.col('id')), 'count'],
        [sequelize.fn('sum', sequelize.col('totalAmount')), 'amount']
      ],
      where: {
        eventId: id
      },
      group: ['status', 'paymentMethod']
    });
    
    // Get ticket sales breakdown
    const ticketSales = await Booking.findAll({
      attributes: [
        'ticketId',
        [sequelize.fn('sum', sequelize.col('quantity')), 'quantity'],
        [sequelize.fn('sum', sequelize.col('totalAmount')), 'amount']
      ],
      where: {
        eventId: id,
        status: 'Confirmed'
      },
      include: [
        {
          model: Ticket,
          as: 'ticket',
          attributes: ['type', 'price', 'quantity']
        }
      ],
      group: ['ticketId']
    });
    
    // Calculate total revenue
    const totalRevenue = bookingStats.reduce((sum, stat) => {
      if (stat.dataValues.status === 'Confirmed') {
        return sum + parseFloat(stat.dataValues.amount || 0);
      }
      return sum;
    }, 0);
    
    // Calculate ticket sales percentage
    const ticketSalesData = ticketSales.map(sale => {
      const soldPercentage = (parseInt(sale.dataValues.quantity) / sale.ticket.quantity) * 100;
      return {
        type: sale.ticket.type,
        price: sale.ticket.price,
        sold: parseInt(sale.dataValues.quantity),
        total: sale.ticket.quantity,
        soldPercentage,
        revenue: parseFloat(sale.dataValues.amount || 0)
      };
    });
    
    res.render('events/report', {
      title: `Report - ${event.title}`,
      event,
      bookingStats,
      ticketSales: ticketSalesData,
      totalRevenue,
      dateFormatter,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Event report error', { error: error.message });
    req.flash('error', 'Failed to generate event report');
    res.redirect('/events');
  }
};

// Clone event
exports.getCloneEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findByPk(id, {
      include: [
        { model: Ticket, as: 'tickets' }
      ]
    });
    
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }
    
    const categories = await EventCategory.findAll();
    
    res.render('events/clone', {
      title: `Clone Event - ${event.title}`,
      event,
      categories,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Clone event page error', { error: error.message });
    req.flash('error', 'Failed to load clone event page');
    res.redirect('/events');
  }
};

// Process event cloning
exports.postCloneEvent = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const {
      title,
      description,
      categoryId,
      startDate,
      endDate,
      venue,
      address,
      capacity,
      cloneTickets
    } = req.body;
    
    // Get original event
    const sourceEvent = await Event.findByPk(id, {
      include: [
        { model: Ticket, as: 'tickets' }
      ],
      transaction
    });
    
    if (!sourceEvent) {
      await transaction.rollback();
      req.flash('error', 'Source event not found');
      return res.redirect('/events');
    }
    
    // Create new event
    const newEvent = await Event.create({
      title,
      description,
      categoryId,
      startDate,
      endDate,
      venue,
      address,
      status: 'Upcoming',
      featuredImage: req.file ? `/uploads/events/${req.file.filename}` : sourceEvent.featuredImage,
      capacity,
      isPublished: false,
      createdBy: req.user.id
    }, { transaction });
    
    // Clone tickets if requested
    if (cloneTickets === 'on' && sourceEvent.tickets.length > 0) {
      for (const ticket of sourceEvent.tickets) {
        await Ticket.create({
          eventId: newEvent.id,
          type: ticket.type,
          price: ticket.price,
          quantity: ticket.quantity,
          description: ticket.description,
          isActive: true,
          saleStartDate: new Date(startDate),
          saleEndDate: new Date(endDate)
        }, { transaction });
      }
    }
    
    await transaction.commit();
    
    logger.info(`Event cloned: ${sourceEvent.title} -> ${title}`, { userId: req.user.id, newEventId: newEvent.id });
    
    req.flash('success', 'Event cloned successfully');
    res.redirect(`/events/${newEvent.id}`);
  } catch (error) {
    await transaction.rollback();
    logger.error('Event cloning error', { error: error.message });
    req.flash('error', 'Failed to clone event');
    res.redirect(`/events/${req.params.id}`);
  }
};

// Toggle event publication status
exports.toggleEventPublishStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findByPk(id);
    
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }
    
    event.isPublished = !event.isPublished;
    await event.save();
    
    const action = event.isPublished ? 'published' : 'unpublished';
    logger.info(`Event ${action}: ${event.title}`, { userId: req.user.id, eventId: id });
    
    req.flash('success', `Event ${action} successfully`);
    res.redirect(`/events/${id}`);
  } catch (error) {
    logger.error('Event publish toggle error', { error: error.message });
    req.flash('error', 'Failed to update event publication status');
    res.redirect(`/events/${req.params.id}`);
  }
};

// Update event status
exports.updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['Upcoming', 'Ongoing', 'Completed'].includes(status)) {
      req.flash('error', 'Invalid status');
      return res.redirect(`/events/${id}`);
    }
    
    const event = await Event.findByPk(id);
    
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }
    
    // Check if there's already an ongoing event
    if (status === 'Ongoing') {
      const ongoingEvent = await Event.findOne({
        where: {
          status: 'Ongoing',
          id: { [Op.ne]: id }
        }
      });
      
      if (ongoingEvent) {
        req.flash('error', 'There is already an ongoing event. Only one event can be ongoing at a time.');
        return res.redirect(`/events/${id}`);
      }
    }
    
    event.status = status;
    await event.save();
    
    logger.info(`Event status updated to ${status}: ${event.title}`, { userId: req.user.id, eventId: id });
    
    req.flash('success', 'Event status updated successfully');
    res.redirect(`/events/${id}`);
  } catch (error) {
    logger.error('Event status update error', { error: error.message });
    req.flash('error', 'Failed to update event status');
    res.redirect(`/events/${req.params.id}`);
  }
};