// In-Memory Database Fallback for Event Management System
// This allows the app to work seamlessly even if MongoDB is not running.

export let eventsStore = [
  {
    _id: "mock-event-1",
    title: "Vanguard Tech Expo 2026",
    description: "Discover the latest innovations in AI, Web3, and cloud computing. Network with world-class engineers and visionaries from around the globe.",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    location: "San Francisco, CA & Online",
    capacity: 200,
    availableSlots: 198,
    category: "Conference",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
    createdAt: new Date()
  },
  {
    _id: "mock-event-2",
    title: "Acoustic Sunset Sessions",
    description: "An evening of intimate acoustic music, delicious local food trucks, and beautiful sunset views by the lake.",
    date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
    location: "Austin Parks & Lakes",
    capacity: 75,
    availableSlots: 75,
    category: "Music",
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80",
    createdAt: new Date()
  }
];

export let registrationsStore = [
  {
    _id: "mock-reg-1",
    eventId: "mock-event-1",
    name: "John Developer",
    email: "john@example.com",
    phone: "1234567890",
    tickets: 2,
    registeredAt: new Date()
  }
];

class MockQuery {
  constructor(data) {
    this.data = data;
  }

  sort(criteria) {
    // Basic sorting logic (e.g. by date)
    this.data.sort((a, b) => new Date(a.date || a.registeredAt) - new Date(b.date || b.registeredAt));
    return this;
  }

  populate(path, fields) {
    if (path === 'eventId') {
      this.data = this.data.map(reg => {
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
      });
    }
    return this;
  }

  // Handle promise resolution
  then(onfulfilled, onrejected) {
    return Promise.resolve(this.data).then(onfulfilled, onrejected);
  }

  catch(onrejected) {
    return Promise.resolve(this.data).catch(onrejected);
  }
}

export class MockEvent {
  constructor(data) {
    this._id = data._id || 'mock-' + Math.random().toString(36).substring(2, 9);
    this.title = data.title;
    this.description = data.description;
    this.date = data.date;
    this.location = data.location;
    this.capacity = Number(data.capacity) || 50;
    this.availableSlots = data.availableSlots !== undefined ? Number(data.availableSlots) : this.capacity;
    this.category = data.category || 'General';
    this.imageUrl = data.imageUrl || '';
    this.createdAt = data.createdAt || new Date();
  }

  async save() {
    const idx = eventsStore.findIndex(e => e._id === this._id);
    const eventObj = {
      _id: this._id,
      title: this.title,
      description: this.description,
      date: this.date,
      location: this.location,
      capacity: this.capacity,
      availableSlots: this.availableSlots,
      category: this.category,
      imageUrl: this.imageUrl,
      createdAt: this.createdAt
    };

    if (idx >= 0) {
      eventsStore[idx] = eventObj;
    } else {
      eventsStore.push(eventObj);
    }
    return eventObj;
  }

  static find() {
    return new MockQuery([...eventsStore]);
  }

  static async findById(id) {
    const ev = eventsStore.find(e => e._id.toString() === id.toString());
    if (!ev) return null;
    return new MockEvent(ev);
  }

  static async findByIdAndDelete(id) {
    const idx = eventsStore.findIndex(e => e._id.toString() === id.toString());
    if (idx === -1) return null;
    const removed = eventsStore.splice(idx, 1)[0];
    registrationsStore = registrationsStore.filter(r => r.eventId.toString() !== id.toString());
    return removed;
  }
}

export class MockRegistration {
  constructor(data) {
    this._id = data._id || 'mock-reg-' + Math.random().toString(36).substring(2, 9);
    this.eventId = data.eventId;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.tickets = Number(data.tickets) || 1;
    this.registeredAt = data.registeredAt || new Date();
  }

  async save() {
    const regObj = {
      _id: this._id,
      eventId: this.eventId,
      name: this.name,
      email: this.email,
      phone: this.phone,
      tickets: this.tickets,
      registeredAt: this.registeredAt
    };
    registrationsStore.push(regObj);
    return regObj;
  }

  static find(filter = {}) {
    let filtered = [...registrationsStore];
    if (filter.eventId) {
      filtered = filtered.filter(r => r.eventId.toString() === filter.eventId.toString());
    }
    return new MockQuery(filtered);
  }

  static async findById(id) {
    const reg = registrationsStore.find(r => r._id.toString() === id.toString());
    if (!reg) return null;
    return new MockRegistration(reg);
  }

  static async deleteMany(filter = {}) {
    if (filter.eventId) {
      registrationsStore = registrationsStore.filter(r => r.eventId.toString() !== filter.eventId.toString());
    }
    return { deletedCount: registrationsStore.length };
  }
}
