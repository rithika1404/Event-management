import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, LogOut, Ticket, Calendar, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { API_BASE_URL, getHeaders, isAuthenticated, logoutAdmin } from '../utils/api';

export default function AdminRegistrations() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('All');

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin/login');
    } else {
      fetchRegistrations();
      fetchEvents();
    }
  }, [navigate]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE_URL}/registrations`, {
        headers: getHeaders()
      });

      if (res.status === 401 || res.status === 403) {
        const data = await res.json();
        redirectToLogin(data.message);
        return;
      }

      if (!res.ok) throw new Error('Failed to load registrations');
      const data = await res.json();
      setRegistrations(data);
    } catch (err) {
      setError(err.message || 'Error communicating with server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/events`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error('Error fetching events list for filter dropdown:', err);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate('/');
  };

  const redirectToLogin = (message = 'Your admin session expired. Please sign in again.') => {
    logoutAdmin();
    navigate('/admin/login', { state: { message } });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredRegistrations = selectedEventId === 'All' 
    ? registrations 
    : registrations.filter(reg => reg.eventId && reg.eventId._id === selectedEventId);

  // Compute total tickets registered
  const totalTicketsRegistered = filteredRegistrations.reduce((sum, r) => sum + (r.tickets || 1), 0);

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '0.5rem', fontSize: '0.9rem' }} className="nav-link">
            <ChevronLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className="admin-title">Event Registrations</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={handleLogout} className="btn-icon" style={{ padding: '0.75rem' }} title="Logout Admin">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div className="toast error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="toolbar glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Filter by Event:</span>
          <select 
            className="filter-select"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            style={{ minWidth: '220px' }}
          >
            <option value="All">All Events ({registrations.length} registrations)</option>
            {events.map(ev => (
              <option key={ev._id} value={ev._id}>{ev.title}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
          <Ticket size={18} style={{ color: 'var(--primary)' }} />
          <span>Total Tickets Registered: <strong>{totalTicketsRegistered}</strong></span>
        </div>
      </div>

      {/* Registrations List table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} /> Attendee List
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
        ) : filteredRegistrations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <Ticket size={36} className="text-muted" style={{ marginBottom: '0.5rem' }} />
            <p className="text-muted">No registrations found for this filter.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Attendee Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Event</th>
                  <th style={{ textAlign: 'center' }}>Tickets</th>
                  <th>Registration Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((reg) => (
                  <tr key={reg._id}>
                    <td style={{ color: 'var(--text-main)', fontWeight: 600 }}>{reg.name}</td>
                    <td>{reg.email}</td>
                    <td>{reg.phone}</td>
                    <td>
                      {reg.eventId ? (
                        <Link to={`/event/${reg.eventId._id}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
                          {reg.eventId.title}
                        </Link>
                      ) : (
                        <span className="text-dark" style={{ fontStyle: 'italic' }}>Deleted Event</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-main)' }}>{reg.tickets || 1}</td>
                    <td>{formatDate(reg.registeredAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
