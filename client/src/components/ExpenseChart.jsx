import React, { useState } from 'react';
import { formatCurrency } from '../utils/formatters';

const CATEGORY_COLORS = [
  '#10b981', // emerald
  '#6366f1', // indigo
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#8b5cf6', // purple
  '#f97316', // orange
  '#14b8a6', // teal
  '#64748b'  // slate
];

export function MonthlyBarChart({ data = [], currency = 'INR' }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
        No historical transaction data available yet.
      </div>
    );
  }

  // Find maximum value for scaling
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.income || 0, d.expense || 0)),
    1000
  );

  const chartHeight = 220;
  const chartWidth = 560;
  const paddingX = 40;
  const paddingBottom = 30;
  const paddingTop = 20;
  const usableHeight = chartHeight - paddingBottom - paddingTop;
  const usableWidth = chartWidth - paddingX * 2;
  const groupWidth = usableWidth / data.length;
  const barWidth = Math.min(22, groupWidth * 0.32);

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'flex-end', marginBottom: '12px', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#10b981' }} />
          <span>Income</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#ef4444' }} />
          <span>Expense</span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
      >
        {/* Horizontal gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
          const y = chartHeight - paddingBottom - pct * usableHeight;
          return (
            <g key={idx}>
              <line
                x1={paddingX}
                y1={y}
                x2={chartWidth - paddingX}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="1"
                strokeDasharray={pct > 0 ? '4 4' : 'none'}
              />
              <text
                x={paddingX - 6}
                y={y + 3}
                fill="#94a3b8"
                fontSize="9"
                textAnchor="end"
              >
                {Math.round((maxVal * pct) / 1000)}k
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, idx) => {
          const groupCenterX = paddingX + idx * groupWidth + groupWidth / 2;
          const incomeHeight = ((item.income || 0) / maxVal) * usableHeight;
          const expenseHeight = ((item.expense || 0) / maxVal) * usableHeight;

          const incomeX = groupCenterX - barWidth - 2;
          const expenseX = groupCenterX + 2;

          const incomeY = chartHeight - paddingBottom - incomeHeight;
          const expenseY = chartHeight - paddingBottom - expenseHeight;

          const isHovered = hoveredIndex === idx;

          return (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Income bar */}
              <rect
                x={incomeX}
                y={incomeY}
                width={barWidth}
                height={Math.max(2, incomeHeight)}
                rx="3"
                fill="#10b981"
                opacity={isHovered ? 1 : 0.85}
              />
              {/* Expense bar */}
              <rect
                x={expenseX}
                y={expenseY}
                width={barWidth}
                height={Math.max(2, expenseHeight)}
                rx="3"
                fill="#ef4444"
                opacity={isHovered ? 1 : 0.85}
              />
              {/* Month label */}
              <text
                x={groupCenterX}
                y={chartHeight - 10}
                fill="#64748b"
                fontSize="10"
                textAnchor="middle"
                fontWeight={isHovered ? '600' : '400'}
              >
                {item.month.split(' ')[0]}
              </text>

              {/* Tooltip on hover */}
              {isHovered && (
                <g>
                  <rect
                    x={groupCenterX - 65}
                    y={Math.min(incomeY, expenseY) - 46}
                    width="130"
                    height="38"
                    rx="6"
                    fill="#0f172a"
                    opacity="0.95"
                  />
                  <text
                    x={groupCenterX}
                    y={Math.min(incomeY, expenseY) - 30}
                    fill="#10b981"
                    fontSize="9"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    Inc: {formatCurrency(item.income, currency)}
                  </text>
                  <text
                    x={groupCenterX}
                    y={Math.min(incomeY, expenseY) - 16}
                    fill="#f87171"
                    fontSize="9"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    Exp: {formatCurrency(item.expense, currency)}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function CategoryDonutChart({ categories = [], currency = 'INR' }) {
  if (!categories || categories.length === 0) {
    return (
      <div style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
        No category expense data recorded for this period.
      </div>
    );
  }

  const totalExpense = categories.reduce((sum, c) => sum + (c.amount || c.totalAmount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Category progress rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {categories.slice(0, 6).map((item, idx) => {
          const amount = item.amount || item.totalAmount || 0;
          const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
          const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

          return (
            <div key={item.category || item._id} style={{ fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '2px',
                      backgroundColor: color
                    }}
                  />
                  <span>{item.category || item._id}</span>
                </span>
                <span style={{ fontWeight: 600 }}>
                  {formatCurrency(amount, currency)}
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginLeft: '6px' }}>
                    ({percentage.toFixed(1)}%)
                  </span>
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: color,
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
        <span style={{ color: '#64748b' }}>Total Category Spending</span>
        <span style={{ fontWeight: 700 }}>{formatCurrency(totalExpense, currency)}</span>
      </div>
    </div>
  );
}
