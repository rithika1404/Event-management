import mongoose from 'mongoose';
import { MockEvent } from './dbMock.js';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
  },
  capacity: {
    type: Number,
    required: [true, 'Event capacity is required'],
    min: [1, 'Capacity must be at least 1'],
  },
  availableSlots: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    required: [true, 'Event category is required'],
    default: 'General',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

eventSchema.pre('validate', function(next) {
  if (this.isNew && this.availableSlots === undefined) {
    this.availableSlots = this.capacity;
  }
  next();
});

const MongooseEvent = mongoose.model('Event', eventSchema);

class EventWrapper {
  constructor(data) {
    if (global.useMockDb) {
      return new MockEvent(data);
    }
    return new MongooseEvent(data);
  }

  static find(...args) {
    return global.useMockDb ? MockEvent.find(...args) : MongooseEvent.find(...args);
  }

  static findById(...args) {
    return global.useMockDb ? MockEvent.findById(...args) : MongooseEvent.findById(...args);
  }

  static findByIdAndDelete(...args) {
    return global.useMockDb ? MockEvent.findByIdAndDelete(...args) : MongooseEvent.findByIdAndDelete(...args);
  }
}

export default EventWrapper;
