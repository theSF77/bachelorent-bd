import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import JobCard from '../components/common/JobCard';

const CATEGORIES = ['Tutoring', 'Data Entry', 'Delivery', 'Customer Service', 'Graphic Design', 'Content Writing', 'IT Support', 'Sales', 'Photography'];
const JOB_TYPES = ['part_time', 'freelance', 'internship', 'remote'];
const CITIES = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Remote'];

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ category: '', type: '', location: '', minSalary: '' });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 9 });
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    api.get(`/jobs?${params}`).then(r => setJobs(r.data.data || [])).finally(() => setLoading(false));
  }, [page, filters]);

  const setFilter = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); };
  const clearFilters = () => { setFilters({ category: '', type: '', location: '', minSalary: '' }); setPage(1); };

  return (
    <div className="page">
      <div className="container">
        <div className="section-header">
          <h1 className="section-title">Part-Time Jobs</h1>
          <p className="section-subtitle">Flexible opportunities for students & bachelors</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Sidebar */}
          <aside className="card card-body" style={{ position: 'sticky', top: 'calc(var(--nav-height) + 1rem)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontWeight: 600, fontSize: '0.95rem' }}>Filters</h3>
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear</button>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-control" value={filters.category} onChange={e => setFilter('category', e.target.value)}>
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Job Type</label>
              <select className="form-control" value={filters.type} onChange={e => setFilter('type', e.target.value)}>
                <option value="">All Types</option>
                {JOB_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <select className="form-control" value={filters.location} onChange={e => setFilter('location', e.target.value)}>
                <option value="">All Locations</option>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Min Salary (৳)</label>
              <input type="number" className="form-control" placeholder="e.g. 5000" value={filters.minSalary} onChange={e => setFilter('minSalary', e.target.value)} />
            </div>
          </aside>

          {/* Job list */}
          <div>
            {loading ? (
              <div className="loading-center" style={{ height: 300 }}><div className="spinner" /></div>
            ) : jobs.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {jobs.map(j => <JobCard key={j.id} job={j} />)}
              </div>
            ) : (
              <div className="empty-state card">
                <div className="empty-state-icon">💼</div>
                <p className="empty-state-title">No jobs found</p>
                <p className="empty-state-text">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
