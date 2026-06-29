import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Link, Navigate } from 'react-router-dom';
import { Sparkles, Calendar, Settings } from 'lucide-react';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminRegistrations from './pages/AdminRegistrations';

export default function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Navigation Bar */}
        <nav className="navbar">
          <div className="navbar-inner">
            <Link to="/" className="brand">
              <Sparkles size={24} style={{ color: 'var(--primary)', fill: 'var(--primary)' }} />
              <span>GatherSphere</span>
            </Link>
            
            <div className="nav-links">
              <NavLink 
                to="/" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={16} /> Events
                </span>
              </NavLink>
              
              <NavLink 
                to="/admin" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Settings size={16} /> Admin Portal
                </span>
              </NavLink>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/registrations" element={<AdminRegistrations />} />
            {/* Catch-all redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer style={{
          padding: '2rem 1.5rem',
          borderTop: '1px solid var(--border-glass)',
          background: 'rgba(8, 11, 17, 0.9)',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-dark)',
          marginTop: 'auto'
        }}>
          <p>© {new Date().getFullYear()} GatherSphere Inc. All rights reserved.</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
            Built with React, Express, MongoDB, and high-performance Vanilla CSS glassmorphic aesthetics.
          </p>
        </footer>
      </div>
    </Router>
  );
}
