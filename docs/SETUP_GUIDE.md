# SmartSpend — Complete Setup & Database Connection Guide

Welcome to **SmartSpend** — a modern full-stack personal finance and expense tracker built with React, Node.js, Express, and MongoDB.

This guide is written in clear, beginner-friendly language so that anyone — even someone who has never connected a Node.js project to MongoDB before — can get the application up and running smoothly.

---

## Section A: Required Software

Before you start, make sure you have the following installed on your machine:

1. **Node.js** (v18.0.0 or higher recommended, e.g. Node 20 or 22).
   - Check version in terminal:
     ```bash
     node -v
     ```
2. **npm** (Node Package Manager, installed automatically with Node).
   - Check version:
     ```bash
     npm -v
     ```
3. **MongoDB**:
   - Either a **Local MongoDB** installation running on port 27017, OR
   - A free **MongoDB Atlas** cloud cluster.

---

## Section B: Installing Dependencies

The project consists of a root orchestrator, an Express backend in `server/`, and a React/Vite frontend in `client/`.

Run the following commands from the root workspace directory (`SmartSpend_ccc`):

```bash
# 1. Install root dependencies (PDF generator, scripts)
npm install

# 2. Install backend dependencies
npm --prefix server install

# 3. Install frontend dependencies
npm --prefix client install
```

> **Convenience Shortcut**: You can also run `npm run install:all` to install all three in sequence.

---

## Section C: Connecting to MongoDB Atlas (Cloud)

If you don't have MongoDB installed locally, MongoDB Atlas offers a free tier (M0):

1. **Create an Atlas Account**: Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and sign up for a free account.
2. **Deploy a Free Cluster**: Choose the Shared Cluster (M0 Free Tier). Select any region close to you.
3. **Create Database User**:
   - Under **Database Access**, click **Add New Database User**.
   - Choose **Password** authentication.
   - Enter a username (e.g. `smartspend_admin`) and a strong password.
   - Set privileges to **Read and write to any database**.
   - Click **Add User**.
4. **Configure Network Access (IP Whitelist)**:
   - Under **Network Access**, click **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`) for local development, or add your current IP.
   - Click **Confirm**.
5. **Get Connection String**:
   - Click **Database** -> **Connect** -> **Drivers** (Node.js).
   - Copy the connection URI:
     `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<username>` and `<password>` with your database user credentials.
   - Insert `/smartspend` right before the `?` query parameter to name the database:
     `mongodb+srv://smartspend_admin:YourPassword123@cluster0.xxxxx.mongodb.net/smartspend?retryWrites=true&w=majority`
6. **Add to server/.env**:
   - Paste this full URI as `MONGODB_URI` in `server/.env`.
   - *Never share your MongoDB password or commit `.env` to Git!*

---

## Section D: Connecting to Local MongoDB

If you have MongoDB installed locally on your Mac or Linux/Windows system:

1. **Start the MongoDB Service**:
   - On macOS (Homebrew):
     ```bash
     brew services start mongodb-community
     # Or run directly:
     mongod --config /opt/homebrew/etc/mongod.conf
     ```
   - On Linux (systemd):
     ```bash
     sudo systemctl start mongod
     ```
2. **Verify it is running**:
   ```bash
   mongosh --eval "db.adminCommand('ping')"
   # Should output: { ok: 1 }
   ```
3. **Local Connection URI**:
   Use the default local URI:
   ```env
   MONGODB_URI=mongodb://localhost:27017/smartspend
   ```

---

## Section E: Environment Configuration

1. Create your `server/.env` file:
   ```bash
   cp .env.example server/.env
   ```
2. Inspect `server/.env` and verify the values:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/smartspend
   JWT_SECRET=replace_with_a_long_random_secret_string_32_chars_min
   JWT_EXPIRES_IN=7d
   CLIENT_ORIGIN=http://localhost:5173
   COOKIE_SECRET=replace_with_a_cookie_secret_string_32_chars_min
   BUG_CHALLENGE_MODE=true
   ```

---

## Section F: Starting the Application

You can start the backend and frontend separately or simultaneously:

### Option 1: Start Concurrently (Recommended)
From the root directory:
```bash
npm run dev
```

### Option 2: Start in Separate Terminals
**Terminal 1 (Backend Server):**
```bash
npm run dev:server
# Server starts at http://localhost:5000
# Expected output: [DATABASE] Connected to MongoDB: localhost/smartspend
```

**Terminal 2 (Frontend Client):**
```bash
npm run dev:client
# Vite client starts at http://localhost:5173
```

### Option 3: Production Mode (Standalone Express)
Build the frontend and run the Express server to serve both backend and frontend:
```bash
npm run build
npm start
# Visit http://localhost:5000 in your browser!
```

---

## Section G: Verification & Health Check

Open your browser or run curl to test the server health:
```bash
curl http://localhost:5000/api/health
```

Expected JSON response:
```json
{
  "status": "healthy",
  "timestamp": "2026-10-21T12:00:00.000Z",
  "uptime": 12.34,
  "database": {
    "status": "connected"
  },
  "version": "1.0.0"
}
```

---

## Section H: Seeding Demo Data

To populate your database with sample categories, monthly budgets, and realistic Indian personal finance transactions:

```bash
npm run seed
```

This creates an organizer demo user:
- **Email**: `demo@smartspend.io`
- **Password**: `SmartSpend2026!`

You can use the **"Use Demo Organizer Credentials"** button on the Sign In page for instant one-click login!

---

## Section I: Troubleshooting Guide

| Issue | Likely Cause | Solution |
|---|---|---|
| `[DATABASE ERROR] Failed to connect to MongoDB` | MongoDB is not running locally, or Atlas IP is blocked. | Verify local MongoDB status with `mongosh` or check IP whitelist in MongoDB Atlas Network Access (`0.0.0.0/0`). |
| `EADDRINUSE: address already in use :::5000` | Another process is using port 5000. | Change `PORT=5001` in `server/.env` or kill the existing process: `lsof -i :5000` then `kill -9 <PID>`. |
| `CORS Error in Browser Console` | Client origin does not match backend configuration. | Verify `CLIENT_ORIGIN=http://localhost:5173` in `server/.env`. |
| `401 Unauthorized on API calls` | Session expired or token missing. | Clear browser cookies, log in again, or ensure cookies are permitted. |
| `Cannot find module 'express'` | Dependencies were not installed in `server/`. | Run `npm --prefix server install`. |
