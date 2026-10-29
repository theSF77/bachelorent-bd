import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_BADGE = { pending: 'warning', approved: 'success', rejected: 'danger', inactive: 'gray' };

export default function ProviderDashboard() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', address: '', city: '', area: '', rent_amount: '', property_type: 'flat', floor_number: '', total_rooms: '', bathrooms: '', furnished: false, utilities_included: false, available_from: '', gender_preference: 'any', max_occupants: 1, amenities: '' });
  const [images, setImages] = useState([]);

  const fetchProperties = () => {
    setLoading(true);
    api.get('/properties/my').then(r => setProperties(r.data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProperties(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this property?')) return;
    try { await api.delete(`/properties/${id}`); toast.success('Property deleted'); fetchProperties(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (form.amenities) form.amenities.split(',').forEach(a => fd.append('amenities', a.trim()));
      images.forEach(f => fd.append('images', f));
      await api.post('/properties', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Property submitted for admin approval!');
      setShowForm(false);
      setForm({ title: '', description: '', address: '', city: '', area: '', rent_amount: '', property_type: 'flat', floor_number: '', total_rooms: '', bathrooms: '', furnished: false, utilities_included: false, available_from: '', gender_preference: 'any', max_occupants: 1, amenities: '' });
      setImages([]);
      fetchProperties();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit'); }
    finally { setSubmitting(false); }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const CITIES = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Comilla', 'Mymensingh'];
  const TYPES = ['single_room', 'shared_room', 'flat', 'sublet', 'mess'];

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem' }}>My Properties</h1>
            <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>Manage your rental listings</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            {showForm ? '✕ Cancel' : '+ Add Property'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          {[
            { label: 'Total', value: properties.length, icon: '🏠' },
            { label: 'Approved', value: properties.filter(p => p.status === 'approved').length, icon: '✅' },
            { label: 'Pending', value: properties.filter(p => p.status === 'pending').length, icon: '⏳' },
            { label: 'Total Inquiries', value: properties.reduce((s, p) => s + (p.inquiry_count || 0), 0), icon: '📩' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="card card-body" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>{icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{value}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Add Property Form */}
        {showForm && (
          <div className="card card-body" style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.5rem' }}>Add New Property</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-control" placeholder="e.g. Bachelor flat in Mirpur" value={form.title} onChange={set('title')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Property Type *</label>
                  <select className="form-control" value={form.property_type} onChange={set('property_type')}>
                    {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Rent Amount (৳) *</label>
                  <input type="number" className="form-control" placeholder="e.g. 8000" value={form.rent_amount} onChange={set('rent_amount')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <select className="form-control" value={form.city} onChange={set('city')} required>
                    <option value="">Select city</option>
                    {CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Area / Thana</label>
                  <input className="form-control" placeholder="e.g. Mirpur-10" value={form.area} onChange={set('area')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Address *</label>
                  <input className="form-control" placeholder="House/Road details" value={form.address} onChange={set('address')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Floor Number</label>
                  <input type="number" className="form-control" value={form.floor_number} onChange={set('floor_number')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Rooms</label>
                  <input type="number" className="form-control" value={form.total_rooms} onChange={set('total_rooms')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Bathrooms</label>
                  <input type="number" className="form-control" value={form.bathrooms} onChange={set('bathrooms')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Occupants</label>
                  <input type="number" className="form-control" value={form.max_occupants} onChange={set('max_occupants')} min={1} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender Preference</label>
                  <select className="form-control" value={form.gender_preference} onChange={set('gender_preference')}>
                    <option value="any">Any</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Available From</label>
                  <input type="date" className="form-control" value={form.available_from} onChange={set('available_from')} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={4} placeholder="Describe the property..." value={form.description} onChange={set('description')} style={{ resize: 'vertical' }} />
              </div>

              <div className="form-group">
                <label className="form-label">Amenities (comma-separated)</label>
                <input className="form-control" placeholder="WiFi, Parking, Generator, CCTV" value={form.amenities} onChange={set('amenities')} />
              </div>

              <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                  <input type="checkbox" checked={form.furnished} onChange={set('furnished')} />
                  Furnished
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                  <input type="checkbox" checked={form.utilities_included} onChange={set('utilities_included')} />
                  Utilities Included
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Property Images (max 10)</label>
                <input type="file" className="form-control" multiple accept="image/*" onChange={e => setImages(Array.from(e.target.files))} />
                {images.length > 0 && <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>{images.length} file(s) selected</p>}
              </div>

              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : '📤 Submit for Approval'}
              </button>
            </form>
          </div>
        )}

        {/* Properties List */}
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          properties.length > 0 ? (
            <div className="card">
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Property</th><th>Location</th><th>Rent</th><th>Status</th><th>Inquiries</th><th>Actions</th></tr></thead>
                  <tbody>
                    {properties.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{p.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--gray-400)', textTransform: 'capitalize' }}>{p.property_type?.replace('_', ' ')}</div>
                        </td>
                        <td style={{ color: 'var(--gray-600)', fontSize: 13 }}>{p.city}</td>
                        <td style={{ fontWeight: 600, color: 'var(--primary)' }}>৳{Number(p.rent_amount).toLocaleString()}</td>
                        <td><span className={`badge badge-${STATUS_BADGE[p.status]}`} style={{ textTransform: 'capitalize', fontSize: 12 }}>{p.status}</span></td>
                        <td style={{ color: 'var(--gray-600)' }}>{p.inquiry_count || 0}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <Link to={`/properties/${p.id}`} className="btn btn-ghost btn-sm">View</Link>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="empty-state card">
              <div className="empty-state-icon">🏠</div>
              <p className="empty-state-title">No properties yet</p>
              <p className="empty-state-text">Add your first property listing</p>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowForm(true)}>+ Add Property</button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
