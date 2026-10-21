const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const mongoose = require('mongoose');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_for_automated_testing_key_12345';
process.env.MONGODB_URI = 'mongodb://localhost:27017/smartspend_test_reports';

const app = require('../app');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

let token;
let userId;

test.before(async () => {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
  await User.deleteMany({});
  await Transaction.deleteMany({});

  const userRes = await request(app).post('/api/auth/register').send({
    name: 'Reports Tester',
    email: 'reports@smartspend.test',
    password: 'Password123!'
  });
  token = userRes.body.token;
  userId = userRes.body.user.id;

  // Insert known records for Oct 2026
  await Transaction.create({
    userId,
    title: 'Salary Oct',
    type: 'income',
    amount: 100000,
    category: 'Salary',
    transactionDate: new Date('2026-10-01T10:00:00Z')
  });

  await Transaction.create({
    userId,
    title: 'Grocery Store',
    type: 'expense',
    amount: 10000,
    category: 'Groceries',
    transactionDate: new Date('2026-10-10T12:00:00Z')
  });

  await Transaction.create({
    userId,
    title: 'Electricity Bill',
    type: 'expense',
    amount: 5000,
    category: 'Bills',
    transactionDate: new Date('2026-10-15T15:00:00Z')
  });
});

test.after(async () => {
  await User.deleteMany({});
  await Transaction.deleteMany({});
  await mongoose.disconnect();
});

test('REPORTS: Monthly financial analytics report generation', async (t) => {
  const res = await request(app)
    .get('/api/reports/monthly?month=10&year=2026')
    .set('Authorization', `Bearer ${token}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);

  const { summary, categories, dailyTrends } = res.body.data;
  assert.strictEqual(summary.totalIncome, 100000);
  assert.strictEqual(summary.totalExpenses, 15000);
  assert.strictEqual(summary.savings, 85000);
  assert.strictEqual(summary.savingsRate, 85); // 85,000 / 100,000 * 100 = 85%
  assert.strictEqual(summary.totalTransactions, 3);

  assert.ok(Array.isArray(categories));
  assert.strictEqual(categories.length, 2);
  assert.ok(Array.isArray(dailyTrends));
  assert.strictEqual(dailyTrends.length, 31); // October has 31 days
});

test('REPORTS: Category breakdown report', async (t) => {
  const res = await request(app)
    .get('/api/reports/categories?startDate=2026-10-01&endDate=2026-10-31')
    .set('Authorization', `Bearer ${token}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.totalAmount, 15000);
  assert.strictEqual(res.body.data.categories.length, 2);
});
