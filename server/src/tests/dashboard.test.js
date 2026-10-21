const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const mongoose = require('mongoose');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_for_automated_testing_key_12345';
process.env.MONGODB_URI = 'mongodb://localhost:27017/smartspend_test_dash';

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
    name: 'Dashboard Tester',
    email: 'dash@smartspend.test',
    password: 'Password123!'
  });
  token = userRes.body.token;
  userId = userRes.body.user.id;

  const now = new Date();
  const currentMonthDate = new Date(now.getFullYear(), now.getMonth(), 10);

  // Incomes
  await Transaction.create({
    userId,
    title: 'Salary',
    type: 'income',
    amount: 50000,
    category: 'Salary',
    transactionDate: currentMonthDate
  });

  // Expenses
  await Transaction.create({
    userId,
    title: 'Rent',
    type: 'expense',
    amount: 15000,
    category: 'Rent',
    transactionDate: currentMonthDate
  });
  await Transaction.create({
    userId,
    title: 'Groceries',
    type: 'expense',
    amount: 5000,
    category: 'Groceries',
    transactionDate: currentMonthDate
  });
});

test.after(async () => {
  await User.deleteMany({});
  await Transaction.deleteMany({});
  await mongoose.disconnect();
});

test('DASHBOARD: Authoritative Net Balance and Totals calculation', async (t) => {
  const res = await request(app)
    .get('/api/dashboard/summary')
    .set('Authorization', `Bearer ${token}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);

  const data = res.body.data;
  assert.strictEqual(data.totalIncome, 50000);
  assert.strictEqual(data.totalExpenses, 20000);
  // Net Balance = 50000 - 20000 = 30000
  assert.strictEqual(data.totalBalance, 30000);
  assert.strictEqual(data.currentMonthIncome, 50000);
  assert.strictEqual(data.currentMonthExpenses, 20000);
  assert.strictEqual(data.recentTransactions.length, 3);
});

test('DASHBOARD: Charts data retrieval (Monthly history & Category breakdown)', async (t) => {
  const res = await request(app)
    .get('/api/dashboard/charts')
    .set('Authorization', `Bearer ${token}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data.monthlyHistory));
  assert.ok(Array.isArray(res.body.data.categories));
  assert.strictEqual(res.body.data.monthlyHistory.length, 6);
});
