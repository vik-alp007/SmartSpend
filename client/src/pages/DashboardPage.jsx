import React, { useState, useEffect } from 'react';
import { dashboardApi, budgetsApi, transactionsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import { MonthlyBarChart, CategoryDonutChart } from '../components/ExpenseChart';
import TransactionTable from '../components/TransactionTable';
import TransactionForm from '../components/TransactionForm';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingState from '../components/LoadingState';
import ErrorMessage from '../components/ErrorMessage';

export default function DashboardPage({ onNavigate }) {
  const { user, dashboardKey, triggerDashboardRefresh } = useAuth();
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Transaction form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [summaryRes, chartsRes, budgetsRes] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getCharts(),
        budgetsApi.getAll()
      ]);

      if (summaryRes.success) setSummary(summaryRes.data);
      if (chartsRes.success) setCharts(chartsRes.data);
      if (budgetsRes.success) setBudgets(budgetsRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dashboardKey]);

  const handleCreateOrUpdate = async (formData) => {
    if (editingTransaction) {
      await transactionsApi.update(editingTransaction._id, formData);
      // Notice: triggerDashboardRefresh(true) tells AuthContext it's from an edit
      triggerDashboardRefresh(true);
    } else {
      await transactionsApi.create(formData);
      triggerDashboardRefresh(false);
    }
    setEditingTransaction(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await transactionsApi.delete(deleteTarget._id);
      setDeleteTarget(null);
      triggerDashboardRefresh(false);
    } catch (err) {
      setError(err.message || 'Failed to delete transaction');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading && !summary) {
    return <LoadingState message="Loading your financial dashboard..." />;
  }

  const currency = user?.currency || 'INR';

  return (
    <div className="page-content">
      {error && <ErrorMessage message={error} onDismiss={() => setError('')} retryAction={fetchDashboardData} />}

      {/* Top Banner / Welcome */}
      <div className="page-header-row">
        <div>
          <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 700, color: '#0f172a' }}>
            Welcome back, {user?.name || 'Explorer'}!
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '2px' }}>
            Here is your financial health overview for this month.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingTransaction(null);
            setIsFormOpen(true);
          }}
          id="dashboard-new-tx-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Primary KPI Metrics */}
      <div className="stats-grid">
        <StatCard
          id="card-total-balance"
          title="Total Net Balance"
          amount={summary?.totalBalance || 0}
          type="neutral"
          subtitle="All-time Net Cash Flow"
          currency={currency}
        />
        <StatCard
          id="card-month-income"
          title="Current Month Income"
          amount={summary?.currentMonthIncome || 0}
          type="income"
          subtitle="Total inflows this month"
          currency={currency}
        />
        <StatCard
          id="card-month-expenses"
          title="Current Month Expenses"
          amount={summary?.currentMonthExpenses || 0}
          type="expense"
          subtitle="Total outflows this month"
          currency={currency}
        />
        <StatCard
          id="card-month-savings"
          title="Current Month Savings"
          amount={summary?.currentMonthSavings || 0}
          type="savings"
          subtitle="Net savings this month"
          currency={currency}
        />
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="content-card">
          <div className="card-header-flex">
            <div>
              <h3 className="card-title">Income vs. Expenses</h3>
              <div className="card-subtitle">Monthly cash flow history over the last 6 months</div>
            </div>
          </div>
          <MonthlyBarChart data={charts?.monthlyHistory || []} currency={currency} />
        </div>

        <div className="content-card">
          <div className="card-header-flex">
            <div>
              <h3 className="card-title">Category Spending</h3>
              <div className="card-subtitle">Current month expense distribution</div>
            </div>
          </div>
          <CategoryDonutChart categories={charts?.categories || []} currency={currency} />
        </div>
      </div>

      {/* Recent Transactions & Budget Overview */}
      <div className="dashboard-split">
        {/* Recent Transactions */}
        <div className="content-card">
          <div className="card-header-flex">
            <div>
              <h3 className="card-title">Recent Transactions</h3>
              <div className="card-subtitle">Your latest logged financial activity</div>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => onNavigate('transactions')}
              id="dashboard-view-all-tx-btn"
            >
              View All
            </button>
          </div>

          <TransactionTable
            transactions={summary?.recentTransactions || []}
            isLoading={false}
            currency={currency}
            onEdit={(tx) => {
              setEditingTransaction(tx);
              setIsFormOpen(true);
            }}
            onDelete={(tx) => setDeleteTarget(tx)}
          />
        </div>

        {/* Budget Progress Snapshot */}
        <div className="content-card">
          <div className="card-header-flex">
            <div>
              <h3 className="card-title">Monthly Budgets</h3>
              <div className="card-subtitle">Active category spending limits</div>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => onNavigate('budgets')}
              id="dashboard-view-all-budgets-btn"
            >
              Manage
            </button>
          </div>

          {budgets.length === 0 ? (
            <div style={{ padding: '30px 10px', textAlign: 'center', color: '#94a3b8' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}>No monthly budgets defined yet.</p>
              <button className="btn btn-primary btn-sm" onClick={() => onNavigate('budgets')}>
                + Set Budget
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {budgets.slice(0, 4).map((b) => (
                <div key={b.id || b._id} style={{ fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>{b.category}</span>
                    <span>
                      ₹{b.spent.toLocaleString()} / ₹{b.monthlyLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className={`progress-fill ${b.isOverBudget ? 'danger' : b.utilizationPercentage > 85 ? 'warning' : 'safe'}`}
                      style={{ width: `${Math.min(100, b.utilizationPercentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Modal */}
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
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This will update your balances immediately.`}
        confirmText="Delete"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
