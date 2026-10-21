import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import TransactionForm from './components/TransactionForm';
import LoadingState from './components/LoadingState';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import BudgetsPage from './pages/BudgetsPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// API
import { transactionsApi } from './services/api';

export default function App() {
  const { user, loading, triggerDashboardRefresh } = useAuth();
  const [currentPage, setCurrentPage] = useState('landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGlobalAddOpen, setIsGlobalAddOpen] = useState(false);

  // Sync route with URL path
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '') || 'landing';
      setCurrentPage(path);
    };

    const initialPath = window.location.pathname.replace(/^\//, '');
    if (initialPath) {
      setCurrentPage(initialPath);
    } else if (user) {
      setCurrentPage('dashboard');
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user]);

  // If user state changes and on auth pages, redirect to dashboard
  useEffect(() => {
    if (user && (currentPage === 'landing' || currentPage === 'login' || currentPage === 'register')) {
      navigate('dashboard');
    } else if (!user && (currentPage === 'dashboard' || currentPage === 'transactions' || currentPage === 'budgets' || currentPage === 'reports' || currentPage === 'profile')) {
      navigate('login');
    }
  }, [user]);

  const navigate = (page) => {
    setCurrentPage(page);
    window.history.pushState({}, '', `/${page === 'landing' ? '' : page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGlobalCreateTx = async (formData) => {
    await transactionsApi.create(formData);
    triggerDashboardRefresh(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <LoadingState message="Initializing SmartSpend..." />
      </div>
    );
  }

  // Public unauthenticated routes
  if (!user) {
    if (currentPage === 'login') {
      return <LoginPage onNavigate={navigate} />;
    }
    if (currentPage === 'register') {
      return <RegisterPage onNavigate={navigate} />;
    }
    return <LandingPage onNavigate={navigate} />;
  }

  // Authenticated Dashboard Layout
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={navigate} />;
      case 'transactions':
        return <TransactionsPage />;
      case 'budgets':
        return <BudgetsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <NotFoundPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activePage={currentPage}
        onNavigate={navigate}
      />

      {/* Main Wrapper */}
      <div className="main-wrapper">
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onQuickAdd={() => setIsGlobalAddOpen(true)}
          activePage={currentPage}
        />

        <main style={{ flex: 1 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Quick Add Transaction Modal */}
      <TransactionForm
        isOpen={isGlobalAddOpen}
        onClose={() => setIsGlobalAddOpen(false)}
        onSubmit={handleGlobalCreateTx}
        currency={user?.currency || 'INR'}
      />
    </div>
  );
}
