import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import PropertyCard from '../components/common/PropertyCard';
import JobCard from '../components/common/JobCard';

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/properties?limit=6').then(r => setProperties(r.data.data || []));
    api.get('/jobs?limit=4').then(r => setJobs(r.data.data || []));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/properties?city=${search}`);
  };

  return (
    <div style={{ paddingTop: 'var(--nav-height)' }}>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--secondary) 0%, var(--secondary-light) 100%)',
        padding: '5rem 1.5rem',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: 400, height: 400, borderRadius: '50%',
          background: 'rgba(200,85,42,0.12)', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '10%',
          width: 280, height: 280, borderRadius: '50%',
          background: 'rgba(200,85,42,0.08)', pointerEvents: 'none'
        }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-block', background: 'rgba(200,85,42,0.2)',
            color: '#F5A623', padding: '5px 16px', borderRadius: 20, fontSize: 13,
            fontWeight: 500, marginBottom: '1.5rem', border: '1px solid rgba(200,85,42,0.3)'
          }}>
            🏠 Smart Platform for Bachelors & Students
          </div>
          <h1 className="heading-display" style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#fff',
            marginBottom: '1.25rem', lineHeight: 1.15
          }}>
            Find Your Perfect<br />
            <span style={{ color: 'var(--primary-light)' }}>Home & Job</span> in Bangladesh
          </h1>
          <p style={{ color: 'var(--gray-300)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Verified rental listings and part-time job opportunities — all in one trusted platform for Bangladeshi students.
          </p>
          <form onSubmit={handleSearch} style={{ display: 'flex', maxWidth: 580, margin: '0 auto', gap: 0, background: 'var(--white)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
            <input
              type="text"
              placeholder="Search by city — Dhaka, Chittagong, Sylhet..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, padding: '14px 20px', border: 'none', outline: 'none', fontSize: 15, background: 'transparent', color: 'var(--gray-800)' }}
            />
            <button type="submit" className="btn btn-primary" style={{ borderRadius: 0, padding: '14px 24px', fontSize: 15 }}>Search</button>
          </form>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem' }}>
            {[['500+', 'Listings'], ['200+', 'Jobs'], ['1000+', 'Students']].map(([n, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-light)' }}>{n}</div>
                <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section section-light">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center' }}>
            <h2 className="section-title">How Bachelorent Works</h2>
            <p className="section-subtitle">Three easy steps to find your home or job</p>
          </div>
          <div className="grid-3">
            {[
              { icon: '🔍', step: '01', title: 'Search & Filter', desc: 'Browse verified rental properties and part-time jobs using smart filters.' },
              { icon: '📋', step: '02', title: 'View & Apply', desc: 'View full details, contact providers, or submit job applications instantly.' },
              { icon: '✅', step: '03', title: 'Move In & Work', desc: 'Connect with verified providers and start your job — all hassle-free.' },
            ].map(({ icon, step, title, desc }) => (
              <div key={step} className="card card-body" style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{icon}</div>
                <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>STEP {step}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="section" style={{ background: 'var(--gray-50)' }}>
        <div className="container">
          <div className="flex-between section-header">
            <div>
              <h2 className="section-title">Latest Properties</h2>
              <p className="section-subtitle">Verified rentals ready for bachelors</p>
            </div>
            <Link to="/properties" className="btn btn-outline">View All</Link>
          </div>
          {properties.length > 0 ? (
            <div className="grid-3">
              {properties.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🏠</div>
              <p className="empty-state-title">No properties yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="section section-light">
        <div className="container">
          <div className="flex-between section-header">
            <div>
              <h2 className="section-title">Part-Time Jobs</h2>
              <p className="section-subtitle">Flexible opportunities for students</p>
            </div>
            <Link to="/jobs" className="btn btn-outline">View All</Link>
          </div>
          {jobs.length > 0 ? (
            <div className="grid-2">
              {jobs.map(j => <JobCard key={j.id} job={j} />)}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">💼</div>
              <p className="empty-state-title">No jobs yet</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--primary)', padding: '4rem 1.5rem' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="heading-display" style={{ fontSize: '2rem', color: '#fff', marginBottom: '1rem' }}>
            Are you a provider or employer?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', fontSize: '1.05rem' }}>
            Post your rental listing or job opportunity and reach thousands of students.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 600, padding: '12px 28px' }}>Post a Listing</Link>
            <Link to="/register" className="btn" style={{ background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.5)', padding: '12px 28px' }}>Post a Job</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
