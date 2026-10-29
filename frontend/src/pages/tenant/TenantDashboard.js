import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const STATUS_BADGE = { pending: 'warning', reviewed: 'info', shortlisted: 'success', rejected: 'danger', hired: 'success' };

export default function TenantDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [saved, setSaved] = useState([]);
  const [tab, setTab] = useState('applications');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/jobs/applications').then(r => setApplications(r.data.data || [])),
      api.get('/properties/saved').then(r => setSaved(r.data.data || [])),
    ]).finally(() => setLoading(false));
  }, []);

  const tabs = [
    { id: 'applications', label: `Job Applications (${applications.length})` },
    { id: 'saved', label: `Saved Properties (${saved.length})` },
  ];

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem' }}>My Dashboard</h1>
            <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>Welcome back, {user?.name}</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/properties" className="btn btn-outline btn-sm">Find Property</Link>
            <Link to="/jobs" className="btn btn-primary btn-sm">Find Jobs</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          {[
            { label: 'Applications', value: applications.length, icon: '📝' },
            { label: 'Shortlisted', value: applications.filter(a => a.status === 'shortlisted').length, icon: '⭐' },
            { label: 'Hired', value: applications.filter(a => a.status === 'hired').length, icon: '🎉' },
            { label: 'Saved Properties', value: saved.length, icon: '❤️' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="card card-body" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>{icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{value}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--gray-200)', marginBottom: '1.5rem' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: tab === t.id ? 600 : 400,
              color: tab === t.id ? 'var(--primary)' : 'var(--gray-500)',
              borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'var(--transition)'
            }}>{t.label}</button>
          ))}
        </div>

        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <>
            {tab === 'applications' && (
              applications.length > 0 ? (
                <div className="card">
                  <div className="table-wrapper">
                    <table>
                      <thead><tr><th>Job Title</th><th>Company</th><th>Type</th><th>Applied</th><th>Status</th></tr></thead>
                      <tbody>
                        {applications.map(a => (
                          <tr key={a.id}>
                            <td><Link to={`/jobs/${a.job_id}`} style={{ color: 'var(--primary)', fontWeight: 500 }}>{a.title}</Link></td>
                            <td style={{ color: 'var(--gray-600)', fontSize: 13 }}>{a.company_name || a.employer_name}</td>
                            <td><span className="badge badge-gray" style={{ textTransform: 'capitalize', fontSize: 12 }}>{a.job_type?.replace('_', ' ')}</span></td>
                            <td style={{ color: 'var(--gray-500)', fontSize: 13 }}>{new Date(a.applied_at).toLocaleDateString()}</td>
                            <td><span className={`badge badge-${STATUS_BADGE[a.status] || 'gray'}`} style={{ textTransform: 'capitalize', fontSize: 12 }}>{a.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="empty-state card">
                  <div className="empty-state-icon">📝</div>
                  <p className="empty-state-title">No job applications yet</p>
                  <p className="empty-state-text">Start applying for part-time jobs!</p>
                  <Link to="/jobs" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Jobs</Link>
                </div>
              )
            )}

            {tab === 'saved' && (
              saved.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  {saved.map(p => (
                    <div key={p.id} className="card">
                      <img src={p.primary_image ? `http://localhost:5000${p.primary_image}` : '/placeholder-property.jpg'} alt={p.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                      <div className="card-body">
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 4 }}>{p.title}</h3>
                        <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 8 }}>📍 {p.city}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)', fontWeight: 700 }}>৳{Number(p.rent_amount).toLocaleString()}</span>
                          <Link to={`/properties/${p.id}`} className="btn btn-outline btn-sm">View</Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state card">
                  <div className="empty-state-icon">❤️</div>
                  <p className="empty-state-title">No saved properties</p>
                  <Link to="/properties" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Properties</Link>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
