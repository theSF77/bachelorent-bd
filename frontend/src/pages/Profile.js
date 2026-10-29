import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileImg, setProfileImg] = useState(null);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [tab, setTab] = useState('profile');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('phone', form.phone);
      if (profileImg) fd.append('profile_image', profileImg);
      await api.put('/auth/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser({ name: form.name, phone: form.phone });
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Password too short');
    setChangingPw(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setChangingPw(false); }
  };

  const ROLE_COLORS = { tenant: 'info', provider: 'primary', employer: 'success', admin: 'danger' };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 700 }}>
        {/* Header card */}
        <div className="card card-body" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: user?.profile_image ? 'none' : 'var(--primary)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 700, flexShrink: 0, overflow: 'hidden'
          }}>
            {user?.profile_image
              ? <img src={`http://localhost:5000${user.profile_image}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>{user?.name}</h1>
            <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 6 }}>{user?.email}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className={`badge badge-${ROLE_COLORS[user?.role] || 'gray'}`} style={{ textTransform: 'capitalize' }}>{user?.role}</span>
              {user?.is_verified && <span className="badge badge-success">✓ Verified</span>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--gray-200)', marginBottom: '1.5rem' }}>
          {['profile', 'password'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: tab === t ? 600 : 400, textTransform: 'capitalize',
              color: tab === t ? 'var(--primary)' : 'var(--gray-500)',
              borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent'
            }}>
              {t === 'profile' ? '👤 Profile Info' : '🔒 Change Password'}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="card card-body">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Edit Profile</h2>
            <form onSubmit={handleProfileSave}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-control" placeholder="017XXXXXXXX" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-control" value={user?.email} disabled style={{ background: 'var(--gray-50)', color: 'var(--gray-400)' }} />
                <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>Email cannot be changed</p>
              </div>
              <div className="form-group">
                <label className="form-label">Profile Picture</label>
                <input type="file" className="form-control" accept="image/*" onChange={e => setProfileImg(e.target.files[0])} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : '💾 Save Changes'}</button>
            </form>
          </div>
        )}

        {tab === 'password' && (
          <div className="card card-body">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Change Password</h2>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-control" placeholder="••••••••" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="form-control" placeholder="Min 6 characters" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} required minLength={6} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-control" placeholder="Repeat new password" value={pwForm.confirmPassword} onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={changingPw}>{changingPw ? 'Updating...' : '🔒 Update Password'}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
