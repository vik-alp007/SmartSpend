import React, { useState, useEffect } from 'react';
import { transactionsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TransactionTable from '../components/TransactionTable';
import TransactionForm from '../components/TransactionForm';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorMessage from '../components/ErrorMessage';

const CATEGORIES = [
  'All',
  'Groceries',
  'Dining Out',
  'Bills',
  'Rent',
  'Travel',
  'Shopping',
  'Health',
  'Education',
  'Entertainment',
  'Salary',
  'Freelancing',
  'Investments',
  'Refund',
  'Gift',
  'Other'
];

export default function TransactionsPage() {
  const { user, triggerDashboardRefresh } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalRecords: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search state
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('transactionDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Form modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError('');

      const params = {
        page: currentPage,
        limit: 10,
        search,
        type,
        category: category !== 'All' ? category : '',
        startDate,
        endDate,
        sortBy,
        sortOrder
      };

      const res = await transactionsApi.getAll(params);
      if (res.success) {
        setTransactions(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, search, type, category, startDate, endDate, sortBy, sortOrder]);

  const handleClearFilters = () => {
    setSearch('');
    setType('');
    setCategory('All');
    setStartDate('');
    setEndDate('');
    setSortBy('transactionDate');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const handleCreateOrUpdate = async (formData) => {
    if (editingTransaction) {
      await transactionsApi.update(editingTransaction._id, formData);
      // [BUG-INT-05] If competition mode is on, triggerDashboardRefresh(true) skips refreshing dashboard summary!
      triggerDashboardRefresh(true);
    } else {
      await transactionsApi.create(formData);
      triggerDashboardRefresh(false);
    }
    setEditingTransaction(null);
    fetchTransactions();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await transactionsApi.delete(deleteTarget._id);
      setDeleteTarget(null);
      triggerDashboardRefresh(false);
      fetchTransactions();
    } catch (err) {
      setError(err.message || 'Failed to delete transaction');
    } finally {
      setIsDeleting(false);
    }
  };

  const hasActiveFilters = Boolean(
    search.trim() || type || category !== 'All' || startDate || endDate || sortBy !== 'transactionDate'
  );

  const currency = user?.currency || 'INR';

  return (
    <div className="page-content">
      {error && <ErrorMessage message={error} onDismiss={() => setError('')} retryAction={fetchTransactions} />}

      {/* Header */}
      <div className="page-header-row">
        <div>
          <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 700, color: '#0f172a' }}>
            Transactions
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '2px' }}>
            View, search, filter, and organize all your income and expenses.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingTransaction(null);
            setIsFormOpen(true);
          }}
          id="transactions-add-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Record Transaction</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="content-card" style={{ marginBottom: '24px' }}>
        <div className="filters-bar" style={{ marginBottom: '16px' }}>
          {/* Search */}
          <div className="search-input-wrapper">
            <span className="search-icon-inside">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              id="tx-search-input"
              type="text"
              className="form-input search-input-inside"
              placeholder="Search by title (e.g. Swiggy, Salary)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Type Filter */}
          <select
            id="tx-type-filter"
            className="form-select"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>

          {/* Category Filter */}
          <select
            id="tx-category-filter"
            className="form-select"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setCurrentPage(1);
            }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          {/* Sort Control */}
          <select
            id="tx-sort-by"
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="transactionDate">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="title">Sort by Title</option>
          </select>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            title="Toggle sort direction"
            id="tx-sort-order-toggle"
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>
        </div>

        {/* Date Range Sub-Bar */}
        <div className="date-range-bar">
          <span style={{ color: '#64748b', fontWeight: 500 }}>Date Range:</span>
          <input
            id="tx-start-date"
            type="date"
            className="form-input"
            style={{ width: 'auto', padding: '6px 10px', fontSize: '0.85rem' }}
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setCurrentPage(1);
            }}
          />
          <span style={{ color: '#94a3b8' }}>to</span>
          <input
            id="tx-end-date"
            type="date"
            className="form-input"
            style={{ width: 'auto', padding: '6px 10px', fontSize: '0.85rem' }}
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setCurrentPage(1);
            }}
          />

          {hasActiveFilters && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleClearFilters}
              style={{ marginLeft: 'auto' }}
              id="tx-clear-filters-btn"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Transaction Table */}
      <div className="content-card" style={{ padding: '0', overflow: 'hidden' }}>
        <TransactionTable
          transactions={transactions}
          isLoading={isLoading}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
          currency={currency}
          onEdit={(tx) => {
            setEditingTransaction(tx);
            setIsFormOpen(true);
          }}
          onDelete={(tx) => setDeleteTarget(tx)}
        />

        {/* Pagination Controls */}
        <div className="pagination" style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0' }}>
          <div>
            Showing <span style={{ fontWeight: 600 }}>{transactions.length}</span> of{' '}
            <span style={{ fontWeight: 600 }}>{pagination.totalRecords}</span> entries
          </div>

          <div className="pagination-controls">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isLoading}
              id="pagination-prev-btn"
            >
              ← Previous
            </button>
            <span style={{ padding: '0 8px', fontWeight: 500 }}>
              Page {currentPage} of {pagination.totalPages || 1}
            </span>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={currentPage >= pagination.totalPages || isLoading}
              id="pagination-next-btn"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Add / Edit Modal */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingTransaction}
        currency={currency}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Transaction"
        message={`Are you sure you want to delete "${deleteTarget?.title}" for ${deleteTarget ? (deleteTarget.type === 'income' ? '+' : '-') + '₹' + deleteTarget.amount : ''}?`}
        confirmText="Delete Transaction"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
