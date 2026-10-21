import React, { useState, useEffect } from 'react';
import { profileApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatters';
import ErrorMessage from '../components/ErrorMessage';

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState({ text: '', type: '' });
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCurrency(user.currency || 'INR');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', type: '' });

    if (!name.trim()) {
      setProfileMsg({ text: 'Name cannot be empty.', type: 'error' });
      return;
    }

    try {
      setIsUpdatingProfile(true);
      const res = await profileApi.update({ name, currency });
      if (res.success && res.data) {
        setUser((prev) => ({ ...prev, ...res.data }));
        setProfileMsg({ text: 'Profile preferences updated successfully!', type: 'success' });
      }
    } catch (err) {
      setProfileMsg({ text: err.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg({ text: '', type: '' });

    if (newPassword.length < 6) {
      setPwdMsg({ text: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    try {
      setIsChangingPwd(true);
      const res = await profileApi.changePassword({ currentPassword, newPassword });
      if (res.success) {
        setPwdMsg({ text: 'Password changed successfully!', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPwdMsg({ text: err.message || 'Failed to change password.', type: 'error' });
    } finally {
      setIsChangingPwd(false);
    }
  };

  return (
    <div className="page-content" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
          Account Settings
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '2px' }}>
          Manage your personal details, preferred currency, and security credentials.
        </p>
      </div>

      {/* Profile Details Card */}
      <div className="content-card" style={{ marginBottom: '28px' }}>
        <h3 className="card-title" style={{ marginBottom: '16px' }}>Profile Details</h3>

        {profileMsg.text && (
          <div className={`alert ${profileMsg.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {profileMsg.text}
          </div>
        )}

        <form onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label className="form-label" htmlFor="profile-name">Full Name</label>
            <input
              id="profile-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profile-email">Email Address</label>
            <input
              id="profile-email"
              type="email"
              className="form-input"
              value={user?.email || ''}
              disabled
              style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }}
            />
            <span className="form-hint">Email address cannot be modified once registered.</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profile-currency">Display Currency</label>
            <select
              id="profile-currency"
              className="form-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="INR">INR (₹) - Indian Rupee (Default)</option>
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isUpdatingProfile}
            id="profile-save-btn"
          >
            {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="content-card" style={{ marginBottom: '28px' }}>
        <h3 className="card-title" style={{ marginBottom: '16px' }}>Security & Password</h3>

        {pwdMsg.text && (
          <div className={`alert ${pwdMsg.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {pwdMsg.text}
          </div>
        )}

        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label className="form-label" htmlFor="current-pwd">Current Password</label>
            <input
              id="current-pwd"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="new-pwd">New Password</label>
              <input
                id="new-pwd"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm-pwd">Confirm New Password</label>
              <input
                id="confirm-pwd"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isChangingPwd}
            id="change-pwd-btn"
          >
            {isChangingPwd ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Account Info & Logout */}
      <div className="content-card">
        <h3 className="card-title" style={{ marginBottom: '12px' }}>Account Information</h3>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '20px' }}>
          Member since: <strong style={{ color: '#0f172a' }}>{formatDate(user?.createdAt)}</strong>
        </p>

        <button
          className="btn btn-danger-outline"
          onClick={logout}
          id="profile-logout-btn"
        >
          Sign Out of SmartSpend
        </button>
      </div>
    </div>
  );
}
