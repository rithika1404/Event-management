import express from 'express';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import { eventsStore } from '../models/dbMock.js';
import { authenticateAdmin } from './auth.js';

const router = express.Router();

// Helper: manually populate eventId from in-memory store or Mongoose
const manualPopulate = (reg) => {
  if (reg && reg.eventId && typeof reg.eventId === 'string') {
    const matchedEvent = eventsStore.find(e => e._id.toString() === reg.eventId.toString());
    return {
      ...reg,
      eventId: matchedEvent ? {
        _id: matchedEvent._id,
        title: matchedEvent.title,
        date: matchedEvent.date,
        location: matchedEvent.location
      } : null
    };
  }
  return reg;
};

// POST /api/registrations - Register attendee for an event
router.post('/', async (req, res) => {
  try {
    const { eventId, name, email, phone, tickets } = req.body;
    
    if (!eventId || !name || !email || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const ticketCount = Number(tickets) || 1;
    if (ticketCount <= 0) {
      return res.status(400).json({ message: 'Ticket count must be at least 1' });
    }

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if slots are available
    if (event.availableSlots < ticketCount) {
      return res.status(400).json({ 
        message: `Unable to register. Only ${event.availableSlots} slots remaining for this event.` 
      });
    }

    // Create registration
    const registration = new Registration({
      eventId,
      name,
      email,
      phone,
      tickets: ticketCount
    });

    const savedRegistration = await registration.save();

    // Update event slots
    event.availableSlots -= ticketCount;
    await event.save();

    // Populate event info before returning (compatible with both Mongoose and Mock)
    let populatedReg;
    if (global.useMockDb) {
      populatedReg = manualPopulate(savedRegistration);
    } else {
      populatedReg = await Registration.findById(savedRegistration._id).populate('eventId', 'title date location');
    }

    res.status(201).json(populatedReg);
  } catch (error) {
    res.status(400).json({ message: 'Error processing registration', error: error.message });
  }
});

// GET /api/registrations - Get all registrations (Admin only)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    let registrations;
    if (global.useMockDb) {
      registrations = await Registration.find().sort({ registeredAt: -1 });
      registrations = registrations.map(manualPopulate);
    } else {
      registrations = await Registration.find()
        .populate('eventId', 'title date location')
        .sort({ registeredAt: -1 });
    }
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching registrations', error: error.message });
  }
});

// GET /api/registrations/event/:id - Get registrations for a specific event (Admin only)
router.get('/event/:id', authenticateAdmin, async (req, res) => {
  try {
    const registrations = await Registration.find({ eventId: req.params.id })
      .sort({ registeredAt: -1 });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching registrations for this event', error: error.message });
  }
});

export default router;
