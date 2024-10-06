import Event from "../models/event.model.js";

const createEvent = async (req, res) => {
  const { title, description, date, time, location, maxParticipants } = req.body;

  // Input validation
  if (!title || !description || !date || !time || !location || !maxParticipants) {
    return res.status(400).json({
      error: "All fields (title, description, date, time, location, maxParticipants) are required.",
    });
  }

  // Ensure maxParticipants is a positive number
  if (typeof maxParticipants !== "number" || maxParticipants <= 0) {
    return res.status(400).json({
      error: "maxParticipants must be a positive number.",
    });
  }


  try {
    // Ensure that a similar event (based on title, date, and location) does not already exist
    const existingEvent = await Event.findOne({ title, date, location });
    if (existingEvent) {
      return res.status(400).json({
        error: "An event with the same title, date, and location already exists.",
      });
    }

    // Create and save event
    const event = new Event({
      title,
      description,
      date,
      time,
      location,
      maxParticipants,
    });

    await event.save();

    // Success response
    res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (err) {
    // Handle specific database errors
    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Invalid data format.",
        details: err.errors,
      });
    }

    res.status(500).json({
      error: "An error occurred while creating the event.",
      details: err.message,
    });
  }
};

// Fetch event details including confirmed and waitlist participants
const getEventDetails = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId)
      .populate('confirmedParticipants', 'fullName email') // Populate confirmed participants
      .populate('waitlistParticipants', 'fullName email'); // Populate waitlisted participants

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Return empty arrays if no participants exist
    const confirmedParticipants = event.confirmedParticipants.length
      ? event.confirmedParticipants
      : 'No confirmed participants';
    const waitlistParticipants = event.waitlistParticipants.length
      ? event.waitlistParticipants
      : 'No waitlist participants';

    // Response with the confirmed and waitlisted participants
    res.status(200).json({
      title: event.title,
      confirmedParticipants,
      waitlistParticipants,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve participants', details: err.message });
  }
};

export {
  createEvent,
  getEventDetails,
};