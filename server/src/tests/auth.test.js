const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const mongoose = require('mongoose');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_for_automated_testing_key_12345';
process.env.MONGODB_URI = 'mongodb://localhost:27017/smartspend_test_auth';

const app = require('../app');
const User = require('../models/User');

test.before(async () => {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
  await User.deleteMany({});
});

test.after(async () => {
  await User.deleteMany({});
  await mongoose.disconnect();
});

test('AUTH: User Registration - success and password hashing', async (t) => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test Hunter',
      email: 'hunter@smartspend.test',
      password: 'StrongPassword123!',
      currency: 'INR'
    });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.user.email, 'hunter@smartspend.test');
  assert.ok(res.body.token, 'Token should be returned');
  assert.strictEqual(res.body.user.passwordHash, undefined, 'Password hash must be excluded');

  // Verify DB directly
  const dbUser = await User.findOne({ email: 'hunter@smartspend.test' });
  assert.ok(dbUser);
  assert.notStrictEqual(dbUser.passwordHash, 'StrongPassword123!', 'Password must be hashed');
});

test('AUTH: Duplicate email registration rejection', async (t) => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Duplicate Hunter',
      email: 'hunter@smartspend.test',
      password: 'AnotherPassword123!'
    });

  assert.strictEqual(res.status, 409);
  assert.strictEqual(res.body.success, false);
});

test('AUTH: Login with valid credentials returns token and session cookie', async (t) => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'hunter@smartspend.test',
      password: 'StrongPassword123!'
    });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.token);

  // Check Set-Cookie header contains token
  const cookies = res.headers['set-cookie'];
  assert.ok(cookies);
  assert.ok(cookies.some((c) => c.includes('token=')));
});

test('AUTH: Login with invalid password fails with 401', async (t) => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'hunter@smartspend.test',
      password: 'WrongPassword!'
    });

  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.success, false);
});

test('AUTH: Protected route rejected without token', async (t) => {
  const res = await request(app).get('/api/auth/me');
  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.success, false);
});

test('AUTH: Protected route access with valid Bearer token', async (t) => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'hunter@smartspend.test',
      password: 'StrongPassword123!'
    });

  const token = loginRes.body.token;

  const res = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${token}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.user.email, 'hunter@smartspend.test');
});

test('AUTH: Logout clears authentication cookie', async (t) => {
  const res = await request(app).post('/api/auth/logout');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);

  const cookies = res.headers['set-cookie'];
  assert.ok(cookies);
  assert.ok(cookies.some((c) => c.includes('token=;')));
});
