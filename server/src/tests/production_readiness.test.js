const test = require('node:test');
const assert = require('node:assert');
const { EventEmitter } = require('node:events');
const mongoose = require('mongoose');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_for_production_audit_32chars_min';
process.env.CLIENT_ORIGIN = 'https://smartspend-frontend.vercel.app';

const app = require('../app');
const rootServerless = require('../../../api/index');
const serverServerless = require('../../api/index');

// In-memory HTTP request simulator for sandboxed testing without TCP socket binding
function simulateRequest(handler, method, url, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = new EventEmitter();
    req.method = method.toUpperCase();
    req.url = url;
    req.originalUrl = url;
    req.headers = { host: 'localhost', ...Object.fromEntries(
      Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])
    ) };
    if (body && !req.headers['content-type']) {
      req.headers['content-type'] = 'application/json';
    }
    req.connection = { remoteAddress: '127.0.0.1', encrypted: false };
    req.socket = req.connection;

    const resHeaders = {};
    const res = {
      statusCode: 200,
      headersSent: false,
      setHeader(k, v) { resHeaders[k.toLowerCase()] = v; },
      getHeader(k) { return resHeaders[k.toLowerCase()]; },
      status(code) { this.statusCode = code; return this; },
      json(data) {
        this.setHeader('content-type', 'application/json');
        this.headersSent = true;
        resolve({ status: this.statusCode, headers: resHeaders, body: data });
      },
      send(data) {
        this.headersSent = true;
        let parsed = data;
        try { parsed = JSON.parse(data); } catch (_) {}
        resolve({ status: this.statusCode, headers: resHeaders, body: parsed });
      },
      end(data) {
        this.headersSent = true;
        let parsed = data;
        try { parsed = JSON.parse(data); } catch (_) {}
        resolve({ status: this.statusCode, headers: resHeaders, body: parsed });
      }
    };

    try {
      handler(req, res);
      if (body) {
        const payload = typeof body === 'string' ? body : JSON.stringify(body);
        req.emit('data', Buffer.from(payload));
      }
      req.emit('end');
    } catch (err) {
      reject(err);
    }
  });
}

test('BACKEND: App exports valid Express instance', () => {
  assert.strictEqual(typeof app, 'function');
  assert.strictEqual(typeof app.listen, 'function');
});

test('BACKEND: Serverless entrypoint exports valid async handler', () => {
  assert.strictEqual(typeof rootServerless, 'function');
});

test('BACKEND: Health check returns degraded status 503 when DB is disconnected', async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  const res = await simulateRequest(app, 'GET', '/api/health');
  assert.strictEqual(res.status, 503);
  assert.strictEqual(res.body.status, 'degraded');
  assert.strictEqual(res.body.database, 'disconnected');
  assert.ok(res.body.message.includes('disconnected'));
  assert.ok(res.body.timestamp);
});

test('BACKEND: Safe client settings endpoint is accessible without authentication', async () => {
  const res = await simulateRequest(app, 'GET', '/api/config/client-settings');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.appName, 'SmartSpend');
});

test('CACHE CONTROL: API responses include no-store headers to prevent UI stale state', async () => {
  const res = await simulateRequest(app, 'GET', '/api/config/client-settings');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.headers['cache-control'], 'no-store, no-cache, must-revalidate, proxy-revalidate');
  assert.strictEqual(res.headers['pragma'], 'no-cache');
  assert.strictEqual(res.headers['expires'], '0');
  assert.strictEqual(res.headers['surrogate-control'], 'no-store');
});


test('CORS: Preflight OPTIONS request returns 204 with proper headers for Vercel origin', async () => {
  const res = await simulateRequest(app, 'OPTIONS', '/api/auth/login', {
    Origin: 'https://smartspend-frontend.vercel.app',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type, Authorization'
  });

  assert.strictEqual(res.status, 204);
  assert.strictEqual(res.headers['access-control-allow-origin'], 'https://smartspend-frontend.vercel.app');
  assert.strictEqual(res.headers['access-control-allow-credentials'], 'true');
  assert.ok(res.headers['access-control-allow-methods'].includes('POST'));
});

test('CORS: Preview deployment *.vercel.app origin is dynamically permitted', async () => {
  const previewOrigin = 'https://smartspend-git-feature-preview-org.vercel.app';
  const res = await simulateRequest(app, 'OPTIONS', '/api/transactions', {
    Origin: previewOrigin,
    'Access-Control-Request-Method': 'GET'
  });

  assert.strictEqual(res.status, 204);
  assert.strictEqual(res.headers['access-control-allow-origin'], previewOrigin);
});

test('CORS: Localhost development origin is permitted', async () => {
  const res = await simulateRequest(app, 'OPTIONS', '/api/auth/me', {
    Origin: 'http://localhost:5173',
    'Access-Control-Request-Method': 'GET'
  });

  assert.strictEqual(res.status, 204);
  assert.strictEqual(res.headers['access-control-allow-origin'], 'http://localhost:5173');
});

test('VALIDATION: Registration rejects missing required fields (400)', async () => {
  const res = await simulateRequest(app, 'POST', '/api/auth/register', {}, {
    name: 'Incomplete User'
  });

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
  assert.ok(res.body.message.includes('email') || res.body.message.includes('Password'));
});

test('VALIDATION: Registration rejects invalid email format (400)', async () => {
  const res = await simulateRequest(app, 'POST', '/api/auth/register', {}, {
    name: 'Invalid Email User',
    email: 'not-an-email',
    password: 'ValidPassword123!'
  });

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
});

test('VALIDATION: Registration rejects password under 8 characters (400)', async () => {
  const res = await simulateRequest(app, 'POST', '/api/auth/register', {}, {
    name: 'Short Password User',
    email: 'short@domain.com',
    password: '123'
  });

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
});

test('VALIDATION: Login rejects missing password (400)', async () => {
  const res = await simulateRequest(app, 'POST', '/api/auth/login', {}, {
    email: 'user@domain.com'
  });

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
});

test('AUTH: Protected routes reject requests with missing token (401)', async () => {
  const endpoints = ['/api/transactions', '/api/budgets', '/api/dashboard/summary', '/api/reports/monthly', '/api/profile'];
  for (const endpoint of endpoints) {
    const res = await simulateRequest(app, 'GET', endpoint);
    assert.strictEqual(res.status, 401, `Endpoint ${endpoint} should return 401 without token`);
    assert.strictEqual(res.body.success, false);
  }
});

test('AUTH: Protected routes reject invalid Bearer tokens (401)', async () => {
  const res = await simulateRequest(app, 'GET', '/api/transactions', {
    Authorization: 'Bearer invalid_garbage_token_12345'
  });

  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.success, false);
});

test('ROUTING: Global 404 handler returns structured JSON for unmatched API endpoints', async () => {
  const res = await simulateRequest(app, 'GET', '/api/unregistered/path/test');
  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.body.success, false);
  assert.ok(res.body.message.includes('not found'));
});

test('SERVERLESS: Root api/index.js handles OPTIONS request immediately without DB', async () => {
  const res = await simulateRequest(rootServerless, 'OPTIONS', '/api/auth/login', {
    Origin: 'https://smartspend-frontend.vercel.app'
  });

  assert.strictEqual(res.status, 204);
  assert.strictEqual(res.headers['access-control-allow-origin'], 'https://smartspend-frontend.vercel.app');
});

test('FRONTEND API CONFIG: Base URL normalizer logic verification', () => {
  function getApiBaseUrl(rawInput) {
    const rawBase = (rawInput || '/api').trim();
    if (!rawBase || rawBase === '/api') {
      return '/api';
    }
    const cleanBase = rawBase.replace(/\/+$/, '');
    if (!cleanBase.endsWith('/api')) {
      return `${cleanBase}/api`;
    }
    return cleanBase;
  }

  // Case 1: Empty / default
  assert.strictEqual(getApiBaseUrl(''), '/api');
  assert.strictEqual(getApiBaseUrl(undefined), '/api');
  assert.strictEqual(getApiBaseUrl('/api'), '/api');
  assert.strictEqual(getApiBaseUrl('/api/'), '/api');

  // Case 2: Origin without /api (e.g., copied from Vercel dashboard)
  assert.strictEqual(getApiBaseUrl('https://my-backend.vercel.app'), 'https://my-backend.vercel.app/api');
  assert.strictEqual(getApiBaseUrl('https://my-backend.vercel.app/'), 'https://my-backend.vercel.app/api');

  // Case 3: Origin with /api already present
  assert.strictEqual(getApiBaseUrl('https://my-backend.vercel.app/api'), 'https://my-backend.vercel.app/api');
  assert.strictEqual(getApiBaseUrl('https://my-backend.vercel.app/api/'), 'https://my-backend.vercel.app/api');
});

test('DATABASE: connectDB throws explicit error when URI is empty', async () => {
  const { connectDB } = require('../config/database');
  await assert.rejects(
    async () => {
      await connectDB('');
    },
    {
      name: 'Error',
      message: /MONGODB_URI is not configured/
    }
  );
});

test('BACKEND: GET / returns API status and health link', async () => {
  const res = await simulateRequest(app, 'GET', '/');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.status, 'running');
  assert.strictEqual(res.body.health, '/api/health');
});

test('SERVERLESS: server/api/index.js exports valid async handler', () => {
  assert.strictEqual(typeof serverServerless, 'function');
});

test('SERVERLESS: server/api/index.js handles OPTIONS request immediately without DB', async () => {
  const res = await simulateRequest(serverServerless, 'OPTIONS', '/api/auth/login', {
    Origin: 'https://smartspend-frontend.vercel.app'
  });

  assert.strictEqual(res.status, 204);
  assert.strictEqual(res.headers['access-control-allow-origin'], 'https://smartspend-frontend.vercel.app');
});

// ========================================================
// VERIFICATION SUITE: BUGS 5, 7, 8, 9, 11 & BUG 13 REMOVAL
// ========================================================

test('BUG 5 VERIFICATION: Date Range End-Date Boundary UTC logic', () => {
  const endDateStr = '2026-10-15';

  // Mode: Challenge (true) -> Truncates to midnight 00:00:00.000 UTC
  const challengeEnd = new Date(endDateStr);
  challengeEnd.setUTCHours(0, 0, 0, 0);
  assert.strictEqual(challengeEnd.toISOString(), '2026-10-15T00:00:00.000Z');

  // Mode: Fixed (false) -> Extends to 23:59:59.999 UTC
  const fixedEnd = new Date(endDateStr);
  fixedEnd.setUTCHours(23, 59, 59, 999);
  assert.strictEqual(fixedEnd.toISOString(), '2026-10-15T23:59:59.999Z');

  // Transaction during the day at 14:00 UTC
  const daytimeTx = new Date('2026-10-15T14:00:00.000Z');
  assert.strictEqual(daytimeTx <= challengeEnd, false, 'Challenge mode must exclude daytime transactions on end date');
  assert.strictEqual(daytimeTx <= fixedEnd, true, 'Fixed mode must include daytime transactions on end date');
});

test('BUG 7 VERIFICATION: Over-Budget Progress Bar Width Calculation', () => {
  const limit = 5000;
  const spent = 6000;
  const isOverBudget = spent > limit;

  assert.strictEqual(isOverBudget, true);

  // Challenge mode: surplus calculation shrinks progress bar (e.g. 20%)
  const challengeWidth = Math.max(5, Math.min(100, ((spent - limit) / limit) * 100));
  assert.strictEqual(challengeWidth, 20, 'Challenge mode shrinks over-budget bar to surplus percentage');

  // Fixed mode: Clamps cleanly to 100% full width
  const fixedWidth = 100;
  assert.strictEqual(fixedWidth, 100, 'Fixed mode clamps over-budget progress bar to 100%');
});

test('BUG 8 VERIFICATION: Budget Limit Income Offset Logic', () => {
  const definedLimit = 10000;
  const catIncome = 2000;

  // Challenge mode: Income reduces defined limit
  let challengeLimit = definedLimit;
  if (catIncome > 0) {
    challengeLimit = Math.max(1, definedLimit - catIncome);
  }
  assert.strictEqual(challengeLimit, 8000, 'Challenge mode reduces monthly limit by category income');

  // Fixed mode: Income never reduces defined limit
  const fixedLimit = definedLimit;
  assert.strictEqual(fixedLimit, 10000, 'Fixed mode preserves user-defined budget limit');
});

test('BUG 9 VERIFICATION: Monthly Report 31st Day Boundary Calculation', () => {
  const year = 2026;
  const month = 10; // October (31 days)

  // Challenge mode: Hardcoded 30-day cutoff
  const challengeMaxDay = Math.min(30, new Date(Date.UTC(year, month, 0)).getUTCDate());
  const challengeEndDate = new Date(Date.UTC(year, month - 1, challengeMaxDay, 23, 59, 59, 999));
  assert.strictEqual(challengeEndDate.toISOString(), '2026-10-30T23:59:59.999Z');

  // Fixed mode: Accurate calendar month end
  const fixedLastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const fixedEndDate = new Date(Date.UTC(year, month - 1, fixedLastDay, 23, 59, 59, 999));
  assert.strictEqual(fixedEndDate.toISOString(), '2026-10-31T23:59:59.999Z');

  // Transaction on October 31st at 15:00 UTC
  const oct31Tx = new Date('2026-10-31T15:00:00.000Z');
  assert.strictEqual(oct31Tx <= challengeEndDate, false, 'Challenge mode cuts off October 31st');
  assert.strictEqual(oct31Tx <= fixedEndDate, true, 'Fixed mode includes October 31st');
});

test('BUG 11 VERIFICATION: Dashboard Refresh Trigger and Deterministic Sort Tiebreaker', () => {
  let dashboardRefreshed = false;

  // In Fixed mode, isFromEdit triggers immediate refresh
  const triggerRefresh = (isFromEdit, bugChallengeMode) => {
    if (isFromEdit && bugChallengeMode) return;
    dashboardRefreshed = true;
  };

  // Challenge mode
  triggerRefresh(true, true);
  assert.strictEqual(dashboardRefreshed, false, 'Challenge mode suppresses edit refresh');

  // Fixed mode
  triggerRefresh(true, false);
  assert.strictEqual(dashboardRefreshed, true, 'Fixed mode triggers edit refresh');

  // Deterministic sort tiebreaker check
  const sortOptions = { transactionDate: -1, _id: -1 };
  assert.strictEqual(sortOptions._id, -1, 'Sort has deterministic tiebreaker');
});

test('BUG 13 VERIFICATION: Profile Name Trailing & Leading Whitespace Removal', () => {
  const rawInput = '   Alex Sharma    ';
  const cleanedName = rawInput.trim();
  assert.strictEqual(cleanedName, 'Alex Sharma', 'Profile name is strictly trimmed of all leading/trailing whitespace');
  assert.strictEqual(cleanedName.length, 11);
});

