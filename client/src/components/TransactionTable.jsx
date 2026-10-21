import React from 'react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

export default function TransactionTable({
  transactions,
  isLoading,
  onEdit,
  onDelete,
  hasActiveFilters = false,
  onClearFilters,
  currency = 'INR'
}) {
  const { clientConfig } = useAuth();

  if (isLoading) {
    return (
      <div className="table-container">
        <div style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
          Loading transactions...
        </div>
      </div>
    );
  }

  // Handle Empty State
  if (!transactions || transactions.length === 0) {
    let emptyTitle = 'No transactions recorded yet';
    let emptyDesc = 'Start tracking your financial journey by adding your first income or expense.';

    // [BUG-BEG-04] When competition mode is active, it fails to distinguish between empty database and empty search results!
    if (!clientConfig.bugChallengeMode && hasActiveFilters) {
      emptyTitle = 'No matching transactions found';
      emptyDesc = 'We could not find any transactions matching your current search or filter criteria. Try clearing filters.';
    }

    return (
      <div className="empty-state">
        <div className="empty-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <h3 className="empty-title">{emptyTitle}</h3>
        <p className="empty-desc">{emptyDesc}</p>
        {hasActiveFilters && onClearFilters && (
          <button className="btn btn-outline btn-sm" onClick={onClearFilters}>
            Clear All Filters
          </button>
        )}
      </div>
    );
  }

  // [BUG-ADV-05] Adds class 'competition-overflow' if in competition mode to trigger tablet overflow
  const containerClass = `table-container ${clientConfig.bugChallengeMode ? 'competition-overflow' : ''}`;

  return (
    <div className={containerClass}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Title</th>
            <th>Category</th>
            <th>Payment</th>
            <th>Type</th>
            <th style={{ textAlign: 'right' }}>Amount</th>
            <th style={{ textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => {
            const isIncome = tx.type === 'income';
            return (
              <tr key={tx._id} id={`tx-row-${tx._id}`}>
                <td style={{ whiteSpace: 'nowrap' }}>{formatDate(tx.transactionDate)}</td>
                <td style={{ fontWeight: 500 }}>
                  <div>{tx.title}</div>
                  {tx.notes && (
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                      {tx.notes}
                    </div>
                  )}
                </td>
                <td>
                  <span className="badge badge-category">{tx.category}</span>
                </td>
                <td>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{tx.paymentMethod || 'UPI'}</span>
                </td>
                <td>
                  <span className={`badge ${isIncome ? 'badge-income' : 'badge-expense'}`}>
                    {isIncome ? 'Income' : 'Expense'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <span className={isIncome ? 'amount-positive' : 'amount-negative'}>
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                  </span>
                </td>
                <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }} className="table-actions-col">
                  <div style={{ display: 'inline-flex', gap: '6px' }}>
                    <button
                      className="btn-icon"
                      onClick={() => onEdit(tx)}
                      title="Edit Transaction"
                      aria-label="Edit"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => onDelete(tx)}
                      title="Delete Transaction"
                      aria-label="Delete"
                      style={{ color: '#ef4444' }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
