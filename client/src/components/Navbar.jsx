import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onToggleSidebar, onQuickAdd, activePage }) {
  const { user, logout } = useAuth();

  const getPageTitle = (page) => {
    switch (page) {
      case 'dashboard':
        return 'Financial Overview';
      case 'transactions':
        return 'All Transactions';
      case 'budgets':
        return 'Monthly Budgets';
      case 'reports':
        return 'Analytics & Reports';
      case 'profile':
        return 'Profile & Account Settings';
      default:
        return 'SmartSpend';
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="menu-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="page-title">{getPageTitle(activePage)}</h1>
      </div>

      <div className="topbar-right">
        {onQuickAdd && (
          <button className="btn btn-primary btn-sm" onClick={onQuickAdd} id="quick-add-transaction-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="btn-text-full">Add Transaction</span>
            <span className="btn-text-short">Add</span>
          </button>
        )}

        <button
          className="btn btn-outline btn-sm"
          onClick={logout}
          title="Sign out of SmartSpend"
          id="navbar-logout-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}
