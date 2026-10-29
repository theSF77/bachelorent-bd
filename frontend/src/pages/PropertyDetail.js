import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function PropertyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [inquiry, setInquiry] = useState('');
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/properties/${id}`).then(r => setProperty(r.data.data)).catch(() => navigate('/properties')).finally(() => setLoading(false));
  }, [id]);

  const handleInquiry = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setSending(true);
    try {
      await api.post(`/properties/${id}/inquire`, { message: inquiry });
      toast.success('Inquiry sent to provider!');
      setInquiry('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send'); }
    finally { setSending(false); }
  };

  const handleSave = async () => {
    if (!user) return navigate('/login');
    setSaving(true);
    try { await api.post(`/properties/${id}/save`); toast.success('Property saved!'); }
    catch (err) { toast.error(err.response?.data?.message || 'Already saved'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="loading-center" style={{ minHeight: '80vh' }}><div className="spinner" /></div>;
  if (!property) return null;

  const { title, description, address, city, area, rent_amount, property_type, floor_number, total_rooms, bathrooms, furnished, utilities_included, available_from, gender_preference, max_occupants, provider_name, provider_phone, provider_email, provider_verified, images, amenities, reviews, avg_rating } = property;
  const allImages = images?.length ? images : [{ image_url: null }];

  return (
    <div className="page">
      <div className="container">
        {/* Breadcrumb */}
        <nav style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: '1.5rem' }}>
          <a href="/properties" style={{ color: 'var(--primary)' }}>Properties</a>
          <span style={{ margin: '0 8px' }}>›</span>
          <span>{title}</span>
        </nav>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
          {/* Main content */}
          <div>
            {/* Image gallery */}
            <div className="card" style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
              <div style={{ height: 360, background: 'var(--gray-100)', overflow: 'hidden' }}>
                <img
                  src={allImages[activeImg]?.image_url ? `http://localhost:5000${allImages[activeImg].image_url}` : '/placeholder-property.jpg'}
                  alt={title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              {allImages.length > 1 && (
                <div style={{ display: 'flex', gap: 8, padding: '10px 12px', overflowX: 'auto' }}>
                  {allImages.map((img, i) => (
                    <div key={i} onClick={() => setActiveImg(i)} style={{
                      width: 72, height: 54, flexShrink: 0, borderRadius: 6, overflow: 'hidden', cursor: 'pointer',
                      border: `2px solid ${i === activeImg ? 'var(--primary)' : 'transparent'}`
                    }}>
                      <img src={img.image_url ? `http://localhost:5000${img.image_url}` : '/placeholder-property.jpg'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="card card-body" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 6 }}>{title}</h1>
                  <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>📍 {address}, {area ? `${area}, ` : ''}{city}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary)' }}>৳{Number(rent_amount).toLocaleString()}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>per month</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1.25rem' }}>
                {[
                  ['🏠', property_type?.replace('_', ' ')],
                  floor_number && ['🔢', `Floor ${floor_number}`],
                  total_rooms && ['🚪', `${total_rooms} room(s)`],
                  bathrooms && ['🚿', `${bathrooms} bath`],
                  ['👥', `Max ${max_occupants}`],
                  ['⚤', gender_preference],
                  furnished && ['🛋️', 'Furnished'],
                  utilities_included && ['💡', 'Utilities incl.'],
                  available_from && ['📅', `Available ${new Date(available_from).toLocaleDateString()}`],
                ].filter(Boolean).map(([icon, label]) => (
                  <span key={label} className="badge badge-gray" style={{ fontSize: 13, padding: '5px 12px' }}>{icon} {label}</span>
                ))}
              </div>

              {description && (
                <>
                  <h3 style={{ fontWeight: 600, marginBottom: 8, fontSize: '0.95rem' }}>Description</h3>
                  <p style={{ color: 'var(--gray-600)', fontSize: 14, lineHeight: 1.8 }}>{description}</p>
                </>
              )}

              {amenities?.length > 0 && (
                <div style={{ marginTop: '1.25rem' }}>
                  <h3 style={{ fontWeight: 600, marginBottom: 10, fontSize: '0.95rem' }}>Amenities</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {amenities.map(a => <span key={a} className="badge badge-success">✓ {a}</span>)}
                  </div>
                </div>
              )}
            </div>

            {/* Reviews */}
            {reviews?.length > 0 && (
              <div className="card card-body">
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>
                  Reviews {avg_rating && <span style={{ fontSize: '1rem', color: 'var(--gray-500)' }}>★ {Number(avg_rating).toFixed(1)}</span>}
                </h3>
                {reviews.map(r => (
                  <div key={r.id} style={{ borderBottom: '1px solid var(--gray-100)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{r.reviewer_name}</span>
                      <span style={{ color: 'var(--accent)' }}>{'★'.repeat(r.rating)}</span>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--gray-600)' }}>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: 'calc(var(--nav-height) + 1rem)' }}>
            {/* Provider card */}
            <div className="card card-body">
              <h3 style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem' }}>Provider Info</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18 }}>
                  {provider_name?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{provider_name}</div>
                  {provider_verified && <span className="badge badge-success" style={{ fontSize: 11 }}>✓ Verified</span>}
                </div>
              </div>
              {provider_phone && <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 4 }}>📞 {provider_phone}</p>}
              {provider_email && <p style={{ fontSize: 13, color: 'var(--gray-600)' }}>✉️ {provider_email}</p>}
            </div>

            {/* Inquiry form */}
            <div className="card card-body">
              <h3 style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem' }}>Send an Inquiry</h3>
              <form onSubmit={handleInquiry}>
                <div className="form-group">
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Hi, I'm interested in this property. Is it still available?"
                    value={inquiry}
                    onChange={e => setInquiry(e.target.value)}
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={sending}>
                  {sending ? 'Sending...' : '📨 Send Inquiry'}
                </button>
              </form>
            </div>

            <button className="btn btn-outline btn-block" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : '❤️ Save Property'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
