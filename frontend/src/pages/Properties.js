import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import PropertyCard from '../components/common/PropertyCard';

const PROPERTY_TYPES = ['single_room', 'shared_room', 'flat', 'sublet', 'mess'];
const CITIES = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Comilla', 'Mymensingh'];

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    type: '',
    minRent: '',
    maxRent: '',
    gender: '',
    furnished: '',
  });

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 9 });
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const res = await api.get(`/properties?${params}`);
      setProperties(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchProperties(); }, [page, filters]);

  const setFilter = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); };
  const clearFilters = () => { setFilters({ city: '', type: '', minRent: '', maxRent: '', gender: '', furnished: '' }); setPage(1); };
  const totalPages = Math.ceil(total / 9);

  return (
    <div className="page">
      <div className="container">
        <div className="section-header">
          <h1 className="section-title">Browse Properties</h1>
          <p className="section-subtitle">{total} verified listings available</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Sidebar Filters */}
          <aside className="card card-body" style={{ position: 'sticky', top: 'calc(var(--nav-height) + 1rem)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontWeight: 600, fontSize: '0.95rem' }}>Filters</h3>
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear all</button>
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <select className="form-control" value={filters.city} onChange={e => setFilter('city', e.target.value)}>
                <option value="">All Cities</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Property Type</label>
              <select className="form-control" value={filters.type} onChange={e => setFilter('type', e.target.value)}>
                <option value="">All Types</option>
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Min Rent (৳)</label>
              <input type="number" className="form-control" placeholder="e.g. 3000" value={filters.minRent} onChange={e => setFilter('minRent', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Max Rent (৳)</label>
              <input type="number" className="form-control" placeholder="e.g. 15000" value={filters.maxRent} onChange={e => setFilter('maxRent', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Gender Preference</label>
              <select className="form-control" value={filters.gender} onChange={e => setFilter('gender', e.target.value)}>
                <option value="">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="any">Mixed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Furnished</label>
              <select className="form-control" value={filters.furnished} onChange={e => setFilter('furnished', e.target.value)}>
                <option value="">Any</option>
                <option value="true">Furnished</option>
                <option value="false">Unfurnished</option>
              </select>
            </div>
          </aside>

          {/* Listings */}
          <div>
            {loading ? (
              <div className="loading-center" style={{ height: 300 }}><div className="spinner" /></div>
            ) : properties.length > 0 ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  {properties.map(p => <PropertyCard key={p.id} property={p} />)}
                </div>
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '2rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPage(p)}>{p}</button>
                    ))}
                    <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state card">
                <div className="empty-state-icon">🏠</div>
                <p className="empty-state-title">No properties found</p>
                <p className="empty-state-text">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
