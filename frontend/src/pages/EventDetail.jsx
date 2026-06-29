import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ChevronLeft, Ticket, CheckCircle, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';

const DEFAULT_EVENT_IMAGES = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80', // Conference
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80', // Networking
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=80', // Festival
  'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80', // Workshop
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80', // Concert
];

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Registration Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tickets, setTickets] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/events/${id}`);
      if (!res.ok) throw new Error('Event not found');
      const data = await res.json();
      setEvent(data);
    } catch (err) {
      setError(err.message || 'Error loading event.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: id,
          name,
          email,
          phone,
          tickets: Number(tickets)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccessMsg(`Successfully registered! Confirming ${tickets} ticket(s) for ${name}.`);
      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setTickets(1);
      
      // Update slots
      fetchEventDetails();
    } catch (err) {
      setFormError(err.message || 'Could not complete registration.');
    } finally {
      setSubmitting(false);
    }
  };

  const getEventImage = (url) => {
    if (url && url.startsWith('http')) return url;
    // Map ID characters to default images indices
    const charSum = id ? id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
    return DEFAULT_EVENT_IMAGES[charSum % DEFAULT_EVENT_IMAGES.length];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem 0' }}>
        <div className="spinner" style={{
          border: '4px solid rgba(255,255,255,0.1)',
          borderLeft: '4px solid var(--primary)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }} className="glass-panel">
        <AlertCircle size={48} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
        <h3>Failed to Load Event</h3>
        <p className="text-muted" style={{ margin: '1rem 0' }}>{error || 'This event is unavailable.'}</p>
        <Link to="/" className="nav-link-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ChevronLeft size={16} /> Return to Home
        </Link>
      </div>
    );
  }

  const isSoldOut = event.availableSlots <= 0;

  return (
    <div>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.9rem' }} className="nav-link">
        <ChevronLeft size={16} /> Back to Listings
      </Link>

      <div className="detail-container">
        {/* Left column: Event details */}
        <div className="glass-panel detail-main">
          <img src={getEventImage(event.imageUrl)} alt={event.title} className="detail-img" />
          <div className="detail-content">
            <span className="admin-badge admin-badge-category" style={{ marginBottom: '1rem' }}>{event.category}</span>
            <h1 className="detail-heading">{event.title}</h1>
            
            <div className="detail-meta-box">
              <div className="detail-meta-item">
                <div className="meta-icon-wrapper">
                  <Calendar size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date & Time</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{formatDate(event.date)}</div>
                </div>
              </div>
              
              <div className="detail-meta-item">
                <div className="meta-icon-wrapper">
                  <MapPin size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Location</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{event.location}</div>
                </div>
              </div>

              <div className="detail-meta-item">
                <div className="meta-icon-wrapper">
                  <Users size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Availability</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: isSoldOut ? 'var(--danger)' : 'var(--accent)' }}>
                    {isSoldOut ? 'Sold Out' : `${event.availableSlots} of ${event.capacity} left`}
                  </div>
                </div>
              </div>
            </div>

            <h3 style={{ marginTop: '2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>About This Event</h3>
            <p className="detail-desc">{event.description}</p>
          </div>
        </div>

        {/* Right column: Registration form */}
        <div className="glass-panel form-panel">
          <h2 className="form-title">Secure Your Spot</h2>
          
          {successMsg && (
            <div className="toast success">
              <CheckCircle size={20} />
              <span>{successMsg}</span>
            </div>
          )}

          {formError && (
            <div className="toast error">
              <AlertCircle size={20} />
              <span>{formError}</span>
            </div>
          )}

          {isSoldOut ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <Users size={36} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
              <h4>Sold Out</h4>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                All available slots for this event have been filled. Keep an eye out for future events!
              </p>
            </div>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  required 
                  className="form-input" 
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  required 
                  className="form-input" 
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input 
                  type="tel" 
                  required 
                  className="form-input" 
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Number of Tickets</label>
                <select 
                  className="form-input" 
                  value={tickets} 
                  onChange={(e) => setTickets(e.target.value)}
                >
                  {/* Allow selecting up to either 10 tickets, or the maximum remaining slots */}
                  {Array.from({ length: Math.min(10, event.availableSlots) }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num} ticket{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={submitting}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}
              >
                <Ticket size={18} />
                {submitting ? 'Registering...' : 'Complete Registration'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
