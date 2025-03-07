const EventDetails = require("../models/eventDetails");
const Guest = require("../models/guest");
const Department = require("../models/department");
const FrontpageSettings = require("../models/frontpage");

/**
 * Get all events with their associated guest information
 */
exports.getEventDetails = async (req, res) => {
  try {
    // Get all events with guest information included
    const events = await EventDetails.findAll({
      include: [
        {
          model: Guest,
          attributes: ["name", "organization", "designation"],
        },
      ],
      order: [
        ["date", "DESC"],
        ["time", "ASC"],
      ],
    });

    // Get all guests for dropdown selection
    const guests = await Guest.findAll({
      include: [
        {
          model: Department,
          attributes: ["name"],
        },
      ],
      order: [["name", "ASC"]],
    });

    const frontpageData = await FrontpageSettings.findOne({
      where: { id: 1 },
    });

    res.render("backend/event/events", {
      events,
      guests,
      formData: req.user || {},
      frontData: frontpageData || {},
      successMessage: req.flash("success"),
      errorMessage: req.flash("error"),
    });
  } catch (error) {
    console.error("Error fetching event details:", error);
    req.flash("error", "Failed to load events");
    res.redirect("/dashboard");
  }
};

/**
 * Create a new event
 */
exports.createEvent = async (req, res) => {
  try {
    const {
      event_title,
      event_location,
      date,
      time,
      hosted_by,
      guest_id,
      guest_topic,
    } = req.body;

    // Validate required fields
    if (!event_title || !event_location || !date || !time || !hosted_by) {
      req.flash("error", "Please fill in all required fields");
      return res.redirect("/settings/events");
    }

    // Create new event
    await EventDetails.create({
      event_title,
      event_location,
      date,
      time,
      hosted_by,
      guest_id: guest_id || null,
      guest_topic: guest_topic || null,
    });

    req.flash("success", "Event created successfully");
    res.redirect("/settings/events");
  } catch (error) {
    console.error("Error creating event:", error);
    req.flash("error", "Failed to create event");
    res.redirect("/settings/events");
  }
};

/**
 * Get a specific event by ID
 */
exports.getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await EventDetails.findByPk(eventId, {
      include: [
        {
          model: Guest,
          attributes: ["name", "organization", "designation"],
        },
      ],
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Format date and time for form display
    const formattedEvent = {
      ...event.toJSON(),
      date: event.date.toISOString().split("T")[0], // Format as YYYY-MM-DD
      time: event.time.slice(0, 5), // Format as HH:MM
    };

    res.json({
      success: true,
      data: formattedEvent,
    });
  } catch (error) {
    console.error("Error fetching event details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event details",
    });
  }
};

/**
 * Update an existing event
 */
exports.updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const {
      event_title,
      event_location,
      date,
      time,
      hosted_by,
      guest_id,
      guest_topic,
    } = req.body;

    // Validate required fields
    if (!event_title || !event_location || !date || !time || !hosted_by) {
      req.flash("error", "Please fill in all required fields");
      return res.redirect("/settings/events");
    }

    const event = await EventDetails.findByPk(eventId);

    if (!event) {
      req.flash("error", "Event not found");
      return res.redirect("/settings/events");
    }

    // Update event details
    await event.update({
      event_title,
      event_location,
      date,
      time,
      hosted_by,
      guest_id: guest_id || null,
      guest_topic: guest_topic || null,
    });

    req.flash("success", "Event updated successfully");
    res.redirect("/settings/events");
  } catch (error) {
    console.error("Error updating event:", error);
    req.flash("error", "Failed to update event");
    res.redirect("/settings/events");
  }
};

/**
 * Delete an event
 */
exports.deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await EventDetails.findByPk(eventId);

    if (!event) {
      req.flash("error", "Event not found");
      return res.redirect("/settings/events");
    }

    await event.destroy();

    req.flash("success", "Event deleted successfully");
    res.redirect("/settings/events");
  } catch (error) {
    console.error("Error deleting event:", error);
    req.flash("error", "Failed to delete event");
    res.redirect("/settings/events");
  }
};
