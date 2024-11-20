import { Router } from 'express';
// import Event from '../models/Event.js';
import EventModel from '../models/eventModel.js';
const router = Router();

// Create a new event
router.post('/', async (req, res) => {
  const { eventName, eventType, createdBy, eventDate, location, guestCount } = req.body;

  try {
    const newEvent = new EventModel({
      eventName,
      eventType,
      createdBy,
      eventDate,
      location,
      tasks: [],
      collaborators: [createdBy],
      guestCount,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Fetch events by email
router.get('/', async (req, res) => {
    const { createdBy } = req.query;
    try {
        const events = createdBy 
            ? await Event.find({ createdBy }) // Find events by username
            : []; // Otherwise, return empty array
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events', error });
    }
});

export default router;