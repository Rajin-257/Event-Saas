const Event = require('../models/Event');
const { TicketType } = require('../models/Ticket');
const Speaker = require('../models/Speaker');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

module.exports = {
  getAllEvents: async (req, res) => {
    try {
      const events = await Event.findAll({
        include: [{
          model: User,
          as: 'organizer',
          attributes: ['name']
        }],
        order: [['startDate', 'ASC']]
      });

      res.render('events/index', { 
        title: 'All Events',
        events
      });
    } catch (err) {
      console.error('Error fetching events:', err);
      req.flash('error_msg', 'Error loading events');
      res.redirect('/');
    }
  },

  // Get event by ID
  getEventById: async (req, res) => {
    try {
      const eventId = req.params.id;
      
      const event = await Event.findByPk(eventId, {
        include: [
          {
            model: User,
            as: 'organizer',
            attributes: ['id', 'name', 'email']
          },
          {
            model: TicketType,
          },
          {
            model: Speaker,
          }
        ]
      });


      const speakers = await Speaker.findAll({ where: { eventId } });
      const ticketTypes = await TicketType.findAll({where:{eventId}});

      if (!event) {
        req.flash('error_msg', 'Event not found');
        return res.redirect('/events');
      }

      // If event is not published and user is not admin or organizer
      if (!event.isPublished && 
          (!req.user || (req.user.id !== event.organizerId && req.user.role !== 'super_admin'))) {
        req.flash('error_msg', 'Event is not available');
        return res.redirect('/events');
      }

      res.render('events/details', { 
        title: event.title,
        event,
        speakers,
        ticketTypes
      });
    } catch (err) {
      console.error('Error fetching event:', err);
      req.flash('error_msg', 'Error loading event details');
      res.redirect('/events');
    }
  },

  // Render create event form
  getCreateEvent: (req, res) => {
    res.render('events/create', { title: 'Create Event' });
  },

  // Create new event
  createEvent: async (req, res) => {
    try {
      const { 
        title, description, category, startDate, endDate, 
        venue, venueAddress, maxAttendees 
      } = req.body;

      // Validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('events/create', {
          title: 'Create Event',
          errors: errors.array(),
          formData: req.body
        });
      }

      // Handle file upload
      let bannerImage = null;
      if (req.file) {
        bannerImage = `/uploads/events/${path.basename(req.file.path)}`;
      }

      // Create event
      const event = await Event.create({
        title,
        description,
        category,
        startDate,
        endDate,
        venue,
        venueAddress,
        maxAttendees: maxAttendees || 100,
        organizerId: req.user.id,
        status: 'draft',
        bannerImage
      });

      req.flash('success_msg', 'Event created successfully');
      res.redirect(`/events/${event.id}/edit`);
    } catch (err) {
      console.error('Error creating event:', err);
      req.flash('error_msg', 'Error creating event');
      res.redirect('/events/create');
    }
  },

  // Render edit event form
  getEditEvent: async (req, res) => {
    try {
      const eventId = req.params.id;
      
      const event = await Event.findByPk(eventId, {
        include: [
          {
            model: TicketType
          }
        ]
      });

      if (!event) {
        req.flash('error_msg', 'Event not found');
        return res.redirect('/dashboard');
      }

      res.render('events/edit', { 
        title: 'Edit Event',
        event
      });
    } catch (err) {
      console.error('Error fetching event for edit:', err);
      req.flash('error_msg', 'Error loading event');
      res.redirect('/dashboard');
    }
  },

  // Update event
  updateEvent: async (req, res) => {
    try {
      const eventId = req.params.id;
      const { 
        title, description, category, startDate, endDate, 
        venue, venueAddress, maxAttendees, status 
      } = req.body;

      // Validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('events/edit', {
          title: 'Edit Event',
          errors: errors.array(),
          event: { id: eventId, ...req.body }
        });
      }

      const event = await Event.findByPk(eventId);
      
      if (!event) {
        req.flash('error_msg', 'Event not found');
        return res.redirect('/dashboard');
      }

      // Handle file upload
      let bannerImage = event.bannerImage;
      if (req.file) {
        // Delete old image if exists
        if (event.bannerImage) {
          const oldImagePath = path.join(__dirname, '../public', event.bannerImage);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        bannerImage = `/uploads/events/${path.basename(req.file.path)}`;
      }

      // Update event
      await event.update({
        title,
        description,
        category,
        startDate,
        endDate,
        venue,
        venueAddress,
        maxAttendees: maxAttendees || 100,
        status: status || event.status,
        bannerImage
      });

      req.flash('success_msg', 'Event updated successfully');
      res.redirect(`/events/${event.id}/edit`);
    } catch (err) {
      console.error('Error updating event:', err);
      req.flash('error_msg', 'Error updating event');
      res.redirect(`/events/${req.params.id}/edit`);
    }
  },

  // Publish/unpublish event
  togglePublishEvent: async (req, res) => {
    try {
      const eventId = req.params.id;
      
      const event = await Event.findByPk(eventId);
      
      if (!event) {
        req.flash('error_msg', 'Event not found');
        return res.redirect('/dashboard');
      }

      // Make sure event has at least one ticket type before publishing
      if (!event.isPublished) {
        const ticketTypes = await TicketType.findAll({ where: { eventId } });
        if (ticketTypes.length === 0) {
          req.flash('error_msg', 'Cannot publish event without ticket types');
          return res.redirect(`/events/${eventId}/edit`);
        }
      }

      // Toggle publish status
      await event.update({
        isPublished: !event.isPublished
      });

      const message = event.isPublished ? 'Event published successfully' : 'Event unpublished';
      req.flash('success_msg', message);
      res.redirect(`/events/${eventId}`);
    } catch (err) {
      console.error('Error toggling event publish status:', err);
      req.flash('error_msg', 'Error updating event');
      res.redirect(`/events/${req.params.id}`);
    }
  },

  // Delete event
  deleteEvent: async (req, res) => {
    try {
      const eventId = req.params.id;
      
      const event = await Event.findByPk(eventId);
      
      if (!event) {
        req.flash('error_msg', 'Event not found');
        return res.redirect('/dashboard');
      }

      // Delete event banner if exists
      if (event.bannerImage) {
        const imagePath = path.join(__dirname, '../public', event.bannerImage);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      // Delete event (cascade will handle related records)
      await event.destroy();

      req.flash('success_msg', 'Event deleted successfully');
      res.redirect('/dashboard');
    } catch (err) {
      console.error('Error deleting event:', err);
      req.flash('error_msg', 'Error deleting event');
      res.redirect('/dashboard');
    }
  },

  // Manage event speakers
  getManageSpeakers: async (req, res) => {
    try {
      const eventId = req.params.id;
      
      const [event, speakers] = await Promise.all([
        Event.findByPk(eventId),
        Speaker.findAll({ where: { eventId } })
      ]);
      
      if (!event) {
        req.flash('error_msg', 'Event not found');
        return res.redirect('/dashboard');
      }

      res.render('events/speakers', { 
        title: 'Manage Speakers',
        event,
        speakers
      });
    } catch (err) {
      console.error('Error loading speakers:', err);
      req.flash('error_msg', 'Error loading speakers');
      res.redirect(`/events/${req.params.id}/edit`);
    }
  },
  

  // Add new speaker
  addSpeaker: async (req, res) => {
    try {
      const eventId = req.params.id;
      const { 
        name, bio, designation, organization, 
        speakerType, sessionTopic, sessionTime, sessionDuration 
      } = req.body;

      // Validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('events/speakers', {
          title: 'Manage Speakers',
          errors: errors.array(),
          formData: req.body,
          event: { id: eventId }
        });
      }

      // Handle file upload
      let photo = null;
      if (req.file) {
        photo = `/uploads/speakers/${path.basename(req.file.path)}`;
      }

      // Create speaker
      await Speaker.create({
        eventId,
        name,
        bio,
        designation,
        organization,
        speakerType,
        sessionTopic,
        sessionTime,
        sessionDuration,
        photo
      });

      req.flash('success_msg', 'Speaker added successfully');
      res.redirect(`/events/${eventId}/speakers`);
    } catch (err) {
      console.error('Error adding speaker:', err);
      req.flash('error_msg', 'Error adding speaker');
      res.redirect(`/events/${req.params.id}/speakers`);
    }
  },

  // Update speaker
  updateSpeaker: async (req, res) => {
    try {
      const eventId = req.params.id;
      const speakerId = req.params.speakerId;
      
      const { 
        name, bio, designation, organization, 
        speakerType, sessionTopic, sessionTime, sessionDuration 
      } = req.body;

      // Validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('events/speakers', {
          title: 'Edit Speaker',
          errors: errors.array(),
          speaker: { id: speakerId, ...req.body },
          event: { id: eventId }
        });
      }

      const speaker = await Speaker.findByPk(speakerId);
      
      if (!speaker || speaker.eventId !== eventId) {
        req.flash('error_msg', 'Speaker not found');
        return res.redirect(`/events/${eventId}/speakers`);
      }

      // Handle file upload
      let photo = speaker.photo;
      if (req.file) {
        // Delete old image if exists
        if (speaker.photo) {
          const oldImagePath = path.join(__dirname, '../public', speaker.photo);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        photo = `/uploads/speakers/${path.basename(req.file.path)}`;
      }

      // Update speaker
      await speaker.update({
        name,
        bio,
        designation,
        organization,
        speakerType,
        sessionTopic,
        sessionTime,
        sessionDuration,
        photo
      });

      req.flash('success_msg', 'Speaker updated successfully');
      res.redirect(`/events/${eventId}/speakers`);
    } catch (err) {
      console.error('Error updating speaker:', err);
      req.flash('error_msg', 'Error updating speaker');
      res.redirect(`/events/${req.params.id}/speakers`);
    }
  },

  // Delete speaker
  deleteSpeaker: async (req, res) => {
    try {
      const eventId = req.params.id;
      const speakerId = req.params.speakerId;
      
      const speaker = await Speaker.findByPk(speakerId);
      
      if (!speaker || speaker.eventId !== eventId) {
        req.flash('error_msg', 'Speaker not found');
        return res.redirect(`/events/${eventId}/speakers`);
      }

      // Delete speaker photo if exists
      if (speaker.photo) {
        const imagePath = path.join(__dirname, '../public', speaker.photo);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      // Delete speaker
      await speaker.destroy();

      req.flash('success_msg', 'Speaker deleted successfully');
      res.redirect(`/events/${eventId}/speakers`);
    } catch (err) {
      console.error('Error deleting speaker:', err);
      req.flash('error_msg', 'Error deleting speaker');
      res.redirect(`/events/${req.params.id}/speakers`);
    }
  }
};