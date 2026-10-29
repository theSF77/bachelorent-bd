import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_BADGE = { pending: 'warning', approved: 'success', rejected: 'danger', closed: 'gray' };
const APP_BADGE = { pending: 'warning', reviewed: 'info', shortlisted: 'success', rejected: 'danger', hired: 'success' };
const CATEGORIES = ['Tutoring', 'Data Entry', 'Delivery', 'Customer Service', 'Graphic Design', 'Content Writing', 'IT Support', 'Sales', 'Photography', 'Other'];
const TYPES = ['part_time', 'freelance', 'internship', 'remote'];

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', company_name: '', job_type: 'part_time', category: '',
    location: '', salary_min: '', salary_max: '', salary_type: 'monthly',
    hours_per_week: '', skills_required: '', experience_required: 'none', application_deadline: ''
  });

  const fetchJobs = () => {
    setLoading(true);
    api.get('/jobs/my').then(r => setJobs(r.data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, []);

  const viewApplications = async (job) => {
    setSelectedJob(job);
    setAppsLoading(true);
    try {
      const r = await api.get(`/jobs/${job.id}/applications`);
      setApplications(r.data.data || []);
    } catch { toast.error('Could not load applications'); }
    finally { setAppsLoading(false); }
  };

  const updateAppStatus = async (appId, status) => {
    try {
      await api.put(`/jobs/${selectedJob.id}/applications/${appId}/status`, { status });
      toast.success('Status updated');
      setApplications(apps => apps.map(a => a.id === appId ? { ...a, status } : a));
    } catch { toast.error('Failed to update'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/jobs', form);
      toast.success('Job submitted for admin approval!');
      setShowForm(false);
      setForm({ title: '', description: '', company_name: '', job_type: 'part_time', category: '', location: '', salary_min: '', salary_max: '', salary_type: 'monthly', hours_per_week: '', skills_required: '', experience_required: 'none', application_deadline: '' });
      fetchJobs();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit'); }
    finally { setSubmitting(false); }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  if (selectedJob) return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelectedJob(null)}>← Back</button>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>Applications for "{selectedJob.title}"</h1>
            <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>{applications.length} application(s)</p>
          </div>
        </div>
        {appsLoading ? <div className="loading-center"><div className="spinner" /></div> : applications.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {applications.map(a => (
              <div key={a.id} className="card card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontWeight: 600 }}>{a.applicant_name}</h3>
                    <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>✉️ {a.applicant_email} {a.applicant_phone && `· 📞 ${a.applicant_phone}`}</p>
                    <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>Applied: {new Date(a.applied_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`badge badge-${APP_BADGE[a.status]}`} style={{ textTransform: 'capitalize' }}>{a.status}</span>
                </div>
                {a.cover_letter && (
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.7 }}>
                    {a.cover_letter}
                  </div>
                )}
                {a.resume_url && (
                  <a href={`http://localhost:5000${a.resume_url}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ marginTop: 8, display: 'inline-flex' }}>📄 View Resume</a>
                )}
                <div style={{ display: 'flex', gap: 6, marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  {['reviewed', 'shortlisted', 'hired', 'rejected'].map(s => (
                    <button key={s} className={`btn btn-sm ${a.status === s ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => updateAppStatus(a.id, s)} style={{ textTransform: 'capitalize' }}>{s}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state card">
            <div className="empty-state-icon">📭</div>
            <p className="empty-state-title">No applications yet</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem' }}>Job Listings</h1>
            <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>Manage your posted jobs</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>{showForm ? '✕ Cancel' : '+ Post Job'}</button>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          {[
            { label: 'Total Jobs', value: jobs.length, icon: '💼' },
            { label: 'Approved', value: jobs.filter(j => j.status === 'approved').length, icon: '✅' },
            { label: 'Pending', value: jobs.filter(j => j.status === 'pending').length, icon: '⏳' },
            { label: 'Total Applicants', value: jobs.reduce((s, j) => s + (j.application_count || 0), 0), icon: '👥' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="card card-body" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>{icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{value}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Post Job Form */}
        {showForm && (
          <div className="card card-body" style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.5rem' }}>Post New Job</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input className="form-control" placeholder="e.g. Part-time Data Entry Operator" value={form.title} onChange={set('title')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input className="form-control" placeholder="Your company or organization" value={form.company_name} onChange={set('company_name')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Type *</label>
                  <select className="form-control" value={form.job_type} onChange={set('job_type')}>
                    {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-control" value={form.category} onChange={set('category')}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input className="form-control" placeholder="e.g. Dhaka / Remote" value={form.location} onChange={set('location')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Hours per Week</label>
                  <input type="number" className="form-control" placeholder="e.g. 20" value={form.hours_per_week} onChange={set('hours_per_week')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Min Salary (৳)</label>
                  <input type="number" className="form-control" placeholder="e.g. 5000" value={form.salary_min} onChange={set('salary_min')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Salary (৳)</label>
                  <input type="number" className="form-control" placeholder="e.g. 10000" value={form.salary_max} onChange={set('salary_max')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Salary Type</label>
                  <select className="form-control" value={form.salary_type} onChange={set('salary_type')}>
                    {['hourly', 'daily', 'monthly', 'fixed'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Experience Required</label>
                  <select className="form-control" value={form.experience_required} onChange={set('experience_required')}>
                    {['none', '0-1yr', '1-2yr', '2-3yr'].map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Application Deadline</label>
                  <input type="date" className="form-control" value={form.application_deadline} onChange={set('application_deadline')} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Job Description *</label>
                <textarea className="form-control" rows={5} placeholder="Describe responsibilities, work environment, requirements..." value={form.description} onChange={set('description')} required style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Skills Required (comma-separated)</label>
                <input className="form-control" placeholder="MS Excel, Communication, Photoshop" value={form.skills_required} onChange={set('skills_required')} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Posting...' : '📤 Submit for Approval'}</button>
            </form>
          </div>
        )}

        {/* Jobs Table */}
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          jobs.length > 0 ? (
            <div className="card">
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Job Title</th><th>Type</th><th>Location</th><th>Status</th><th>Applicants</th><th>Actions</th></tr></thead>
                  <tbody>
                    {jobs.map(j => (
                      <tr key={j.id}>
                        <td><div style={{ fontWeight: 500 }}>{j.title}</div><div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{j.company_name}</div></td>
                        <td><span className="badge badge-gray" style={{ textTransform: 'capitalize', fontSize: 12 }}>{j.job_type?.replace('_', ' ')}</span></td>
                        <td style={{ color: 'var(--gray-600)', fontSize: 13 }}>{j.location || '—'}</td>
                        <td><span className={`badge badge-${STATUS_BADGE[j.status]}`} style={{ textTransform: 'capitalize', fontSize: 12 }}>{j.status}</span></td>
                        <td style={{ fontWeight: 600 }}>{j.application_count || 0}</td>
                        <td><button className="btn btn-outline btn-sm" onClick={() => viewApplications(j)}>View Applicants</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="empty-state card">
              <div className="empty-state-icon">💼</div>
              <p className="empty-state-title">No jobs posted yet</p>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowForm(true)}>+ Post a Job</button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
