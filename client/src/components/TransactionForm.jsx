import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const DEFAULT_EXPENSE_CATEGORIES = [
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

const DEFAULT_INCOME_CATEGORIES = [
  'Salary',
  'Freelancing',
  'Investments',
  'Refund',
  'Gift',
  'Other'
];

export default function TransactionForm({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  currency = 'INR'
}) {
  const { clientConfig } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    type: 'expense',
    amount: '',
    category: 'Groceries',
    transactionDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI',
    notes: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        type: initialData.type || 'expense',
        amount: initialData.amount !== undefined ? initialData.amount : '',
        category: initialData.category || (initialData.type === 'income' ? 'Salary' : 'Groceries'),
        transactionDate: initialData.transactionDate
          ? new Date(initialData.transactionDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        paymentMethod: initialData.paymentMethod || 'UPI',
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        title: '',
        type: 'expense',
        amount: '',
        category: 'Groceries',
        transactionDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'UPI',
        notes: ''
      });
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleTypeChange = (newType) => {
    setFormData((prev) => ({
      ...prev,
      type: newType,
      category: newType === 'income' ? 'Salary' : 'Groceries'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Please provide a title for the transaction.');
      return;
    }

    const numAmount = parseFloat(formData.amount);

    if (clientConfig.bugChallengeMode) {
      // [BUG-BEG-03] Competition mode allows amount = 0
      if (isNaN(numAmount) || numAmount < 0) {
        setError('Please enter a valid amount.');
        return;
      }
    } else {
      // Corrected: Strict check > 0
      if (isNaN(numAmount) || numAmount <= 0) {
        setError('Amount must be greater than 0.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        ...formData,
        amount: numAmount
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories =
    formData.type === 'income' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {initialData ? 'Edit Transaction' : 'Record New Transaction'}
          </h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}

            {/* Type selector */}
            <div className="form-group">
              <label className="form-label">Transaction Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  className={`btn ${formData.type === 'expense' ? 'btn-danger' : 'btn-outline'}`}
                  onClick={() => handleTypeChange('expense')}
                >
                  Expense
                </button>
                <button
                  type="button"
                  className={`btn ${formData.type === 'income' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => handleTypeChange('income')}
                >
                  Income
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="tx-title">Title / Description</label>
              <input
                id="tx-title"
                type="text"
                className="form-input"
                placeholder="e.g. Swiggy food delivery, October Salary"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Amount & Currency */}
            <div className="form-group">
              <label className="form-label" htmlFor="tx-amount">Amount (₹)</label>
              <input
                id="tx-amount"
                type="number"
                step="0.01"
                className="form-input"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            {/* Category & Payment Method */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="tx-category">Category</label>
                <select
                  id="tx-category"
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="tx-payment">Payment Method</label>
                <select
                  id="tx-payment"
                  className="form-select"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                >
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Cash">Cash</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="tx-date">Transaction Date</label>
              <input
                id="tx-date"
                type="date"
                className="form-input"
                value={formData.transactionDate}
                onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                required
              />
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label" htmlFor="tx-notes">Optional Notes</label>
              <textarea
                id="tx-notes"
                className="form-textarea"
                placeholder="Add any extra reference notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting} id="tx-save-btn">
              {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
