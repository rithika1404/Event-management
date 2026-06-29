import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, MapPin, Users, Plus, Edit, Trash2, Eye, LogOut, X, 
  Sparkles, Layers, ListFilter, AlertCircle, CheckCircle, Ticket 
} from 'lucide-react';
import { API_BASE_URL, getHeaders, isAuthenticated, logoutAdmin } from '../utils/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formError, setFormError] = useState('');
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(50);
  const [category, setCategory] = useState('Conference');
  const [imageUrl, setImageUrl] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin/login');
    } else {
      fetchEvents();
    }
  }, [navigate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE_URL}/events`);
      if (!res.ok) throw new Error('Failed to load events');
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      setError(err.message || 'Error communicating with server.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate('/');
  };

  const redirectToLogin = (message = 'Your admin session expired. Please sign in again.') => {
    logoutAdmin();
    setModalOpen(false);
    navigate('/admin/login', { state: { message } });
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setTitle('');
    setDescription('');
    setDate('');
    setLocation('');
    setCapacity(50);
    setCategory('Conference');
    setImageUrl('');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDescription(event.description);
    // Format date string to match datetime-local format: YYYY-MM-DDThh:mm
    const eventDate = new Date(event.date);
    const tzOffset = eventDate.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(eventDate.getTime() - tzOffset)).toISOString().slice(0, 16);
    setDate(localISOTime);
    setLocation(event.location);
    setCapacity(event.capacity);
    setCategory(event.category || 'General');
    setImageUrl(event.imageUrl || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setError('');
    setSuccess('');
    setFormError('');

    const eventPayload = {
      title,
      description,
      date,
      location,
      capacity: Number(capacity),
      category,
      imageUrl
    };

    try {
      const url = editingEvent 
        ? `${API_BASE_URL}/events/${editingEvent._id}` 
        : `${API_BASE_URL}/events`;
      
      const method = editingEvent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(eventPayload)
      });

      const data = await res.json();

      if (res.status === 401 || res.status === 403) {
        redirectToLogin(data.message);
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || 'Operation failed');
      }

      setSuccess(editingEvent ? 'Event updated successfully' : 'Event created successfully');
      setModalOpen(false);
      fetchEvents();
      
      // Auto-clear success toast
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setFormError(err.message || 'Error occurred while saving event.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId, eventTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${eventTitle}"? This will delete all associated registrations.`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      const res = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (res.status === 401 || res.status === 403) {
        const data = await res.json();
        redirectToLogin(data.message);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete event');
      }

      setSuccess('Event deleted successfully');
      fetchEvents();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Could not delete event.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Compute stats
  const totalEventsCount = events.length;
  const totalCapacity = events.reduce((sum, e) => sum + e.capacity, 0);
  const totalSpotsRemaining = events.reduce((sum, e) => sum + e.availableSlots, 0);
  const totalRegistrationsCount = totalCapacity - totalSpotsRemaining;

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>Welcome to GatherSphere's event management portal</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={openCreateModal} className="nav-link-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> Create Event
          </button>
          <Link to="/admin/registrations" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)' }}>
            <Ticket size={16} /> Registrations
          </Link>
          <button onClick={handleLogout} className="btn-icon" style={{ padding: '0.75rem' }} title="Logout Admin">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {success && (
        <div className="toast success">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="toast error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon-box">
            <Layers size={24} />
          </div>
          <div>
            <div className="stat-number">{totalEventsCount}</div>
            <div className="stat-label">Total Events</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-box">
            <Users size={24} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <div className="stat-number" style={{ color: 'var(--accent)' }}>{totalRegistrationsCount}</div>
            <div className="stat-label">Active Bookings</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-box">
            <Calendar size={24} style={{ color: 'var(--secondary)' }} />
          </div>
          <div>
            <div className="stat-number">{totalSpotsRemaining}</div>
            <div className="stat-label">Available Slots</div>
          </div>
        </div>
      </div>

      {/* Events Table Section */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ListFilter size={18} /> Manage Events
        </h2>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
            <div className="spinner" style={{
              border: '3px solid rgba(255,255,255,0.1)',
              borderLeft: '3px solid var(--primary)',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <Sparkles size={36} className="text-muted" style={{ marginBottom: '0.5rem' }} />
            <p className="text-muted">No events created yet. Click "Create Event" to get started.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Event details</th>
                  <th>Date & Time</th>
                  <th>Location</th>
                  <th>Category</th>
                  <th>Bookings</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const bookedSpots = event.capacity - event.availableSlots;
                  return (
                    <tr key={event._id}>
                      <td>
                        <div className="table-event-title">{event.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>ID: {event._id}</div>
                      </td>
                      <td>{formatDate(event.date)}</td>
                      <td>{event.location}</td>
                      <td>
                        <span className="admin-badge admin-badge-category">{event.category}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {bookedSpots} / {event.capacity}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {event.availableSlots} left
                        </div>
                      </td>
                      <td>
                        <div className="action-btn-group" style={{ justifyContent: 'center' }}>
                          <Link to={`/event/${event._id}`} className="btn-icon view" title="View Event Page">
                            <Eye size={14} />
                          </Link>
                          <button onClick={() => openEditModal(event)} className="btn-icon edit" title="Edit Event Details">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDeleteEvent(event._id, event.title)} className="btn-icon delete" title="Delete Event">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Glassmorphic Form Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ padding: '2.5rem' }}>
            <button onClick={() => setModalOpen(false)} className="modal-close" style={{ top: '1.5rem', right: '1.5rem' }}>
              <X size={20} />
            </button>
            <h2 className="form-title" style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </h2>

            {formError && (
              <div className="toast error">
                <AlertCircle size={18} />
                <span>{formError}</span>
              </div>
            )}
            
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Event Title</label>
                <input 
                  type="text" 
                  required 
                  className="form-input" 
                  placeholder="e.g. AI & Tech Summit 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  required 
                  className="form-input form-textarea" 
                  placeholder="Describe details, agenda, and speakers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Date & Time</label>
                  <input 
                    type="datetime-local" 
                    required 
                    className="form-input" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    placeholder="e.g. San Francisco, CA or Online"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Total Capacity</label>
                  <input 
                    type="number" 
                    min="1"
                    required 
                    className="form-input" 
                    placeholder="100"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-input" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Conference">Conference</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Networking">Networking</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Music">Music</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Banner Image URL (Optional)</label>
                <input 
                  type="url" 
                  className="form-input" 
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="form-input" style={{ width: '40%', cursor: 'pointer', textAlign: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ width: '60%' }} disabled={formSubmitting}>
                  {formSubmitting ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
