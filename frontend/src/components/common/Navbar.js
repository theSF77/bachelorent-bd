import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { label: 'Properties', path: '/properties', roles: ['all'] },
  { label: 'Jobs', path: '/jobs', roles: ['all'] },
  { label: 'My Listings', path: '/dashboard/provider', roles: ['provider'] },
  { label: 'Post Job', path: '/dashboard/employer', roles: ['employer'] },
  { label: 'My Applications', path: '/dashboard/tenant', roles: ['tenant'] },
  { label: 'Admin Panel', path: '/admin', roles: ['admin'] },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };
  const visibleLinks = NAV_LINKS.filter(l => l.roles.includes('all') || (user && l.roles.includes(user.role)));

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 900,
      height: 'var(--nav-height)', background: 'var(--white)',
      borderBottom: '1px solid var(--gray-200)', display: 'flex',
      alignItems: 'center', padding: '0 1.5rem', gap: '2rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{
          width: 34, height: 34, background: 'var(--primary)',
          borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-display)'
        }}>B</div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-800)' }}>
          Bachelor<span style={{ color: 'var(--primary)' }}>ent</span>
        </span>
      </Link>

      {/* Desktop nav links */}
      <div style={{ display: 'flex', gap: '0.25rem', flex: 1 }}>
        {visibleLinks.map(link => (
          <Link key={link.path} to={link.path} style={{
            padding: '6px 14px', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 500,
            color: pathname.startsWith(link.path) ? 'var(--primary)' : 'var(--gray-600)',
            background: pathname.startsWith(link.path) ? 'var(--primary-bg)' : 'transparent',
            transition: 'var(--transition)'
          }}>{link.label}</Link>
        ))}
      </div>

      {/* Auth area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        {user ? (
          <>
            <Link to="/profile" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 12px', borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--gray-200)', fontSize: 14, color: 'var(--gray-700)'
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 600
              }}>{user.name?.charAt(0).toUpperCase()}</div>
              <span>{user.name?.split(' ')[0]}</span>
            </Link>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
