import React, { useState, useEffect } from 'react';
import { reportsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import LoadingState from '../components/LoadingState';
import ErrorMessage from '../components/ErrorMessage';

export default function ReportsPage() {
  const { user, dashboardKey } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await reportsApi.getMonthly({ month, year });
      if (res.success) {
        setReport(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load financial report');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [month, year, dashboardKey]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleExportCSV = () => {
    if (!report || !report.categories) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `SmartSpend Monthly Report: ${monthNames[month - 1]} ${year}\r\n\r\n`;
    csvContent += 'Category,Transaction Count,Total Amount (INR),Percentage of Expenses\r\n';

    report.categories.forEach((c) => {
      csvContent += `"${c.category}",${c.count},${c.amount},${c.percentage}%\r\n`;
    });

    csvContent += `\r\nTotal Income,,${report.summary.totalIncome},\r\n`;
    csvContent += `Total Expenses,,${report.summary.totalExpenses},\r\n`;
    csvContent += `Net Savings,,${report.summary.savings},\r\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SmartSpend_Report_${monthNames[month - 1]}_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currency = user?.currency || 'INR';
  const summary = report?.summary;

  return (
    <div className="page-content">
      {error && <ErrorMessage message={error} onDismiss={() => setError('')} retryAction={fetchReport} />}

      {/* Header and Period Controls */}
      <div className="page-header-row">
        <div>
          <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 700, color: '#0f172a' }}>
            Financial Reports & Analytics
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '2px' }}>
            Detailed breakdown for {monthNames[month - 1]} {year}.
          </p>
        </div>

        <div className="page-header-actions">
          <select
            className="form-select"
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
            id="report-month-select"
          >
            {monthNames.map((name, idx) => (
              <option key={name} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
            id="report-year-select"
          >
            {[2024, 2025, 2026, 2027].map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          <button
            className="btn btn-outline"
            onClick={handleExportCSV}
            disabled={isLoading || !report}
            id="report-export-csv-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Generating monthly analytics report..." />
      ) : (
        <>
          {/* Summary KPI Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div>
                <div className="stat-label">Total Month Income</div>
                <div className="stat-value" style={{ color: '#059669' }}>
                  {formatCurrency(summary?.totalIncome || 0, currency)}
                </div>
                <div className="card-subtitle">{summary?.incomeCount || 0} income entries</div>
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">Total Month Expenses</div>
                <div className="stat-value" style={{ color: '#dc2626' }} id="report-grand-total-expenses">
                  {formatCurrency(summary?.totalExpenses || 0, currency)}
                </div>
                <div className="card-subtitle">{summary?.expenseCount || 0} expense entries</div>
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">Net Monthly Savings</div>
                <div className="stat-value">
                  {formatCurrency(summary?.savings || 0, currency)}
                </div>
                <div className="card-subtitle">
                  Savings Rate: {formatPercentage(summary?.savingsRate || 0)}
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">Total Transactions</div>
                <div className="stat-value">{summary?.totalTransactions || 0}</div>
                <div className="card-subtitle">Logged in period</div>
              </div>
            </div>
          </div>

          {/* Daily Cash Flow Trends */}
          <div className="content-card" style={{ marginBottom: '28px' }}>
            <div className="card-header-flex">
              <div>
                <h3 className="card-title">Daily Cash Flow Trends</h3>
                <div className="card-subtitle">Day-by-day income and expense distribution</div>
              </div>
            </div>

            {report?.dailyTrends && report.dailyTrends.length > 0 ? (
              <div style={{ width: '100%', overflowX: 'auto' }}>
                <svg viewBox="0 0 700 160" style={{ width: '100%', minWidth: '600px', height: 'auto' }}>
                  {report.dailyTrends.map((d, idx) => {
                    const maxDaily = Math.max(
                      ...report.dailyTrends.map((t) => Math.max(t.income, t.expense)),
                      1000
                    );
                    const barW = 8;
                    const x = 30 + idx * 21;
                    const incH = (d.income / maxDaily) * 110;
                    const expH = (d.expense / maxDaily) * 110;

                    return (
                      <g key={d.day}>
                        {d.income > 0 && (
                          <rect
                            x={x}
                            y={130 - incH}
                            width={barW}
                            height={Math.max(2, incH)}
                            fill="#10b981"
                            rx="2"
                          />
                        )}
                        {d.expense > 0 && (
                          <rect
                            x={x + barW + 1}
                            y={130 - expH}
                            width={barW}
                            height={Math.max(2, expH)}
                            fill="#ef4444"
                            rx="2"
                          />
                        )}
                        {d.day % 5 === 1 && (
                          <text x={x + barW} y={148} fill="#94a3b8" fontSize="9" textAnchor="middle">
                            {d.day}
                          </text>
                        )}
                      </g>
                    );
                  })}
                  <line x1="20" y1="130" x2="680" y2="130" stroke="#e2e8f0" strokeWidth="1" />
                </svg>
              </div>
            ) : (
              <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                No daily trends recorded for this period.
              </div>
            )}
          </div>

          {/* Category Breakdown Table */}
          <div className="content-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 className="card-title">Expense Category Breakdown</h3>
              <div className="card-subtitle">Detailed categorization and percentage share</div>
            </div>

            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th style={{ textAlign: 'center' }}>Transactions</th>
                    <th style={{ textAlign: 'right' }}>Total Spent</th>
                    <th style={{ textAlign: 'right' }}>% of Expenses</th>
                  </tr>
                </thead>
                <tbody>
                  {report?.categories && report.categories.length > 0 ? (
                    report.categories.map((c) => (
                      <tr key={c.category}>
                        <td style={{ fontWeight: 600 }}>{c.category}</td>
                        <td style={{ textAlign: 'center' }}>{c.count}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#dc2626' }} className="category-amount-cell">
                          {formatCurrency(c.amount, currency)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="badge badge-category">{c.percentage}%</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                        No categorized expense records found for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
