# SmartSpend — Personal Finance & Expense Tracker

> **Track Your Money. Master Your Spending.**

SmartSpend is a complete, professional, locally runnable, and deployment-ready full-stack web application designed for personal finance management. Users can track their income and expenses, establish category-based monthly budgets, monitor utilization percentages, and inspect visual financial reports with ease.

---

## Technology Stack

- **Frontend**: React 18, Framer Motion, Vanilla CSS3 (Custom Design System with tokens, responsive media queries, and dark navy / emerald theme), Native SVG charts.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB with Mongoose ODM (supports Local MongoDB and MongoDB Atlas).
- **Authentication**: JWT authentication with HTTP-only secure cookie strategy, bcrypt password hashing, and rate limiting.
- **Testing**: Node.js built-in test runner (`node:test`, `node:assert`), Supertest.
- **Artifacts**: PDFKit for generating organizer-only documentation.

---

## Key Features

1. **Financial Overview Dashboard**:
   - Total Net Balance (`Total Income - Total Expenses`).
   - Current Month Income, Expenses, and Savings.
   - Interactive 6-month Income vs Expense bar chart with tooltips.
   - Category-wise spending breakdown with percentages.
   - Recent transaction history and active monthly budgets.
2. **Transaction Management**:
   - Full CRUD: Create, view details, edit, and delete transactions with confirmation dialogs.
   - Income & expense categorization (Salary, Freelancing, Groceries, Dining Out, Bills, Rent, Travel, Health, Shopping, Education).
   - Real-time search, multi-field filtering (type, category, date range), and sorting (date, amount).
   - Server-side pagination.
3. **Monthly Budgeting**:
   - Set monthly spending limits per category.
   - Real-time spending against budget, remaining amount, and utilization percentage.
   - Visual progress bars with safe (green), warning (amber), and exceeded (red danger) states.
   - Duplicate budget prevention for the same category, month, and year.
4. **Reports & Analytics**:
   - Monthly cash flow trends, savings rate percentage, and category breakdown.
   - One-click CSV export of monthly financial statements.
5. **Account & Security**:
   - Real authentication with duplicate email rejection and bcrypt password hashing.
   - Strict user data isolation — all records are scoped to the authenticated user ID.
   - Password change modal and display currency preferences (INR ₹ default, USD, EUR, GBP).
6. **Controlled Competition Challenge Mode**:
   - 15 documented intentional defects (5 beginner, 5 intermediate, 5 advanced) for bug-hunting competitions.
   - Switched via `BUG_CHALLENGE_MODE=true` (Competition) or `BUG_CHALLENGE_MODE=false` (Corrected).

---

## Project Structure

```
smartspend/
├── package.json              # Root scripts orchestrating client, server, seed, test, and pdf
├── package-lock.json
├── .gitignore
├── .env.example              # Environment variables template
├── README.md
├── client/                   # React frontend
│   ├── index.html            # Entry HTML with Inter/Outfit Google fonts
│   ├── vite.config.js        # Vite config with API proxy
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx           # App shell, routing, modal management
│       ├── styles/           # Pure CSS design system (no Tailwind)
│       │   ├── global.css    # Colors, fonts, resets, tokens
│       │   ├── layout.css    # Sidebar, topbar, cards, grids
│       │   ├── components.css# Buttons, forms, tables, modals, badges
│       │   └── responsive.css# Mobile (375px), tablet (768px), desktop (1440px)
│       ├── components/       # Reusable React components
│       │   ├── Navbar.jsx
│       │   ├── Sidebar.jsx
│       │   ├── StatCard.jsx
│       │   ├── TransactionTable.jsx
│       │   ├── TransactionForm.jsx
│       │   ├── BudgetCard.jsx
│       │   ├── ExpenseChart.jsx
│       │   ├── ConfirmDialog.jsx
│       │   ├── LoadingState.jsx
│       │   ├── EmptyState.jsx
│       │   └── ErrorMessage.jsx
│       ├── pages/            # View pages
│       │   ├── LandingPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── TransactionsPage.jsx
│       │   ├── BudgetsPage.jsx
│       │   ├── ReportsPage.jsx
│       │   ├── ProfilePage.jsx
│       │   └── NotFoundPage.jsx
│       ├── context/          # AuthContext
│       ├── services/         # API request layer
│       └── utils/            # Currency and date formatters
├── server/                   # Express backend
│   ├── package.json
│   └── src/
│       ├── app.js            # Express app, middleware, routes, static client serving
│       ├── server.js         # Startup, database connection, graceful shutdown
│       ├── config/           # Database and env validation
│       ├── models/           # User, Transaction, Budget Mongoose models
│       ├── controllers/      # Auth, Transaction, Budget, Dashboard, Report, Profile
│       ├── routes/           # REST API routes
│       ├── middleware/       # Auth, rate limiting, validation, error handling
│       └── tests/            # Automated test suite (33 tests)
├── docs/                     # Public documentation
│   ├── SETUP_GUIDE.md        # Beginner-friendly setup and MongoDB guide
│   ├── USER_GUIDE.md         # Comprehensive user journey and walkthrough
│   ├── API_DOCUMENTATION.md  # Detailed REST API specs
│   ├── TEST_REPORT.md        # Actual test execution results
│   └── BUG_REPORT_TEMPLATE.md# Bug report template for participants
├── private/                  # Organizer-only confidential files (in .gitignore)
│   ├── BUG_MANIFEST.md       # Master list of 15 intentional defects & root causes
│   └── BUG_FIX_GUIDE.md      # Surgical remediation instructions
├── scripts/
│   ├── seed-demo-data.js     # Seeds demo user (demo@smartspend.io) and transactions
│   └── generate-bug-pdf.js   # Generates master bug list PDF
└── artifacts/
    └── SmartSpend_Bug_List_and_Solutions.pdf
```

---

## Quickstart Guide

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Environment
```bash
cp .env.example server/.env
```
Ensure your MongoDB instance is running locally or specify a MongoDB Atlas connection string in `server/.env`.

### 3. Seed Demo Data (Optional but Recommended)
```bash
npm run seed
```
Creates demo account:
- **Email**: `demo@smartspend.io`
- **Password**: `SmartSpend2026!`

### 4. Start Development Servers
```bash
npm run dev
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 5. Production Build & Standalone Server
```bash
npm run build
npm start
# Access http://localhost:5000 directly!
```

---

## Testing & Competition Mode

Run the automated test suite (33 tests covering auth, CRUD, budgets, aggregations, and edge cases):

```bash
# Run tests with current environment configuration
npm test

# Run tests in competition mode (verifies intentional defects are active)
npm run test:competition

# Run tests in fixed mode (verifies corrected behavior)
npm run test:fixed
```

### Disabling Intentional Bugs (Corrected Mode)
In `server/.env`, set:
```env
BUG_CHALLENGE_MODE=false
```
Restart the server. All 15 intentional defects will be automatically resolved.

---

## Organizer Materials

- **PDF Bug List & Solutions**: `artifacts/SmartSpend_Bug_List_and_Solutions.pdf`
- **Markdown Bug Manifest**: `private/BUG_MANIFEST.md`
- **Remediation Guide**: `private/BUG_FIX_GUIDE.md`
- Re-generate PDF anytime: `npm run pdf`
