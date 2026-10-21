const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const mongoose = require('mongoose');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_for_automated_testing_key_12345';
process.env.MONGODB_URI = 'mongodb://localhost:27017/smartspend_test_budgets';

const app = require('../app');
const User = require('../models/User');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

let token;
let userId;
let budgetId;

test.before(async () => {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
  await User.deleteMany({});
  await Budget.deleteMany({});
  await Transaction.deleteMany({});

  const userRes = await request(app).post('/api/auth/register').send({
    name: 'Budget Tester',
    email: 'budget@smartspend.test',
    password: 'Password123!'
  });
  token = userRes.body.token;
  userId = userRes.body.user.id;
});

test.after(async () => {
  await User.deleteMany({});
  await Budget.deleteMany({});
  await Transaction.deleteMany({});
  await mongoose.disconnect();
});

test('BUDGETS: Create category budget', async (t) => {
  const res = await request(app)
    .post('/api/budgets')
    .set('Authorization', `Bearer ${token}`)
    .send({
      category: 'Dining Out',
      monthlyLimit: 8000,
      month: 10,
      year: 2026
    });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.category, 'Dining Out');
  assert.strictEqual(res.body.data.monthlyLimit, 8000);
  budgetId = res.body.data._id;
});

test('BUDGETS: Duplicate budget rejection for same user, category, month, and year', async (t) => {
  const res = await request(app)
    .post('/api/budgets')
    .set('Authorization', `Bearer ${token}`)
    .send({
      category: 'Dining Out',
      monthlyLimit: 10000,
      month: 10,
      year: 2026
    });

  assert.strictEqual(res.status, 409);
  assert.strictEqual(res.body.success, false);
});

test('BUDGETS: Calculate spend and remaining balance against transactions', async (t) => {
  // Add an expense for Dining Out in Oct 2026
  await Transaction.create({
    userId,
    title: 'Cafe Dinner',
    type: 'expense',
    amount: 3200,
    category: 'Dining Out',
    transactionDate: new Date('2026-10-10T12:00:00Z')
  });

  const res = await request(app)
    .get('/api/budgets?month=10&year=2026')
    .set('Authorization', `Bearer ${token}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));

  const diningBudget = res.body.data.find((b) => b.category === 'Dining Out');
  assert.ok(diningBudget);
  assert.strictEqual(diningBudget.spent, 3200);
  assert.strictEqual(diningBudget.monthlyLimit, 8000);
  assert.strictEqual(diningBudget.remaining, 4800);
  assert.strictEqual(diningBudget.utilizationPercentage, 40);
  assert.strictEqual(diningBudget.isOverBudget, false);
});

test('BUDGETS: Update budget limit', async (t) => {
  const res = await request(app)
    .patch(`/api/budgets/${budgetId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ monthlyLimit: 12000 });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.monthlyLimit, 12000);
});

test('BUDGETS: Delete budget', async (t) => {
  const res = await request(app)
    .delete(`/api/budgets/${budgetId}`)
    .set('Authorization', `Bearer ${token}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);

  const check = await Budget.findById(budgetId);
  assert.strictEqual(check, null);
});
