# SmartSpend — Complete User Journey & Application Guide

Welcome to **SmartSpend** — your personal finance companion for tracking cash inflows, mastering everyday spending, setting monthly category targets, and understanding your net worth.

---

## 1. Opening the Website

When you visit `http://localhost:5173` (or `http://localhost:5000` in production mode), you arrive at the **SmartSpend Landing Page**.

The landing page provides:
- A live preview mockup of your future dashboard.
- Feature highlights: Smart Transactions, Monthly Category Budgets, Visual Analytics, and Privacy Guarantee.
- Action buttons: **"Sign In"** (for returning users) and **"Get Started Free"** (for new accounts).

---

## 2. Registering an Account

1. Click **"Get Started Free"** or navigate to `/register`.
2. Fill out the registration form:
   - **Full Name**: e.g., `Pooja Verma` (minimum 2 characters).
   - **Email Address**: e.g., `pooja@example.in` (must be a valid, unique email).
   - **Password**: Minimum 6 characters (e.g. `PoojaFinance#2026`).
   - **Confirm Password**: Must match your password.
   - **Primary Currency**: Default is **INR (₹) - Indian Rupee**. (Also supports USD, EUR, GBP).
3. Click **"Get Started"**.
4. **What Happens Next**: Your password is cryptographically hashed with `bcryptjs`, your user document is saved into MongoDB, a secure JWT session token is created, and you are automatically transitioned to your fresh Dashboard.

---

## 3. Logging In

1. Click **"Sign In"** or navigate to `/login`.
2. Enter your registered email and password.
3. Alternatively, click **"Use Demo Organizer Credentials"** to autofill `demo@smartspend.io` / `SmartSpend2026!`.
4. Click **"Sign In"**.
5. **What Happens Next**: You receive an HTTP-only secure authentication cookie and Bearer token, taking you directly to your personalized financial dashboard.

---

## 4. Understanding the Dashboard

The Dashboard provides four core KPI metric cards:

1. **Total Net Balance**:
   - Formula: `Total All-Time Income - Total All-Time Expenses`.
   - Example: `₹1,85,420.00`.
2. **Current Month Income**:
   - Total money received in the current calendar month.
   - Example: `₹85,000.00` (Salary + Freelancing).
3. **Current Month Expenses**:
   - Total money spent in the current calendar month.
   - Example: `₹35,200.00`.
4. **Current Month Savings**:
   - Formula: `Current Month Income - Current Month Expenses`.
   - Example: `₹49,800.00`.

Below the metric cards:
- **Income vs. Expenses Chart**: Interactive native SVG bar graph showing month-by-month cash flow across the last 6 months. Hovering reveals exact income and expense amounts.
- **Category Spending Donut**: Breakdown of where your money went this month (Groceries, Dining Out, Bills, Rent, etc.) with percentages.
- **Recent Transactions**: Quick view of your last 5 transactions with quick edit and delete actions.
- **Monthly Budgets Snapshot**: Top active budgets with utilization progress bars.

---

## 5. Adding Income Transactions

1. Click **"+ Add Transaction"** (top navbar or dashboard banner).
2. In the modal dialog:
   - Select type: **Income** (turns emerald green).
   - Title: e.g. `Consulting Project Milestone 1`.
   - Amount (₹): e.g. `25000.00`.
   - Category: Select `Freelancing`, `Salary`, or `Investments`.
   - Payment Method: Choose `UPI`, `Net Banking`, `Cash`, etc.
   - Date: Defaults to today (or pick any date).
   - Notes: Optional details (e.g., `Invoice #INV-104`).
3. Click **"Add Transaction"**.
4. **What Happens Next**: The modal closes, a 201 Created response is received, and your Net Balance and Current Month Income immediately increase by ₹25,000.00.

---

## 6. Adding Expense Transactions

1. Click **"+ Add Transaction"**.
2. Select type: **Expense** (turns rose red).
3. Title: e.g. `Weekly Organic Groceries`.
4. Amount (₹): e.g. `3450.50`.
5. Category: Select `Groceries`.
6. Payment Method: e.g. `UPI` or `Credit Card`.
7. Click **"Add Transaction"**.
8. **What Happens Next**: Total Expenses increase, remaining balance decreases, and the Groceries budget progress bar advances toward its limit.

---

## 7. Editing and Deleting Transactions

### Editing
1. Go to the **Transactions** page.
2. Locate the row you want to modify and click the **Pencil (Edit)** icon.
3. Change the title, amount, category, or payment method.
4. Click **"Save Changes"**.
5. The row updates with the new values.

### Deleting
1. Click the **Trash (Delete)** icon on any transaction row.
2. An accessible confirmation modal appears: *"Are you sure you want to delete 'Title' for ₹Amount?"*
3. Click **"Delete Transaction"**.
4. The transaction is permanently deleted from MongoDB, and balances recalibrate.

---

## 8. Searching and Filtering Transactions

On the **Transactions** page:
- **Search Bar**: Type any keyword (e.g., `Swiggy` or `Electricity`). Matches update in real time.
- **Type Filter**: Filter by `All Types`, `Expenses Only`, or `Income Only`.
- **Category Filter**: Filter specifically for `Groceries`, `Dining Out`, `Bills`, `Rent`, etc.
- **Date Range**: Set Start Date and End Date to inspect transactions from a specific pay cycle.
- **Sort Options**: Sort by `Date`, `Amount`, or `Title` in `Ascending` or `Descending` order.
- **Pagination**: Navigate between pages using `Previous` and `Next`.
- **Reset Filters**: One-click button to clear all active filters.

---

## 9. Creating Monthly Budgets

1. Click **"Budgets"** in the sidebar.
2. Choose your target **Month** and **Year** (e.g., `October 2026`).
3. Click **"+ Set Budget"**.
4. Select the category (e.g., `Dining Out`).
5. Enter the monthly limit: e.g. `₹8,000`.
6. Click **"Set Budget"**.
7. **Duplicate Prevention**: If you attempt to add another budget for "Dining Out" in the same month/year, the system displays a clear error preventing duplicates.

---

## 10. Understanding Budget Progress

Each budget card displays:
- **Spent vs Limit**: e.g., `₹4,200.00 spent` / `₹8,000.00 limit`.
- **Remaining Balance**: `₹3,800.00 left`.
- **Progress Bar**:
  - **Green (Safe)**: Under 85% utilization.
  - **Amber (Warning)**: Between 85% and 100% utilization.
  - **Red + Exceeded Badge (Danger)**: Spending has surpassed the limit.

---

## 11. Viewing Reports & Analytics

1. Click **"Reports"** in the sidebar.
2. Select your period (Month and Year).
3. Review:
   - **Total Period Income & Expenses**.
   - **Net Savings & Savings Rate** (e.g., 45.2% savings rate).
   - **Daily Cash Flow Trends**: Bar chart showing income and expenditure for each day of the month.
   - **Category Breakdown Table**: Itemized spending per category with transaction counts and percentage share.
4. **Export CSV**: Click **"Export CSV"** to download an organized spreadsheet report directly to your computer!

---

## 12. Updating Profile & Password

1. Click **"Settings & Profile"** in the sidebar.
2. **Display Name**: Update your name and click **"Save Profile Changes"**.
3. **Display Currency**: Switch between INR (₹), USD ($), EUR (€), and GBP (£).
4. **Change Password**:
   - Enter your current password.
   - Enter your new password (minimum 6 characters).
   - Confirm new password.
   - Click **"Update Password"**.

---

## 13. Logging Out

Click **"Sign Out"** in the top navbar or Profile page.
Your session cookie is cleared, local tokens are deleted, and you are returned to the landing page.
