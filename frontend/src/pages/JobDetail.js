import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState(null);

  useEffect(() => {
    api.get(`/jobs/${id}`).then(r => setJob(r.data.data)).catch(() => navigate('/jobs')).finally(() => setLoading(false));
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setApplying(true);
    try {
      const fd = new FormData();
      fd.append('cover_letter', coverLetter);
      if (resume) fd.append('resume', resume);
      await api.post(`/jobs/${id}/apply`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Application submitted successfully!');
      setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to apply'); }
    finally { setApplying(false); }
  };

  if (loading) return <div className="loading-center" style={{ minHeight: '80vh' }}><div className="spinner" /></div>;
  if (!job) return null;

  const { title, description, company_name, job_type, category, location, salary_min, salary_max, salary_type, hours_per_week, skills_required, experience_required, application_deadline, employer_name, employer_email, employer_verified, applications } = job;
  const daysLeft = application_deadline ? Math.ceil((new Date(application_deadline) - new Date()) / 86400000) : null;

  return (
    <div className="page">
      <div className="container">
        <nav style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: '1.5rem' }}>
          <a href="/jobs" style={{ color: 'var(--primary)' }}>Jobs</a>
          <span style={{ margin: '0 8px' }}>›</span>
          <span>{title}</span>
        </nav>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }}>
          <div>
            <div className="card card-body" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 6 }}>{title}</h1>
                  <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 8 }}>
                    🏢 {company_name || employer_name}
                    {employer_verified && <span style={{ color: 'var(--info)', marginLeft: 6, fontSize: 12 }}>✓ Verified</span>}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{job_type?.replace('_', ' ')}</span>
                    {category && <span className="badge badge-gray">{category}</span>}
                    {location && <span className="badge badge-gray">📍 {location}</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {(salary_min || salary_max) && (
                    <>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)' }}>
                        ৳{salary_min ? Number(salary_min).toLocaleString() : '—'}{salary_max ? ` – ৳${Number(salary_max).toLocaleString()}` : ''}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>per {salary_type}</div>
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                {hours_per_week && <div><div style={{ fontSize: 12, color: 'var(--gray-400)' }}>Hours/Week</div><div style={{ fontWeight: 600 }}>{hours_per_week}h</div></div>}
                {experience_required && <div><div style={{ fontSize: 12, color: 'var(--gray-400)' }}>Experience</div><div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{experience_required}</div></div>}
                {daysLeft !== null && <div><div style={{ fontSize: 12, color: 'var(--gray-400)' }}>Deadline</div><div style={{ fontWeight: 600, color: daysLeft < 5 ? 'var(--danger)' : 'var(--gray-800)' }}>{daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}</div></div>}
                <div><div style={{ fontSize: 12, color: 'var(--gray-400)' }}>Applicants</div><div style={{ fontWeight: 600 }}>{applications || 0}</div></div>
              </div>

              {description && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <h3 style={{ fontWeight: 600, marginBottom: 10 }}>Job Description</h3>
                  <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{description}</p>
                </div>
              )}

              {skills_required && (
                <div>
                  <h3 style={{ fontWeight: 600, marginBottom: 10 }}>Skills Required</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {skills_required.split(',').map(s => <span key={s.trim()} className="badge badge-primary">{s.trim()}</span>)}
                  </div>
                </div>
              )}
            </div>

            {/* Apply form */}
            {showForm && (
              <div className="card card-body">
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.25rem' }}>Submit Application</h3>
                <form onSubmit={handleApply}>
                  <div className="form-group">
                    <label className="form-label">Cover Letter *</label>
                    <textarea className="form-control" rows={6} placeholder="Introduce yourself and explain why you're a great fit..." value={coverLetter} onChange={e => setCoverLetter(e.target.value)} required style={{ resize: 'vertical' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Resume (PDF, optional)</label>
                    <input type="file" className="form-control" accept=".pdf" onChange={e => setResume(e.target.files[0])} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" className="btn btn-primary" disabled={applying}>{applying ? 'Submitting...' : '✅ Submit Application'}</button>
                    <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ position: 'sticky', top: 'calc(var(--nav-height) + 1rem)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card card-body">
              <h3 style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem' }}>Employer</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--secondary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>{employer_name?.charAt(0)}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{employer_name}</div>
                  {employer_verified && <span className="badge badge-success" style={{ fontSize: 11 }}>✓ Verified</span>}
                </div>
              </div>
              {employer_email && <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>✉️ {employer_email}</p>}
            </div>

            {!showForm && (
              <button
                className="btn btn-primary btn-block btn-lg"
                onClick={() => user ? setShowForm(true) : navigate('/login')}
                disabled={daysLeft !== null && daysLeft <= 0}
              >
                {daysLeft !== null && daysLeft <= 0 ? 'Deadline Passed' : '🚀 Apply Now'}
              </button>
            )}

            <a href="/jobs" className="btn btn-ghost btn-block" style={{ textAlign: 'center' }}>← Back to Jobs</a>
          </div>
        </div>
      </div>
    </div>
  );
}
