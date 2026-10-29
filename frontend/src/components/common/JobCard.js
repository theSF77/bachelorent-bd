import React from 'react';
import { Link } from 'react-router-dom';

const TYPE_COLORS = { part_time: 'info', freelance: 'warning', internship: 'success', remote: 'primary' };

export default function JobCard({ job }) {
  const { id, title, company_name, job_type, category, location, salary_min, salary_max, salary_type, hours_per_week, employer_name, employer_verified, application_deadline, created_at } = job;

  const daysLeft = application_deadline
    ? Math.ceil((new Date(application_deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-800)', lineHeight: 1.4, marginBottom: 4 }}>{title}</h3>
          <p style={{ fontSize: 13, color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: 4 }}>
            🏢 {company_name || employer_name}
            {employer_verified && <span style={{ color: 'var(--info)', fontSize: 11 }}>✓ Verified</span>}
          </p>
        </div>
        <span className={`badge badge-${TYPE_COLORS[job_type] || 'gray'}`} style={{ flexShrink: 0, textTransform: 'capitalize' }}>
          {job_type?.replace('_', ' ')}
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 13, color: 'var(--gray-500)' }}>
        {location && <span>📍 {location}</span>}
        {category && <span>🏷️ {category}</span>}
        {hours_per_week && <span>⏱ {hours_per_week}h/week</span>}
      </div>

      {(salary_min || salary_max) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
            ৳{salary_min ? Number(salary_min).toLocaleString() : '—'}
            {salary_max && ` – ৳${Number(salary_max).toLocaleString()}`}
          </span>
          <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>/{salary_type}</span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--gray-100)' }}>
        <div>
          {daysLeft !== null && (
            <span style={{ fontSize: 12, color: daysLeft < 5 ? 'var(--danger)' : 'var(--gray-400)' }}>
              {daysLeft > 0 ? `${daysLeft}d left` : 'Deadline passed'}
            </span>
          )}
        </div>
        <Link to={`/jobs/${id}`} className="btn btn-outline btn-sm">Apply Now</Link>
      </div>
    </div>
  );
}
