# SmartSpend — Production Deployment Guide (Two Separate Vercel Projects)

This guide walks you through deploying **SmartSpend** as two separate, decoupled Vercel projects:
1. **Backend Project (`smartspend-backend`)**: Node.js + Express serverless API running from the `server/` directory.
2. **Frontend Project (`smartspend-frontend`)**: React + Vite Single-Page Application (SPA) running from the `client/` directory.
3. **Database**: Managed MongoDB Atlas cluster.

---

## Architecture Overview

```
+-------------------------------------------------------+
|  Frontend: smartspend-frontend.vercel.app             |
|  - Root Directory: client/                            |
|  - Framework: Vite                                    |
|  - Calls: VITE_API_BASE_URL                           |
+---------------------------+---------------------------+
                            |
           HTTPS API Calls  | (Bearer JWT / Cookies)
                            v
+-------------------------------------------------------+
|  Backend: smartspend-backend.vercel.app               |
|  - Root Directory: server/                            |
|  - Framework: Other                                   |
|  - Serverless function: server/api/index.js           |
|  - CORS: Allows *.vercel.app + custom FRONTEND_URL   |
+---------------------------+---------------------------+
                            |
             Mongoose 8+    | (Connection caching)
                            v
+-------------------------------------------------------+
|  Database: MongoDB Atlas                              |
|  - Network Access: 0.0.0.0/0 (Vercel serverless IPs)  |
|  - Database: smartspend                               |
+-------------------------------------------------------+
```

---

## Step 1: MongoDB Atlas Preparation

Before deploying either project, ensure your MongoDB Atlas cluster is ready for serverless traffic.

1. **Create/Verify Database User**:
   - Go to MongoDB Atlas -> **Database Access**.
   - Create a user (e.g., `smartspend_user`) with `Read and write to any database` privileges.
   - Note the password. If the password contains special characters (e.g. `@`, `:`, `/`, `%`), ensure they are URL-encoded.

2. **Configure Network Access (Crucial)**:
   - Go to MongoDB Atlas -> **Network Access**.
   - Ensure an IP entry exists for `0.0.0.0/0` (Allow Access from Anywhere).
   - *Why?* Vercel Serverless Functions execute on dynamic, pooled cloud IP addresses that change with every execution. Restricting access to a single static IP will cause connection timeouts (`MongooseServerSelectionError`).

3. **Copy the Connection String**:
   - Go to **Database** -> **Connect** -> **Drivers** (Node.js).
   - Format:
     ```text
     mongodb+srv://<username>:<password>@<cluster>.mongodb.net/smartspend?retryWrites=true&w=majority
     ```
   - Ensure you specify the database name (`/smartspend`) before the query parameters.

---

## Step 2: Deploy Backend First (`smartspend-backend`)

> **IMPORTANT**: Always deploy the backend project first. You need the generated backend URL to configure the frontend environment variables in Step 3.

1. In the [Vercel Dashboard](https://vercel.com/dashboard), click **Add New...** -> **Project**.
2. Select your repository: `vik-alp007/SmartSpend` (or your fork).
3. In the **Configure Project** screen:
   - **Project Name**: `smartspend-backend`
   - **Framework Preset**: Select **Other**
   - **Root Directory**: Click **Edit**, select `server`, and click **Continue**.
4. **Build and Output Settings**:
   - Leave default settings (`npm install`, no build command needed for backend serverless function).
5. **Environment Variables**:
   Add the following variables:

   | Variable Name | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production mode & strict Atlas checks |
   | `MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster0.../smartspend?retryWrites=true&w=majority` | Your MongoDB Atlas connection URI |
   | `JWT_SECRET` | Strong random 32+ character string | Used for signing authentication tokens |
   | `BUG_CHALLENGE_MODE` | `true` (or `false`) | Keep `true` for competition defect testing |

6. Click **Deploy**.
7. Once deployed:
   - Copy your backend URL (e.g. `https://smartspend-backend.vercel.app`).
   - Test in your browser:
     - `https://smartspend-backend.vercel.app/` -> Should return JSON: `{"name":"SmartSpend Backend API","status":"running","health":"/api/health"}`
     - `https://smartspend-backend.vercel.app/api/health` -> Should return JSON: `{"status":"ok","database":"connected",...}`

---

## Step 3: Deploy Frontend (`smartspend-frontend`)

1. In the [Vercel Dashboard](https://vercel.com/dashboard), click **Add New...** -> **Project**.
2. Select the **same** repository: `vik-alp007/SmartSpend`.
3. In the **Configure Project** screen:
   - **Project Name**: `smartspend-frontend`
   - **Framework Preset**: Select **Vite**
   - **Root Directory**: Click **Edit**, select `client`, and click **Continue**.
4. **Build and Output Settings**:
   - Build Command: `vite build` (preset default)
   - Output Directory: `dist` (preset default)
   - Install Command: `npm install` (preset default)
5. **Environment Variables**:
   Add the following variable:

   | Variable Name | Value | Description |
   |---|---|---|
   | `VITE_API_BASE_URL` | `https://smartspend-backend.vercel.app/api` | Full URL to your backend `/api` endpoint from Step 2 |

   > **Note**: Even if you omit `/api` and provide `https://smartspend-backend.vercel.app`, the client service automatically normalizes and appends `/api`.

6. Click **Deploy**.
7. Once deployment finishes, visit your frontend URL (e.g., `https://smartspend-frontend.vercel.app`).

---

## Step 4: CORS Configuration Alignment (Optional / Automatic)

- **Automatic Support**: The backend Express CORS middleware automatically permits any origin matching `https://*.vercel.app`. This means your production frontend and all Vercel git preview branches work out-of-the-box.
- **Custom Domains**: If you assign a custom domain to the frontend (e.g., `https://smartspend.yourdomain.com`):
  1. Open the **`smartspend-backend`** project in Vercel.
  2. Go to **Settings** -> **Environment Variables**.
  3. Add `FRONTEND_URL` = `https://smartspend.yourdomain.com`.
  4. Redeploy the backend project.

---

## Verification Checklist

| Check | Expected Result | Verified? |
|---|---|---|
| Backend Root `GET /` | Returns `{ "name": "SmartSpend Backend API", "status": "running" }` | [ ] |
| Backend Health `GET /api/health` | Returns `{ "status": "ok", "database": "connected" }` | [ ] |
| Frontend Home Page | Loads dashboard or login screen without network errors | [ ] |
| Preflight OPTIONS | Returns HTTP 204 with `Access-Control-Allow-Origin` | [ ] |
| Direct Page Refresh | Navigating to `/transactions` and refreshing does not 404 (handled by `client/vercel.json`) | [ ] |
| Registration / Login | Creating an account or logging in succeeds and stores JWT token | [ ] |

---

## Troubleshooting

### "Unable to connect to SmartSpend server"
This error occurs in the frontend if `fetch()` fails with a network `TypeError`. Check the following:
1. **Wrong `VITE_API_BASE_URL`**: Verify that `VITE_API_BASE_URL` in the frontend Vercel project matches your backend deployment URL + `/api`.
2. **Backend is failing on cold start**: Check the Vercel Function logs under the `smartspend-backend` project.
3. **MongoDB Atlas IP blocked**: Ensure MongoDB Atlas has `0.0.0.0/0` in its IP Access List.

### 404 Not Found on Page Refresh
If refreshing `/budgets` or `/transactions` returns a 404:
- Verify that [client/vercel.json](file:///Users/vikalp1.5/Desktop/SmartSpend_ccc/client/vercel.json) is present with the SPA rewrite `{"source": "/(.*)", "destination": "/index.html"}`.

### Database Connection Error (503)
If `/api/health` returns 503 `degraded`:
- Check your `MONGODB_URI` credentials in the backend environment variables.
- Ensure the database user has permissions for the `smartspend` database.
