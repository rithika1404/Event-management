import express from 'express';
import Event from '../models/Event.js';
import { authenticateAdmin } from './auth.js';

const router = express.Router();

// GET /api/events - Retrieve all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

// GET /api/events/:id - Retrieve a single event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event details', error: error.message });
  }
});

// POST /api/events - Create a new event (Admin only)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { title, description, date, location, capacity, imageUrl, category } = req.body;

    const event = new Event({
      title,
      description,
      date,
      location,
      capacity,
      imageUrl,
      category,
      availableSlots: capacity // starts off equal to capacity
    });

    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(400).json({ message: 'Error creating event', error: error.message });
  }
});

// PUT /api/events/:id - Update an existing event (Admin only)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { title, description, date, location, capacity, imageUrl, category } = req.body;
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Calculate slots difference if capacity changes
    if (capacity !== undefined && capacity !== event.capacity) {
      const slotsRegistered = event.capacity - event.availableSlots;
      if (capacity < slotsRegistered) {
        return res.status(400).json({ 
          message: `Cannot reduce capacity to ${capacity} because ${slotsRegistered} spots are already registered.` 
        });
      }
      event.availableSlots = capacity - slotsRegistered;
      event.capacity = capacity;
    }

    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (date !== undefined) event.date = date;
    if (location !== undefined) event.location = location;
    if (imageUrl !== undefined) event.imageUrl = imageUrl;
    if (category !== undefined) event.category = category;

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: 'Error updating event', error: error.message });
  }
});

// DELETE /api/events/:id - Delete an event (Admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    // Note: In a real system, you might want to delete associated registrations too.
    // Let's delete associated registrations for hygiene.
    await import('../models/Registration.js').then(async (m) => {
      await m.default.deleteMany({ eventId: req.params.id });
    });
    
    res.json({ message: 'Event and associated registrations successfully deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
});

export default router;
