import React from 'react';

export default function NotFoundPage({ onNavigate }) {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '32px'
      }}
    >
      <div
        style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '5rem',
          fontWeight: 800,
          color: '#e2e8f0',
          lineHeight: 1
        }}
      >
        404
      </div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '16px 0 8px' }}>
        Page Not Found
      </h2>
      <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '420px', marginBottom: '24px' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <button className="btn btn-primary" onClick={() => onNavigate('dashboard')} id="notfound-home-btn">
        Return to Dashboard
      </button>
    </div>
  );
}
