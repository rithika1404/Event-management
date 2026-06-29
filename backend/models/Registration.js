import mongoose from 'mongoose';
import { MockRegistration } from './dbMock.js';

const registrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event ID is required'],
  },
  name: {
    type: String,
    required: [true, 'Attendee name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Attendee email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
  },
  phone: {
    type: String,
    required: [true, 'Attendee phone number is required'],
    trim: true,
  },
  tickets: {
    type: Number,
    required: [true, 'Number of tickets is required'],
    min: [1, 'Must register for at least 1 ticket'],
    default: 1,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  }
});

const MongooseRegistration = mongoose.model('Registration', registrationSchema);

class RegistrationWrapper {
  constructor(data) {
    if (global.useMockDb) {
      return new MockRegistration(data);
    }
    return new MongooseRegistration(data);
  }

  static find(...args) {
    return global.useMockDb ? MockRegistration.find(...args) : MongooseRegistration.find(...args);
  }

  static findById(...args) {
    return global.useMockDb ? MockRegistration.findById(...args) : MongooseRegistration.findById(...args);
  }

  static deleteMany(...args) {
    return global.useMockDb ? MockRegistration.deleteMany(...args) : MongooseRegistration.deleteMany(...args);
  }
}

export default RegistrationWrapper;
