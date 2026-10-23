import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    try {
      setIsLoading(true);
      await login(email.trim(), password);
      onNavigate('dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@smartspend.io');
    setPassword('SmartSpend2026!');
    setError('');
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
          Welcome back. Enter your credentials to access your dashboard.
        </p>
      </div>

      <div className="content-card auth-card">
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '20px' }}>
          Sign In
        </h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={isLoading}
            id="login-submit-btn"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleFillDemo}
            style={{ width: '100%', marginBottom: '16px' }}
            id="login-demo-btn"
          >
            Use Demo Organizer Credentials
          </button>

          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('register')}
              style={{ color: '#10b981', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
              id="link-to-register"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
