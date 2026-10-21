import React from 'react';
import { formatCurrency } from '../utils/formatters';

export default function StatCard({ title, amount, type = 'neutral', subtitle, currency = 'INR', id }) {
  const getIcon = () => {
    switch (type) {
      case 'income':
        return (
          <div className="stat-icon emerald">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </div>
        );
      case 'expense':
        return (
          <div className="stat-icon rose">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          </div>
        );
      case 'savings':
        return (
          <div className="stat-icon indigo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="stat-icon amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="stat-card" id={id}>
      <div>
        <div className="stat-label">{title}</div>
        <div className="stat-value">{formatCurrency(amount, currency)}</div>
        {subtitle && <div className="card-subtitle">{subtitle}</div>}
      </div>
      {getIcon()}
    </div>
  );
}
