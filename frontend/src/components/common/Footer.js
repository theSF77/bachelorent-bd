import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--secondary)', color: 'var(--gray-300)', padding: '3rem 0 1.5rem' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontFamily: 'var(--font-display)' }}>B</div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>Bachelorent</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--gray-400)', maxWidth: 280 }}>
              Smart rental and part-time job platform for bachelors and university students in Bangladesh.
            </p>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Rentals</h4>
            {['Browse Properties', 'Post Listing', 'Saved Properties'].map(l => (
              <div key={l} style={{ marginBottom: 8 }}><Link to="/properties" style={{ fontSize: 13, color: 'var(--gray-400)', transition: 'var(--transition)' }}>{l}</Link></div>
            ))}
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Jobs</h4>
            {['Browse Jobs', 'Post a Job', 'My Applications'].map(l => (
              <div key={l} style={{ marginBottom: 8 }}><Link to="/jobs" style={{ fontSize: 13, color: 'var(--gray-400)' }}>{l}</Link></div>
            ))}
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Account</h4>
            {['Register', 'Login', 'Profile'].map(l => (
              <div key={l} style={{ marginBottom: 8 }}><Link to={`/${l.toLowerCase()}`} style={{ fontSize: 13, color: 'var(--gray-400)' }}>{l}</Link></div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>&copy; 2025 Bachelorent. All rights reserved.</p>
          <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>Made for Bangladeshi students</p>
        </div>
      </div>
    </footer>
  );
}
