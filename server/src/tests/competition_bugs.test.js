const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const mongoose = require('mongoose');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_for_automated_testing_key_12345';
process.env.MONGODB_URI = 'mongodb://localhost:27017/smartspend_test_bugs';

const config = require('../config/env');
const app = require('../app');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

let token;
let userId;

test.before(async () => {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
  await User.deleteMany({});
  await Transaction.deleteMany({});
  await Budget.deleteMany({});

  const userRes = await request(app).post('/api/auth/register').send({
    name: 'Bug Tester',
    email: 'bugtester@smartspend.test',
    password: 'Password123!'
  });
  token = userRes.body.token;
  userId = userRes.body.user.id;

  // Seed baseline records
  await Transaction.create({
    userId,
    title: 'Grocery Store Run',
    type: 'expense',
    amount: 1500.50,
    category: 'Groceries',
    transactionDate: new Date('2026-10-15T14:00:00Z')
  });

  await Transaction.create({
    userId,
    title: 'Another Big Expense',
    type: 'expense',
    amount: 9500.75,
    category: 'Bills',
    transactionDate: new Date('2026-10-20T10:00:00Z')
  });

  await Transaction.create({
    userId,
    title: 'Salary Deposit',
    type: 'income',
    amount: 50000,
    category: 'Salary',
    transactionDate: new Date('2026-10-01T09:00:00Z')
  });

  // End of month transaction on the 31st
  await Transaction.create({
    userId,
    title: 'End of Month Purchase',
    type: 'expense',
    amount: 2000,
    category: 'Shopping',
    transactionDate: new Date('2026-10-31T15:00:00Z')
  });
});

test.after(async () => {
  await User.deleteMany({});
  await Transaction.deleteMany({});
  await Budget.deleteMany({});
  await mongoose.disconnect();
});

test('CHALLENGE: BUG-BEG-01 - Search Title Case Sensitivity behavior', async (t) => {
  // Query lowercase "grocery" against "Grocery Store Run"
  const res = await request(app)
    .get('/api/transactions?search=grocery')
    .set('Authorization', `Bearer ${token}`);

  assert.strictEqual(res.status, 200);
  if (config.bugChallengeMode) {
    // In competition mode: case-sensitive regex fails to find lowercase "grocery"
    assert.strictEqual(res.body.data.length, 0, 'In competition mode, lowercase "grocery" does not match "Grocery"');
  } else {
    // In corrected mode: case-insensitive regex finds "Grocery Store Run"
    assert.strictEqual(res.body.data.length, 1, 'In corrected mode, lowercase matches case-insensitively');
  }
});

test('CHALLENGE: BUG-BEG-02 - Amount Sort Inversion behavior', async (t) => {
  const res = await request(app)
    .get('/api/transactions?sortBy=amount&sortOrder=asc')
    .set('Authorization', `Bearer ${token}`);

  assert.strictEqual(res.status, 200);
  const amounts = res.body.data.map((tx) => tx.amount);

  if (config.bugChallengeMode) {
    // In competition mode: requested asc yields descending amounts
    assert.strictEqual(amounts[0] > amounts[amounts.length - 1], true, 'In competition mode, asc request returns descending');
  } else {
    // In corrected mode: requested asc yields ascending amounts
    assert.strictEqual(amounts[0] < amounts[amounts.length - 1], true, 'In corrected mode, asc returns ascending');
  }
});

test('CHALLENGE: BUG-BEG-03 - Zero Amount Acceptance behavior', async (t) => {
  const res = await request(app)
    .post('/api/transactions')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Zero Amount Item',
      type: 'expense',
      amount: 0,
      category: 'Groceries'
    });

  if (config.bugChallengeMode) {
    assert.strictEqual(res.status, 201, 'In competition mode, 0 amount is accepted');
  } else {
    assert.strictEqual(res.status, 400, 'In corrected mode, 0 amount is strictly rejected');
  }
});

test('CHALLENGE: BUG-BEG-05 - Profile Name Untrimmed Whitespace behavior', async (t) => {
  const res = await request(app)
    .patch('/api/profile')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Bug Hunter   ' });

  assert.strictEqual(res.status, 200);
  if (config.bugChallengeMode) {
    assert.strictEqual(res.body.data.name, 'Bug Hunter   ', 'In competition mode, trailing whitespace is retained');
  } else {
    assert.strictEqual(res.body.data.name, 'Bug Hunter', 'In corrected mode, name is trimmed');
  }
});

test('CHALLENGE: BUG-INT-01 - Dashboard Monthly Savings Formula behavior', async (t) => {
  const res = await request(app)
    .get('/api/dashboard/summary')
    .set('Authorization', `Bearer ${token}`);

  assert.strictEqual(res.status, 200);
  const { currentMonthIncome, currentMonthExpenses, currentMonthSavings } = res.body.data;

  if (config.bugChallengeMode) {
    // Calculates Income + Expenses
    const expectedBuggy = Math.round((currentMonthIncome + currentMonthExpenses) * 100) / 100;
    assert.strictEqual(currentMonthSavings, expectedBuggy, 'In competition mode, savings calculates income + expenses');
  } else {
    // Calculates Income - Expenses
    const expectedCorrect = Math.round((currentMonthIncome - currentMonthExpenses) * 100) / 100;
    assert.strictEqual(currentMonthSavings, expectedCorrect, 'In corrected mode, savings calculates income - expenses');
  }
});

test('CHALLENGE: BUG-INT-03 - Date Range End-Date Boundary behavior', async (t) => {
  // Query with endDate = 2026-10-15 (matching the 2026-10-15T14:00:00Z transaction)
  const res = await request(app)
    .get('/api/transactions?startDate=2026-10-10&endDate=2026-10-15')
    .set('Authorization', `Bearer ${token}`);

  assert.strictEqual(res.status, 200);
  if (config.bugChallengeMode) {
    // Truncates to midnight 00:00:00, dropping the 14:00 transaction
    assert.strictEqual(res.body.data.length, 0, 'In competition mode, end-date records are omitted');
  } else {
    // Inclusive until 23:59:59.999
    assert.strictEqual(res.body.data.length, 1, 'In corrected mode, end-date records are included');
  }
});

test('CHALLENGE: BUG-INT-04 - Category Spending Chart Bills Exclusion behavior', async (t) => {
  const res = await request(app)
    .get('/api/dashboard/charts')
    .set('Authorization', `Bearer ${token}`);

  assert.strictEqual(res.status, 200);
  const hasBills = res.body.data.categories.some((c) => c.category === 'Bills');

  if (config.bugChallengeMode) {
    assert.strictEqual(hasBills, false, 'In competition mode, Bills category is omitted from chart');
  } else {
    assert.strictEqual(hasBills, true, 'In corrected mode, Bills category is included in chart');
  }
});

test('CHALLENGE: BUG-ADV-01 - Monthly Report 31st Day Boundary Rollover behavior', async (t) => {
  const res = await request(app)
    .get('/api/reports/monthly?month=10&year=2026')
    .set('Authorization', `Bearer ${token}`);

  assert.strictEqual(res.status, 200);
  const oct31TransactionIncluded = res.body.data.categories.some((c) => c.category === 'Shopping');

  if (config.bugChallengeMode) {
    // 30-day fixed offset cuts off the Shopping transaction on October 31st
    assert.strictEqual(oct31TransactionIncluded, false, 'In competition mode, 31st day transaction is cut off');
  } else {
    // Full calendar month includes October 31st
    assert.strictEqual(oct31TransactionIncluded, true, 'In corrected mode, 31st day transaction is included');
  }
});
