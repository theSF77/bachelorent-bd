import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const TABS = ['Overview', 'Pending Listings', 'Users', 'Inquiries'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState({ properties: [], jobs: [] });
  const [users, setUsers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sRes, pRes, uRes, iRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/listings/pending'),
        api.get('/admin/users'),
        api.get('/admin/inquiries'),
      ]);
      setStats(sRes.data.data);
      setPending(pRes.data.data);
      setUsers(uRes.data.data || []);
      setInquiries(iRes.data.data || []);
    } catch { toast.error('Failed to load admin data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const updatePropStatus = async (id, status) => {
    try {
      await api.put(`/admin/properties/${id}/status`, { status });
      toast.success(`Property ${status}`);
      setPending(p => ({ ...p, properties: p.properties.filter(x => x.id !== id) }));
      setStats(s => ({ ...s, pendingProperties: s.pendingProperties - 1 }));
    } catch { toast.error('Failed'); }
  };

  const updateJobStatus = async (id, status) => {
    try {
      await api.put(`/admin/jobs/${id}/status`, { status });
      toast.success(`Job ${status}`);
      setPending(p => ({ ...p, jobs: p.jobs.filter(x => x.id !== id) }));
      setStats(s => ({ ...s, pendingJobs: s.pendingJobs - 1 }));
    } catch { toast.error('Failed'); }
  };

  const toggleUser = async (id) => {
    try {
      await api.put(`/admin/users/${id}/toggle`);
      toast.success('User status updated');
      setUsers(u => u.map(x => x.id === id ? { ...x, is_active: !x.is_active } : x));
    } catch { toast.error('Failed'); }
  };

  const verifyUser = async (id, verified) => {
    try {
      await api.put(`/admin/users/${id}/verify`, { verified });
      toast.success(verified ? 'User verified' : 'Verification removed');
      setUsers(u => u.map(x => x.id === id ? { ...x, is_verified: verified } : x));
    } catch { toast.error('Failed'); }
  };

  const deleteContent = async (type, id) => {
    if (!window.confirm(`Delete this ${type}?`)) return;
    try {
      await api.delete(`/admin/content/${type}/${id}`);
      toast.success('Deleted');
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  const filteredUsers = users.filter(u =>
    !userFilter || u.role === userFilter || u.name.toLowerCase().includes(userFilter.toLowerCase())
  );

  if (loading) return <div className="loading-center" style={{ minHeight: '80vh' }}><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem' }}>Admin Panel</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>System oversight & management</p>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Users', value: stats.users, icon: '👥', color: 'var(--info)' },
              { label: 'Properties', value: stats.properties, icon: '🏠', color: 'var(--primary)' },
              { label: 'Jobs', value: stats.jobs, icon: '💼', color: 'var(--success)' },
              { label: 'Pending Review', value: stats.pendingProperties + stats.pendingJobs, icon: '⏳', color: 'var(--warning)' },
              { label: 'Applications', value: stats.applications, icon: '📝', color: 'var(--secondary)' },
              { label: 'Inquiries', value: stats.inquiries, icon: '📩', color: 'var(--accent)' },
              { label: 'Pending Properties', value: stats.pendingProperties, icon: '🏚️', color: 'var(--warning)' },
              { label: 'Pending Jobs', value: stats.pendingJobs, icon: '📋', color: 'var(--danger)' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="card card-body" style={{ textAlign: 'center', padding: '1.25rem' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color }}>{value}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--gray-200)', marginBottom: '1.5rem' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: tab === t ? 600 : 400,
              color: tab === t ? 'var(--primary)' : 'var(--gray-500)',
              borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent',
              display: 'flex', alignItems: 'center', gap: 6
            }}>
              {t}
              {t === 'Pending Listings' && (pending.properties.length + pending.jobs.length) > 0 && (
                <span style={{ background: 'var(--danger)', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11 }}>
                  {pending.properties.length + pending.jobs.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'Overview' && (
          <div className="grid-2">
            <div className="card card-body">
              <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn btn-outline btn-block" onClick={() => setTab('Pending Listings')}>
                  📋 Review Pending ({(stats?.pendingProperties || 0) + (stats?.pendingJobs || 0)})
                </button>
                <button className="btn btn-ghost btn-block" onClick={() => setTab('Users')}>👥 Manage Users</button>
                <button className="btn btn-ghost btn-block" onClick={() => setTab('Inquiries')}>📩 View Inquiries</button>
              </div>
            </div>
            <div className="card card-body">
              <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Platform Health</h3>
              {[
                ['Active Users', users.filter(u => u.is_active).length, users.length],
                ['Verified Users', users.filter(u => u.is_verified).length, users.length],
                ['Approved Jobs', stats?.jobs - stats?.pendingJobs, stats?.jobs],
              ].map(([label, val, total]) => (
                <div key={label} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span>{label}</span><span style={{ fontWeight: 600 }}>{val}/{total}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--gray-100)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${total ? (val / total) * 100 : 0}%`, background: 'var(--primary)', borderRadius: 3, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Pending Listings' && (
          <div>
            {/* Pending Properties */}
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1rem' }}>
              Properties ({pending.properties.length})
            </h2>
            {pending.properties.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {pending.properties.map(p => (
                  <div key={p.id} className="card">
                    {p.image && <img src={`http://localhost:5000${p.image}`} alt={p.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />}
                    <div className="card-body">
                      <h3 style={{ fontWeight: 600, marginBottom: 4 }}>{p.title}</h3>
                      <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 2 }}>📍 {p.city} · ৳{Number(p.rent_amount).toLocaleString()}/mo</p>
                      <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 12 }}>By: {p.provider_name} ({p.provider_email})</p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-success btn-sm" onClick={() => updatePropStatus(p.id, 'approved')}>✓ Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => updatePropStatus(p.id, 'rejected')}>✕ Reject</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => deleteContent('property', p.id)}>🗑 Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)', marginBottom: '2rem' }}>No pending properties ✓</div>}

            {/* Pending Jobs */}
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1rem' }}>
              Jobs ({pending.jobs.length})
            </h2>
            {pending.jobs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pending.jobs.map(j => (
                  <div key={j.id} className="card card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontWeight: 600 }}>{j.title}</h3>
                        <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>
                          {j.company_name} · {j.job_type?.replace('_', ' ')} · {j.location || 'N/A'}
                        </p>
                        <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>By: {j.employer_name} ({j.employer_email})</p>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <button className="btn btn-success btn-sm" onClick={() => updateJobStatus(j.id, 'approved')}>✓ Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => updateJobStatus(j.id, 'rejected')}>✕ Reject</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => deleteContent('job', j.id)}>🗑</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>No pending jobs ✓</div>}
          </div>
        )}

        {tab === 'Users' && (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <input className="form-control" style={{ maxWidth: 280 }} placeholder="Search by name..." value={userFilter} onChange={e => setUserFilter(e.target.value)} />
              {['', 'tenant', 'provider', 'employer'].map(r => (
                <button key={r} className={`btn btn-sm ${userFilter === r ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setUserFilter(r)}>
                  {r || 'All'}
                </button>
              ))}
            </div>
            <div className="card">
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Verified</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 500 }}>{u.name}</td>
                        <td style={{ fontSize: 13, color: 'var(--gray-600)' }}>{u.email}</td>
                        <td><span className="badge badge-gray" style={{ textTransform: 'capitalize', fontSize: 12 }}>{u.role}</span></td>
                        <td>
                          <button onClick={() => verifyUser(u.id, !u.is_verified)} style={{
                            background: u.is_verified ? 'var(--success-bg)' : 'var(--gray-100)',
                            color: u.is_verified ? 'var(--success)' : 'var(--gray-500)',
                            border: 'none', padding: '3px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer'
                          }}>{u.is_verified ? '✓ Verified' : 'Unverified'}</button>
                        </td>
                        <td>
                          <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 12 }}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--gray-400)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                        <td>
                          <button className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-success'}`} onClick={() => toggleUser(u.id)}>
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'Inquiries' && (
          <div className="card">
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Property</th><th>Tenant</th><th>Provider</th><th>Message</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {inquiries.map(i => (
                    <tr key={i.id}>
                      <td style={{ fontWeight: 500, fontSize: 13 }}>{i.property_title}</td>
                      <td style={{ fontSize: 13, color: 'var(--gray-600)' }}>{i.tenant_name}</td>
                      <td style={{ fontSize: 13, color: 'var(--gray-600)' }}>{i.provider_name}</td>
                      <td style={{ fontSize: 13, color: 'var(--gray-600)', maxWidth: 240 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.message}</div>
                      </td>
                      <td><span className={`badge ${i.status === 'replied' ? 'badge-success' : i.status === 'closed' ? 'badge-gray' : 'badge-warning'}`} style={{ fontSize: 12, textTransform: 'capitalize' }}>{i.status}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--gray-400)' }}>{new Date(i.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {inquiries.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}>No inquiries yet</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
