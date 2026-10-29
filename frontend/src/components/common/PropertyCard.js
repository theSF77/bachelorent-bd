import React from 'react';
import { Link } from 'react-router-dom';

const TYPE_LABELS = { single_room: 'Single Room', shared_room: 'Shared Room', flat: 'Flat', sublet: 'Sublet', mess: 'Mess' };
const GENDER_ICONS = { male: '♂', female: '♀', any: '⚤' };

export default function PropertyCard({ property }) {
  const { id, title, city, area, rent_amount, property_type, furnished, gender_preference, primary_image, avg_rating, review_count, provider_name } = property;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src={primary_image ? `http://localhost:5000${primary_image}` : '/placeholder-property.jpg'}
          alt={title}
          className="property-img"
          style={{ transition: 'transform 0.3s ease' }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        />
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
          <span className="badge badge-primary">{TYPE_LABELS[property_type] || property_type}</span>
          {furnished && <span className="badge badge-success">Furnished</span>}
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <span style={{ background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: 12, padding: '3px 8px', borderRadius: 20 }}>
            {GENDER_ICONS[gender_preference]} {gender_preference}
          </span>
        </div>
      </div>

      <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-800)', lineHeight: 1.4, marginBottom: 4 }}>{title}</h3>
          <p style={{ fontSize: 13, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 4 }}>
            📍 {area ? `${area}, ` : ''}{city}
          </p>
        </div>

        {avg_rating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: 'var(--accent)', fontSize: 13 }}>★</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{Number(avg_rating).toFixed(1)}</span>
            <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>({review_count})</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--gray-100)' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary)' }}>
              ৳{Number(rent_amount).toLocaleString()}
            </span>
            <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>/month</span>
          </div>
          <Link to={`/properties/${id}`} className="btn btn-primary btn-sm">View Details</Link>
        </div>
      </div>
    </div>
  );
}
