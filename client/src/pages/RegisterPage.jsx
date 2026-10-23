import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage({ onNavigate }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    currency: 'INR'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.name.trim().length < 2) {
      setError('Please provide a name with at least 2 characters.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    try {
      setIsLoading(true);
      await register(formData.name.trim(), formData.email.trim(), formData.password, formData.currency);
      onNavigate('dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <div
          onClick={() => onNavigate('landing')}
          style={{
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)',
              flexShrink: 0
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
            SmartSpend
          </span>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>
          Create your account to start managing your finances today.
        </p>
      </div>

      <div className="content-card auth-card">
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '20px' }}>
          Create an Account
        </h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">Full Name</label>
            <input
              id="register-name"
              type="text"
              className="form-input"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">Email Address</label>
            <input
              id="register-email"
              type="email"
              className="form-input"
              placeholder="you@domain.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              autoComplete="email"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-confirm-password">Confirm</label>
              <input
                id="register-confirm-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-currency">Primary Currency</label>
            <select
              id="register-currency"
              className="form-select"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            >
              <option value="INR">INR (₹) - Indian Rupee (Default)</option>
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '10px' }}
            disabled={isLoading}
            id="register-submit-btn"
          >
            {isLoading ? 'Creating Account...' : 'Get Started'}
          </button>
        </form>

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              style={{ color: '#10b981', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
              id="link-to-login"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
