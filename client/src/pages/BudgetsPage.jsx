import React, { useState, useEffect } from 'react';
import { budgetsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BudgetCard from '../components/BudgetCard';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingState from '../components/LoadingState';
import ErrorMessage from '../components/ErrorMessage';

const DEFAULT_BUDGET_CATEGORIES = [
  'Groceries',
  'Dining Out',
  'Bills',
  'Rent',
  'Travel',
  'Shopping',
  'Health',
  'Education',
  'Entertainment',
  'Other'
];

export default function BudgetsPage() {
  const { user } = useAuth();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    category: 'Groceries',
    monthlyLimit: ''
  });
  const [editLimit, setEditLimit] = useState('');

  const fetchBudgets = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await budgetsApi.getAll({ month: selectedMonth, year: selectedYear });
      if (res.success) {
        setBudgets(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load budgets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, selectedYear]);

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    const limitNum = parseFloat(formData.monthlyLimit);
    if (isNaN(limitNum) || limitNum <= 0) {
      setError('Please provide a valid monthly limit greater than 0.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await budgetsApi.create({
        category: formData.category,
        monthlyLimit: limitNum,
        month: selectedMonth,
        year: selectedYear
      });
      setIsCreateOpen(false);
      setFormData({ category: 'Groceries', monthlyLimit: '' });
      fetchBudgets();
    } catch (err) {
      setError(err.message || 'Failed to create budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBudget = async (e) => {
    e.preventDefault();
    const limitNum = parseFloat(editLimit);
    if (isNaN(limitNum) || limitNum <= 0) {
      setError('Please provide a valid monthly limit greater than 0.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await budgetsApi.update(editingBudget.id || editingBudget._id, {
        monthlyLimit: limitNum
      });
      setEditingBudget(null);
      fetchBudgets();
    } catch (err) {
      setError(err.message || 'Failed to update budget limit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsSubmitting(true);
      await budgetsApi.delete(deleteTarget.id || deleteTarget._id);
      setDeleteTarget(null);
      fetchBudgets();
    } catch (err) {
      setError(err.message || 'Failed to delete budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currency = user?.currency || 'INR';

  return (
    <div className="page-content">
      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      {/* Header & Controls */}
      <div className="page-header-row">
        <div>
          <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 700, color: '#0f172a' }}>
            Category Budgets
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '2px' }}>
            Set and track spending boundaries for {monthNames[selectedMonth - 1]} {selectedYear}.
          </p>
        </div>

        <div className="page-header-actions">
          {/* Month selector */}
          <select
            className="form-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
            id="budget-month-select"
          >
            {monthNames.map((name, idx) => (
              <option key={name} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>

          {/* Year selector */}
          <select
            className="form-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            id="budget-year-select"
          >
            {[2024, 2025, 2026, 2027].map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          <button
            className="btn btn-primary"
            onClick={() => setIsCreateOpen(true)}
            id="budget-create-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {/* Budgets Grid */}
      {isLoading ? (
        <LoadingState message="Loading monthly budget status..." />
      ) : budgets.length === 0 ? (
        <div className="content-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div className="empty-icon" style={{ margin: '0 auto 16px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
            </svg>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>
            No budgets configured for {monthNames[selectedMonth - 1]} {selectedYear}
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.925rem', maxWidth: '420px', margin: '0 auto 24px' }}>
            Setting spending targets helps you prevent overspending and reach your monthly savings goals.
          </p>
          <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
            + Create First Category Budget
          </button>
        </div>
      ) : (
        <div className="budgets-grid">
          {budgets.map((b) => (
            <BudgetCard
              key={b.id || b._id}
              budget={b}
              currency={currency}
              onEdit={(budget) => {
                setEditingBudget(budget);
                setEditLimit(budget.monthlyLimit);
              }}
              onDelete={(budget) => setDeleteTarget(budget)}
            />
          ))}
        </div>
      )}

      {/* Create Budget Modal */}
      {isCreateOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create Monthly Budget</h2>
              <button className="btn-icon" onClick={() => setIsCreateOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateBudget}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="new-budget-cat">Category</label>
                  <select
                    id="new-budget-cat"
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {DEFAULT_BUDGET_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="new-budget-limit">Monthly Spending Limit (₹)</label>
                  <input
                    id="new-budget-limit"
                    type="number"
                    step="1"
                    min="1"
                    className="form-input"
                    placeholder="e.g. 15000"
                    value={formData.monthlyLimit}
                    onChange={(e) => setFormData({ ...formData, monthlyLimit: e.target.value })}
                    required
                  />
                  <span className="form-hint">
                    Target maximum expenditure for {monthNames[selectedMonth - 1]} {selectedYear}.
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  id="submit-create-budget-btn"
                >
                  {isSubmitting ? 'Saving...' : 'Set Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Budget Limit Modal */}
      {editingBudget && (
        <div className="modal-overlay" onClick={() => setEditingBudget(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Limit: {editingBudget.category}</h2>
              <button className="btn-icon" onClick={() => setEditingBudget(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateBudget}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-budget-limit">New Monthly Spending Limit (₹)</label>
                  <input
                    id="edit-budget-limit"
                    type="number"
                    step="1"
                    min="1"
                    className="form-input"
                    value={editLimit}
                    onChange={(e) => setEditLimit(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setEditingBudget(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  id="submit-edit-budget-btn"
                >
                  {isSubmitting ? 'Saving...' : 'Update Limit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Category Budget"
        message={`Are you sure you want to remove the monthly budget for "${deleteTarget?.category}"? Your transactions will not be deleted.`}
        confirmText="Remove Budget"
        isLoading={isSubmitting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
