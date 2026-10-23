import React from 'react';
import { motion } from 'framer-motion';

export default function LandingPage({ onNavigate }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#0f172a', overflowX: 'hidden' }}>
      {/* Landing Navigation */}
      <header className="landing-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)',
              flexShrink: 0
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              SmartSpend
            </div>
          </div>
        </div>

        <nav className="landing-nav">
          <a href="#features" style={{ transition: 'color 0.2s' }}>Features</a>
          <a href="#how-it-works" style={{ transition: 'color 0.2s' }}>How it Works</a>
          <a href="#privacy" style={{ transition: 'color 0.2s' }}>Security</a>
        </nav>

        <div className="landing-header-actions">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => onNavigate('login')}
            id="landing-signin-btn"
          >
            Sign In
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate('register')}
            id="landing-register-btn"
          >
            Get Started Free
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #d1fae5',
              borderRadius: '9999px',
              color: '#059669',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '24px'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            The Modern Way to Master Personal Finance
          </div>

          <h1
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(2rem, 5.5vw, 4rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: '#0f172a',
              maxWidth: '900px',
              margin: '0 auto 20px'
            }}
          >
            Track Your Money. <span style={{ color: '#10b981' }}>Master Your Spending.</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              color: '#64748b',
              maxWidth: '680px',
              margin: '0 auto 36px',
              lineHeight: 1.6
            }}
          >
            SmartSpend gives you complete visibility over every rupee. Manage income, track expenses, set monthly category budgets, and analyze spending patterns with ease.
          </p>

          <div className="landing-hero-actions">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => onNavigate('register')}
              id="hero-get-started-btn"
            >
              Start Tracking Free
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            <button
              className="btn btn-outline btn-lg"
              onClick={() => onNavigate('login')}
              id="hero-demo-login-btn"
            >
              Sign In to Existing Account
            </button>
          </div>
        </motion.div>

        {/* Dashboard Preview Graphic */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="landing-preview"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span style={{ fontSize: '0.825rem', color: '#94a3b8', marginLeft: '8px' }}>SmartSpend — Live Overview</span>
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#059669', backgroundColor: '#ecfdf5', padding: '4px 10px', borderRadius: '9999px' }}>
              Monthly Savings: ₹42,500.00
            </div>
          </div>

          <div className="landing-preview-grid">
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Balance</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>₹1,85,420.00</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>October Income</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#059669', marginTop: '4px' }}>₹95,000.00</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>October Expenses</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#dc2626', marginTop: '4px' }}>₹52,500.00</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Budget Utilization</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#6366f1', marginTop: '4px' }}>65.6%</div>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#64748b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
              <span>Recent: Grocery Shopping (Blinkit)</span>
              <span style={{ color: '#dc2626', fontWeight: 600 }}>-₹1,450.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
              <span>Recent: Consulting Retainer</span>
              <span style={{ color: '#059669', fontWeight: 600 }}>+₹25,000.00</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section id="features" style={{ padding: '70px 20px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 700, marginBottom: '12px' }}>
              Everything you need to master your money
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
              Designed specifically for realistic personal finances with clear metrics, instant insights, and zero clutter.
            </p>
          </div>

          <div className="landing-features-grid">
            <div className="content-card">
              <div className="stat-icon emerald" style={{ marginBottom: '18px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>Smart Transactions</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Log income and expenses with categories, payment methods (UPI, Cards, Cash), date tracking, notes, and instant filtering.
              </p>
            </div>

            <div className="content-card">
              <div className="stat-icon indigo" style={{ marginBottom: '18px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>Monthly Category Budgets</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Set monthly spending limits for Groceries, Dining Out, Travel, and more. Visual progress bars alert you before you exceed them.
              </p>
            </div>

            <div className="content-card">
              <div className="stat-icon amber" style={{ marginBottom: '18px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>Analytics & Reports</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Comprehensive cash flow charts, category breakdown percentages, savings rate metrics, and period-by-period comparisons.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Privacy section */}
      <section id="privacy" style={{ padding: '60px 20px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, marginBottom: '14px' }}>
          Strict User Data Isolation
        </h2>
        <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, maxWidth: '640px', margin: '0 auto 32px' }}>
          Your data belongs to you. Every record is cryptographically tied to your authenticated account with password hashing, secure tokens, and isolated database queries.
        </p>
        <button className="btn btn-primary btn-md" onClick={() => onNavigate('register')}>
          Create Your Account Now
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#0f172a', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span>SmartSpend</span>
          <span>•</span>
          <span style={{ fontWeight: 400, color: '#64748b' }}>Track Your Money. Master Your Spending.</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          © {new Date().getFullYear()} SmartSpend Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
