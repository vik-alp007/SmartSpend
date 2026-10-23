# SmartSpend — Complete Vercel & MongoDB Atlas Deployment Guide

A step-by-step, beginner-friendly production deployment manual for **SmartSpend — Personal Finance & Expense Tracker**.

---

## Overview: Architecture Choice

SmartSpend can be deployed to Vercel using two architectures:

* **OPTION B: SINGLE VERCEL PROJECT (RECOMMENDED)**  
  Deploys the React frontend and Express API together as one single project.
  * **Why this is recommended**: Eliminates CORS errors completely, requires no backend URL hardcoding in frontend builds, handles cookies natively, requires only one Vercel dashboard project, and has zero cross-domain connection latency.
* **OPTION A: SEPARATE FRONTEND & BACKEND PROJECTS**  
  Deploys the Vite frontend as Project 1 and the Express backend as Project 2. Both approaches are fully supported by the codebase.

---

## Part A: MongoDB Atlas Setup (Prerequisite)

> [!IMPORTANT]
> **MongoDB Compass is NOT the database server.** MongoDB Compass is a graphical viewer application running on your computer. When running on your local machine, Compass connected to `mongodb://127.0.0.1:27017/smartspend`. Because Vercel serverless containers do not have a local MongoDB daemon, you **must** provision a cloud MongoDB Atlas database.

### Step 1: Create a Free MongoDB Atlas Account & Cluster
1. Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up or log in.
2. Click **Create** to deploy a new database.
3. Select the **M0 Free (Shared)** tier.
4. Select a cloud provider (AWS recommended) and region closest to you or your users (e.g., `us-east-1` or `ap-south-1`).
5. Name your cluster (e.g., `Cluster0` or `SmartSpendCluster`) and click **Create Deployment**.

### Step 2: Create a Database User
1. Under **Security** in the left sidebar, click **Database Access**.
2. Click **Add New Database User**.
3. Select **Password** authentication method.
4. Enter a **Username** (e.g., `smartspend_admin`).
5. Generate or enter a strong **Password**.
   > [!WARNING]
   > Avoid special characters like `@`, `:`, `/`, or `%` in your database password as they can interfere with URI parsing, or ensure they are URL-encoded.
6. Under **Database User Privileges**, select **Read and write to any database**.
7. Click **Add User**. Save your username and password in a secure password manager.

### Step 3: Configure Network Access (Crucial for Vercel)
Vercel serverless functions run across dynamic IP addresses that change continuously. Therefore, Atlas must accept connections from any IP.

1. Under **Security** in the left sidebar, click **Network Access**.
2. Click **Add IP Address**.
3. Click **Allow Access from Anywhere** (this will populate `0.0.0.0/0`).
4. (Optional) Set the comment to `Allow Vercel Serverless Functions`.
5. Click **Confirm**. Wait ~1 minute until the status shows **Active**.

### Step 4: Obtain Your MongoDB Atlas Connection String
1. Under **Deployment** in the left sidebar, click **Database**.
2. Click the **Connect** button on your cluster card.
3. Select **Drivers** (Node.js).
4. Copy the connection string displayed. It will look like this:
   ```text
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
5. Modify the connection string by:
   - Replacing `<username>` with your actual database username.
   - Replacing `<password>` with your actual database password.
   - Inserting `/smartspend` immediately before the `?` query parameters.
   
   **Final Example**:
   ```text
   mongodb+srv://smartspend_admin:YourSecretPassword123@cluster0.abcde.mongodb.net/smartspend?retryWrites=true&w=majority
   ```

### Step 5: (Optional) Connect MongoDB Compass to Atlas
If you want to view and manage your production database using Compass:
1. Open **MongoDB Compass** on your computer.
2. In the "New Connection" screen, paste your Atlas connection string from Step 4.
3. Click **Connect**. You can now view collections (`users`, `transactions`, `budgets`) directly from your desktop.

---

## Part B: Deploying Using Option B (Single Project — Recommended)

This approach builds your Vite frontend into static assets and deploys your Express API as a Vercel Serverless Function under the same domain.

### Step 1: Push Project to GitHub
Ensure all recent fixes are committed and pushed to your GitHub repository:
```bash
git add .
git commit -m "Configure SmartSpend for production Vercel deployment"
git push origin main
```

### Step 2: Import into Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** > **Project**.
3. Select your GitHub repository (`SmartSpend` or `SmartSpend_ccc`) and click **Import**.

### Step 3: Configure Project Settings
* **Project Name**: `smartspend` (or your preferred name)
* **Framework Preset**: Select **Other** (do NOT select Vite here; our root `vercel.json` orchestrates the build)
* **Root Directory**: `./` (leave as Root directory)
* **Build Command**: Leave default or ensure it says `npm run build`
* **Output Directory**: Leave default or ensure it says `dist`
* **Install Command**: `npm install`

### Step 4: Configure Environment Variables
Expand the **Environment Variables** section and add the following:

| Key | Value Example | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enables production optimizations and suppresses stack traces in API errors |
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster0.abcde.mongodb.net/smartspend?retryWrites=true&w=majority` | Your MongoDB Atlas connection string from Part A |
| `JWT_SECRET` | *(Generate a 32+ character random string)* | Secret key for signing and verifying authentication tokens |
| `JWT_EXPIRES_IN` | `7d` | Token lifespan |
| `BUG_CHALLENGE_MODE` | `true` (or `false` for corrected mode) | Keep `true` for competition defect hunting, `false` for fully corrected mode |
| `COOKIE_SECRET` | *(Generate a 32+ character random string)* | Secret for signing session cookies |

*(Note: `CLIENT_ORIGIN` and `VITE_API_BASE_URL` are NOT needed for Single Project deployment because the frontend and backend share the exact same domain!)*

### Step 5: Deploy
Click **Deploy**.
Vercel will:
1. Run `npm install`
2. Execute `npm run build` (installing client deps, compiling Vite assets into `dist/`)
3. Provision the serverless function `api/index.js` for `/api/*`
4. Deploy the application to a public URL (e.g. `https://smartspend-app.vercel.app`).

---

## Part C: Deploying Using Option A (Separate Frontend & Backend Projects)

If you prefer two isolated Vercel projects (one for frontend, one for backend):

### Project 1: Backend Deployment
1. In Vercel, click **Add New...** > **Project** and select your repository.
2. In **Root Directory**, click **Edit** and select `server`.
3. Set **Framework Preset** to **Other**.
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your MongoDB Atlas connection URI.
   - `JWT_SECRET`: Your 32+ character random JWT secret.
   - `JWT_EXPIRES_IN`: `7d`
   - `BUG_CHALLENGE_MODE`: `true` or `false`
   - `COOKIE_SECRET`: Your cookie secret.
   - `CLIENT_ORIGIN`: Set to temporary placeholder `http://localhost:5173` (we will update this once frontend is deployed).
5. Click **Deploy**. Note the assigned backend URL: e.g., `https://smartspend-api.vercel.app`.
6. Verify backend health: Visit `https://smartspend-api.vercel.app/api/health` in your browser. It should return `{"status":"ok","database":"connected",...}`.

### Project 2: Frontend Deployment
1. In Vercel, click **Add New...** > **Project** and select the same repository.
2. In **Root Directory**, click **Edit** and select `client`.
3. Set **Framework Preset** to **Vite**.
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://smartspend-api.vercel.app/api` (use your actual backend URL from Project 1).
7. Click **Deploy**. Note the assigned frontend URL: e.g., `https://smartspend-app.vercel.app`.

### Connect Frontend & Backend (Option A Only)
1. Go back to the **Backend Project** settings in Vercel > **Settings** > **Environment Variables**.
2. Edit `CLIENT_ORIGIN` and set its value to your actual frontend URL:
   `CLIENT_ORIGIN = https://smartspend-app.vercel.app`
3. Go to **Deployments** tab in the backend project, click the three dots on the latest deployment, and select **Redeploy** to apply the updated environment variable.

---

## Part D: Environment Variables Reference

### Frontend Environment Variables (Safe for Public Exposure)
| Variable | Required? | Single Project | Separate Projects | Description |
|---|---|---|---|---|
| `VITE_API_BASE_URL` | No (Single) / Yes (Separate) | Leave blank / omit | `https://your-backend.vercel.app/api` | Base URL for API requests. Automatically normalizes `/api` if missing. |

### Backend Environment Variables (Server Secrets — Never Expose to Client)
| Variable | Required? | Default Fallback | Production Guidance |
|---|---|---|---|
| `MONGODB_URI` | **YES** | Localhost (Fails on Vercel) | Full Atlas URI with username, password, and database name. |
| `JWT_SECRET` | **YES** | None in production | 32+ character cryptographic random string. |
| `JWT_EXPIRES_IN` | No | `7d` | Valid format: `24h`, `7d`, `30d`. |
| `NODE_ENV` | No | `development` | Set to `production`. |
| `CLIENT_ORIGIN` | Only for Option A | Localhost origins | URL of your deployed frontend. Comma-separated if multiple. |
| `COOKIE_SECRET` | No | Dev default | 32+ character random string for cookie signing. |
| `BUG_CHALLENGE_MODE` | No | `true` | Set `true` to keep competition bugs active, `false` to correct them. |

---

## Part E: Post-Deployment Verification Checklist

Once deployed, systematically verify every critical flow:

- [ ] **1. API Health Check**:
  Visit `https://<your-domain>/api/health`.
  Verify HTTP `200 OK` with JSON:
  ```json
  { "status": "ok", "database": "connected" }
  ```
- [ ] **2. Homepage & Branding**:
  Load `https://<your-domain>/`. Ensure page loads without console errors, fonts render correctly, and "Get Started" links work.
- [ ] **3. User Registration**:
  Click "Sign Up". Register a new user:
  - Name: `Test Production User`
  - Email: `test@smartspend.production`
  - Password: `SecurePassword2026!`
  - Currency: `INR`
  Ensure user is registered, token is stored in localStorage, and redirection to the Dashboard succeeds.
- [ ] **4. User Logout & Login**:
  - Click Logout in the sidebar.
  - Return to the Login page.
  - Enter your credentials and sign in.
- [ ] **5. Add Transactions**:
  - Click "+ Add Transaction".
  - Add an income transaction: Title `October Salary`, Amount `50000`, Category `Salary`.
  - Add an expense transaction: Title `Office Groceries`, Amount `2500`, Category `Groceries`.
  - Verify transactions appear in the Transactions table and summary cards update.
- [ ] **6. Set Budgets**:
  - Navigate to the **Budgets** page.
  - Create a budget for category `Groceries` with limit `10000`.
  - Verify spent amount and remaining progress bar are calculated.
- [ ] **7. Reports & Analytics**:
  - Navigate to the **Reports** page.
  - Verify monthly trend chart and category breakdown render correctly.
- [ ] **8. Profile Settings**:
  - Navigate to the **Profile** page.
  - Update display name or preferences and verify persistence.
- [ ] **9. SPA Direct Route Refresh**:
  - While on `https://<your-domain>/transactions` or `.../budgets`, press browser Refresh (`Cmd+R` / `F5`).
  - Verify the page reloads cleanly without a 404 error.
- [ ] **10. Browser DevTools Inspection**:
  - Open Developer Tools (`F12`) > **Console** and **Network** tabs.
  - Verify zero `TypeError: Failed to fetch` or CORS violations.

---

## Part F: Production Troubleshooting Matrix

| Symptom / Error Code | Likely Root Cause | Exact Debugging & Remediation Step |
|---|---|---|
| **“Unable to connect to SmartSpend server...”** (Client alert) | 1. Backend serverless function crashed on cold start.<br>2. CORS preflight blocked.<br>3. `MONGODB_URI` missing or Atlas IP not allowed. | 1. Open browser Network tab and click the failed request.<br>2. Check Vercel Backend > **Logs** tab.<br>3. Check Atlas **Network Access**: ensure `0.0.0.0/0` is Active. |
| **HTTP 503** with `{"status":"degraded","database":"disconnected"}` | MongoDB connection could not be established. | 1. Verify `MONGODB_URI` environment variable is added in Vercel.<br>2. Ensure Atlas database user password has no unencoded special characters.<br>3. Check that Atlas cluster is not paused. |
| **HTTP 401 Unauthorized** | Missing, invalid, or expired JWT token. | 1. Check if `smartspend_token` exists in browser `localStorage`.<br>2. Clear site data / cookies and log in again.<br>3. Verify `JWT_SECRET` in Vercel has not changed between deployments. |
| **HTTP 404** on `/api/...` endpoints | 1. Frontend calling backend root URL without `/api`.<br>2. Missing rewrites in `vercel.json`. | 1. Check requested URL in Network tab. If it calls `https://domain.com/auth/login`, ensure `VITE_API_BASE_URL` ends with `/api`.<br>2. Check root `vercel.json` contains `/api/(.*) -> /api/index.js`. |
| **HTTP 404** when refreshing `/transactions` or `/dashboard` | SPA fallback routing not configured. | Ensure `vercel.json` has `{"source": "/(.*)", "destination": "/index.html"}` rewrite rule. |
| **HTTP 429 Too Many Requests** | Rate limiter triggered due to excessive calls. | 1. Wait 15 minutes for the rate limit window to reset.<br>2. Ensure `app.set('trust proxy', 1)` is enabled in `server/src/app.js` so clients don't share Vercel's proxy IP. |
| **HTTP 500 Internal Server Error** | Unhandled server exception. | Open Vercel Dashboard > **Runtime Logs** to inspect the error stack trace. |
| **HTTP 502 / 504 Gateway Timeout** | Serverless function exceeded execution timeout (typically 10-15s). | Usually caused by a hanging database connection handshake. Verify Atlas IP access `0.0.0.0/0`. |
| **`CORS policy: No 'Access-Control-Allow-Origin' header`** | Frontend origin not permitted by backend CORS policy. | 1. In backend project, update `CLIENT_ORIGIN` to match your frontend domain.<br>2. Ensure `CLIENT_ORIGIN` has no trailing slash. |
| **`ERR_NAME_NOT_RESOLVED`** | Typo in backend URL entered in `VITE_API_BASE_URL`. | Check spelling of domain in Vercel Frontend Environment Variables and trigger a redeployment. |
| **`ERR_CONNECTION_REFUSED`** | Frontend is still attempting to call `http://localhost:8080` in production. | 1. Verify `VITE_API_BASE_URL` is configured in Vercel.<br>2. Redeploy frontend so Vite bundles the new environment variable. |
