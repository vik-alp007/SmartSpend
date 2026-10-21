# SmartSpend — REST API Documentation

Base URL: `http://localhost:5000/api`

All state-changing requests use `Content-Type: application/json`.
Authentication is supported via:
1. `Authorization: Bearer <JWT_TOKEN>` header, OR
2. HTTP-only secure cookie named `token`.

---

## 1. Authentication Endpoints

### Register User
- **Method**: `POST`
- **Route**: `/api/auth/register`
- **Body**:
  ```json
  {
    "name": "Alex Sharma",
    "email": "alex@smartspend.io",
    "password": "Password123!",
    "currency": "INR"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "id": "671600000000000000000001",
      "name": "Alex Sharma",
      "email": "alex@smartspend.io",
      "currency": "INR",
      "createdAt": "2026-10-21T12:00:00.000Z"
    }
  }
  ```

### Login
- **Method**: `POST`
- **Route**: `/api/auth/login`
- **Body**:
  ```json
  {
    "email": "alex@smartspend.io",
    "password": "Password123!"
  }
  ```
- **Response (200 OK)**: Sets HTTP-only `token` cookie and returns user object.

### Current User
- **Method**: `GET`
- **Route**: `/api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**: Returns authenticated user profile.

### Logout
- **Method**: `POST`
- **Route**: `/api/auth/logout`
- **Response (200 OK)**: Clears authentication session cookie.

---

## 2. Transactions Endpoints

### List Transactions (Paginated, Search & Filter)
- **Method**: `GET`
- **Route**: `/api/transactions`
- **Query Parameters**:
  - `page` (integer, default 1)
  - `limit` (integer, default 10)
  - `search` (string, title search)
  - `type` (`income` | `expense`)
  - `category` (string, e.g. `Groceries`)
  - `startDate` (ISO Date, e.g. `2026-10-01`)
  - `endDate` (ISO Date, e.g. `2026-10-31`)
  - `sortBy` (`transactionDate` | `amount` | `title`)
  - `sortOrder` (`asc` | `desc`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "671600000000000000000002",
        "userId": "671600000000000000000001",
        "title": "Grocery Shopping",
        "type": "expense",
        "amount": 2450.50,
        "category": "Groceries",
        "transactionDate": "2026-10-15T10:00:00.000Z",
        "paymentMethod": "UPI",
        "notes": "Weekly produce"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalRecords": 1,
      "totalPages": 1
    }
  }
  ```

### Create Transaction
- **Method**: `POST`
- **Route**: `/api/transactions`
- **Body**:
  ```json
  {
    "title": "October Salary",
    "type": "income",
    "amount": 85000,
    "category": "Salary",
    "transactionDate": "2026-10-01",
    "paymentMethod": "Net Banking",
    "notes": "Direct transfer"
  }
  ```
- **Response (201 Created)**: Returns created transaction.

### Get Transaction by ID
- **Method**: `GET`
- **Route**: `/api/transactions/:id`
- **Response (200 OK / 404 Not Found)**

### Update Transaction
- **Method**: `PATCH`
- **Route**: `/api/transactions/:id`
- **Body**: Partial fields (`title`, `amount`, `category`, `paymentMethod`, `notes`)
- **Response (200 OK)**

### Delete Transaction
- **Method**: `DELETE`
- **Route**: `/api/transactions/:id`
- **Response (200 OK)**: `{ "success": true, "message": "Transaction deleted successfully." }`

---

## 3. Budgets Endpoints

### List Monthly Budgets
- **Method**: `GET`
- **Route**: `/api/budgets?month=10&year=2026`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "671600000000000000000003",
        "category": "Groceries",
        "monthlyLimit": 12000,
        "spent": 4850.50,
        "remaining": 7149.50,
        "utilizationPercentage": 40.4,
        "isOverBudget": false
      }
    ]
  }
  ```

### Create Budget
- **Method**: `POST`
- **Route**: `/api/budgets`
- **Body**:
  ```json
  {
    "category": "Dining Out",
    "monthlyLimit": 6000,
    "month": 10,
    "year": 2026
  }
  ```
- **Response (201 Created / 409 Conflict if duplicate)**

### Update Budget Limit
- **Method**: `PATCH`
- **Route**: `/api/budgets/:id`
- **Body**: `{ "monthlyLimit": 8000 }`
- **Response (200 OK)**

### Delete Budget
- **Method**: `DELETE`
- **Route**: `/api/budgets/:id`
- **Response (200 OK)**

---

## 4. Dashboard Endpoints

### Summary KPIs
- **Method**: `GET`
- **Route**: `/api/dashboard/summary`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "totalBalance": 185420.00,
      "totalIncome": 250000.00,
      "totalExpenses": 64580.00,
      "currentMonthIncome": 85000.00,
      "currentMonthExpenses": 35200.00,
      "currentMonthSavings": 49800.00,
      "totalBudgetLimit": 65000.00,
      "recentTransactions": [...],
      "budgetCount": 8
    }
  }
  ```

### Visual Charts Data
- **Method**: `GET`
- **Route**: `/api/dashboard/charts`
- **Response (200 OK)**: Returns `monthlyHistory` (last 6 months income/expenses) and `categories` (current month distribution).

---

## 5. Reports Endpoints

### Monthly Report
- **Method**: `GET`
- **Route**: `/api/reports/monthly?month=10&year=2026`
- **Response (200 OK)**: Period summary, daily cash flow trend, category itemization with counts and percentages.

### Category Report
- **Method**: `GET`
- **Route**: `/api/reports/categories?startDate=2026-10-01&endDate=2026-10-31`
- **Response (200 OK)**: Breakdown with totals, average spend per transaction, and percentage shares.

---

## 6. Profile Endpoints

### Get Profile
- **Method**: `GET`
- **Route**: `/api/profile`

### Update Profile
- **Method**: `PATCH`
- **Route**: `/api/profile`
- **Body**: `{ "name": "Updated Name", "currency": "INR" }`

### Change Password
- **Method**: `POST`
- **Route**: `/api/profile/change-password`
- **Body**:
  ```json
  {
    "currentPassword": "OldPassword123!",
    "newPassword": "NewStrongPassword456!"
  }
  ```

---

## 7. System & Health Endpoints

### Health Check
- **Method**: `GET`
- **Route**: `/api/health`
- **Response (200 OK)**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-10-21T12:00:00.000Z",
    "uptime": 245.8,
    "database": {
      "status": "connected"
    },
    "version": "1.0.0"
  }
  ```

### Safe Client Configuration
- **Method**: `GET`
- **Route**: `/api/config/client-settings`
- **Response (200 OK)**: Returns `{ bugChallengeMode: boolean, currency: "INR" }`.
