import React from 'react';

export default function ErrorMessage({ message, onDismiss, retryAction }) {
  if (!message) return null;

  return (
    <div className="alert alert-error" role="alert" style={{ justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>{message}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {retryAction && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={retryAction}
            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            className="btn-icon"
            onClick={onDismiss}
            aria-label="Dismiss error"
            style={{ width: '24px', height: '24px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
