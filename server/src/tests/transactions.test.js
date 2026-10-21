const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const mongoose = require('mongoose');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_for_automated_testing_key_12345';
process.env.MONGODB_URI = 'mongodb://localhost:27017/smartspend_test_tx';

const app = require('../app');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

let tokenUserA;
let userAId;
let tokenUserB;
let userBId;
let sampleTxId;

test.before(async () => {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
  await User.deleteMany({});
  await Transaction.deleteMany({});

  // Create User A
  const resA = await request(app).post('/api/auth/register').send({
    name: 'User A',
    email: 'usera@smartspend.test',
    password: 'Password123!'
  });
  tokenUserA = resA.body.token;
  userAId = resA.body.user.id;

  // Create User B
  const resB = await request(app).post('/api/auth/register').send({
    name: 'User B',
    email: 'userb@smartspend.test',
    password: 'Password123!'
  });
  tokenUserB = resB.body.token;
  userBId = resB.body.user.id;
});

test.after(async () => {
  await User.deleteMany({});
  await Transaction.deleteMany({});
  await mongoose.disconnect();
});

test('TRANSACTIONS: Create income transaction', async (t) => {
  const res = await request(app)
    .post('/api/transactions')
    .set('Authorization', `Bearer ${tokenUserA}`)
    .send({
      title: 'October Salary',
      type: 'income',
      amount: 75000,
      category: 'Salary',
      transactionDate: '2026-10-01',
      paymentMethod: 'Net Banking'
    });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.amount, 75000);
  assert.strictEqual(res.body.data.type, 'income');
  sampleTxId = res.body.data._id;
});

test('TRANSACTIONS: Create expense transaction', async (t) => {
  const res = await request(app)
    .post('/api/transactions')
    .set('Authorization', `Bearer ${tokenUserA}`)
    .send({
      title: 'Grocery Store Run',
      type: 'expense',
      amount: 3250.50,
      category: 'Groceries',
      transactionDate: '2026-10-05',
      paymentMethod: 'UPI'
    });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.amount, 3250.50);
  assert.strictEqual(res.body.data.type, 'expense');
});

test('TRANSACTIONS: User Data Isolation - User B cannot view User A transaction', async (t) => {
  const res = await request(app)
    .get(`/api/transactions/${sampleTxId}`)
    .set('Authorization', `Bearer ${tokenUserB}`);

  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.body.success, false);
});

test('TRANSACTIONS: User Data Isolation - User B cannot edit User A transaction', async (t) => {
  const res = await request(app)
    .patch(`/api/transactions/${sampleTxId}`)
    .set('Authorization', `Bearer ${tokenUserB}`)
    .send({ title: 'Hacked Title' });

  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.body.success, false);
});

test('TRANSACTIONS: Update transaction amount and title', async (t) => {
  const res = await request(app)
    .patch(`/api/transactions/${sampleTxId}`)
    .set('Authorization', `Bearer ${tokenUserA}`)
    .send({
      title: 'October Salary + Performance Bonus',
      amount: 85000
    });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.amount, 85000);
  assert.strictEqual(res.body.data.title, 'October Salary + Performance Bonus');
});

test('TRANSACTIONS: Reject negative amounts', async (t) => {
  const res = await request(app)
    .post('/api/transactions')
    .set('Authorization', `Bearer ${tokenUserA}`)
    .send({
      title: 'Negative Amount Tx',
      type: 'expense',
      amount: -500,
      category: 'Groceries'
    });

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
});

test('TRANSACTIONS: Reject invalid transaction date', async (t) => {
  const res = await request(app)
    .post('/api/transactions')
    .set('Authorization', `Bearer ${tokenUserA}`)
    .send({
      title: 'Bad Date Tx',
      type: 'expense',
      amount: 250,
      category: 'Groceries',
      transactionDate: 'invalid-date-string'
    });

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
});

test('TRANSACTIONS: Filter transactions by type and category', async (t) => {
  const res = await request(app)
    .get('/api/transactions?type=expense&category=Groceries')
    .set('Authorization', `Bearer ${tokenUserA}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.data.every((tx) => tx.type === 'expense' && tx.category === 'Groceries'));
});

test('TRANSACTIONS: Delete transaction', async (t) => {
  const res = await request(app)
    .delete(`/api/transactions/${sampleTxId}`)
    .set('Authorization', `Bearer ${tokenUserA}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);

  // Confirm deleted
  const check = await Transaction.findById(sampleTxId);
  assert.strictEqual(check, null);
});
