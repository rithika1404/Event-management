import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Search, Sparkles, Filter, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';

const DEFAULT_EVENT_IMAGES = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80', // Conference
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80', // Networking
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=80', // Festival
  'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80', // Workshop
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80', // Concert
];

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/events`);
      if (!res.ok) throw new Error('Failed to retrieve events');
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      setError(err.message || 'Error communicating with backend.');
    } finally {
      setLoading(false);
    }
  };

  const getEventImage = (url, index) => {
    if (url && url.startsWith('http')) return url;
    return DEFAULT_EVENT_IMAGES[index % DEFAULT_EVENT_IMAGES.length];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || event.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Extract unique categories for filter
  const categories = ['All', ...new Set(events.map(e => e.category).filter(Boolean))];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">Discover Extraordinary Events</h1>
        <p className="hero-subtitle">
          Join premium conferences, technical workshops, and local meetups. Elevate your learning and networks.
        </p>
      </section>

      {/* Search & Filter Toolbar */}
      <div className="toolbar glass-panel">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search by title, location or keywords..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} className="text-muted" />
          <select 
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '4rem 0' }}>
          <div className="spinner" style={{
            border: '4px solid rgba(255,255,255,0.1)',
            borderLeft: '4px solid var(--primary)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div className="toast error" style={{ maxWidth: '600px', margin: '2rem auto' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }} className="glass-panel">
          <Sparkles size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No Events Found</h3>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>
            We couldn't find any events matching your search criteria. Check back later!
          </p>
        </div>
      ) : (
        <div className="event-grid">
          {filteredEvents.map((event, idx) => {
            const isFull = event.availableSlots <= 0;
            const isLimited = event.availableSlots > 0 && event.availableSlots <= 5;
            
            return (
              <Link 
                to={`/event/${event._id}`} 
                key={event._id} 
                className="event-card glass-panel"
                style={{ textDecoration: 'none' }}
              >
                <div className="card-img-wrapper">
                  <img 
                    src={getEventImage(event.imageUrl, idx)} 
                    alt={event.title} 
                    className="card-img"
                    loading="lazy"
                  />
                  <div className="card-badge">{event.category}</div>
                </div>
                <div className="card-body">
                  <h3 className="card-title">{event.title}</h3>
                  
                  <div className="card-info-item">
                    <Calendar size={14} />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  
                  <div className="card-info-item">
                    <MapPin size={14} />
                    <span>{event.location}</span>
                  </div>

                  <p className="card-description">{event.description}</p>
                  
                  <div className="card-footer">
                    <span className={`slots-badge ${isFull ? 'full' : isLimited ? 'limited' : 'available'}`}>
                      <Users size={14} />
                      {isFull ? 'Sold Out' : `${event.availableSlots} spots left`}
                    </span>
                    <button className="btn-card" disabled={isFull}>
                      {isFull ? 'Full' : 'Register Now'}
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
