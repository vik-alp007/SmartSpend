import React from 'react';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

export default function BudgetCard({ budget, onEdit, onDelete, currency = 'INR' }) {
  const { clientConfig } = useAuth();
  const { category, monthlyLimit, spent, remaining, utilizationPercentage, isOverBudget } = budget;

  // Calculate visual progress bar width
  let progressWidth = utilizationPercentage;
  let statusClass = 'safe';

  if (isOverBudget) {
    statusClass = 'danger';
    if (clientConfig.bugChallengeMode) {
      // [BUG-INT-02] When over budget, calculates width based on surplus instead of clamping at 100%
      progressWidth = Math.max(5, ((spent - monthlyLimit) / monthlyLimit) * 100);
      progressWidth = Math.min(progressWidth, 100);
    } else {
      // Corrected: Clamp to 100% full width
      progressWidth = 100;
    }
  } else if (utilizationPercentage > 85) {
    statusClass = 'warning';
    progressWidth = Math.min(utilizationPercentage, 100);
  } else {
    progressWidth = Math.min(utilizationPercentage, 100);
  }

  return (
    <div className={`budget-card ${isOverBudget ? 'over-budget' : ''}`} id={`budget-card-${budget.id || budget._id}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{category}</span>
            {isOverBudget && <span className="badge badge-danger">Exceeded</span>}
          </h3>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
            Monthly Limit: {formatCurrency(monthlyLimit, currency)}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className="btn-icon"
            onClick={() => onEdit(budget)}
            title="Edit Budget Limit"
            aria-label="Edit budget"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            className="btn-icon"
            onClick={() => onDelete(budget)}
            title="Delete Budget"
            aria-label="Delete budget"
            style={{ color: '#ef4444' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <span style={{ fontSize: '1.35rem', fontWeight: 700 }}>
            {formatCurrency(spent, currency)}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '6px' }}>spent</span>
        </div>
        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
          {isOverBudget ? (
            <span style={{ color: '#dc2626' }}>
              Over by {formatCurrency(Math.abs(remaining), currency)}
            </span>
          ) : (
            <span style={{ color: '#059669' }}>
              {formatCurrency(remaining, currency)} left
            </span>
          )}
        </div>
      </div>

      <div>
        <div className="progress-track">
          <div
            className={`progress-fill ${statusClass}`}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
          <span>Utilization: {formatPercentage(utilizationPercentage)}</span>
          <span>{isOverBudget ? 'Budget Exceeded' : `${formatPercentage(100 - utilizationPercentage)} remaining`}</span>
        </div>
      </div>
    </div>
  );
}
