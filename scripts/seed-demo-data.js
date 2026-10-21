const path = require('path');

// Resolve packages from server/node_modules if not in root
function resolveModule(moduleName) {
  try {
    return require(moduleName);
  } catch (e) {
    return require(path.resolve(__dirname, '../server/node_modules', moduleName));
  }
}

const mongoose = resolveModule('mongoose');
const bcrypt = resolveModule('bcryptjs');
const dotenv = resolveModule('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

const User = require('../server/src/models/User');
const Transaction = require('../server/src/models/Transaction');
const Budget = require('../server/src/models/Budget');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartspend';
const DEMO_EMAIL = process.env.DEMO_USER_EMAIL || 'demo@smartspend.io';
const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || 'SmartSpend2026!';
const DEMO_NAME = 'Alex Sharma';

async function seedData() {
  console.log(`\n==================================================`);
  console.log(`  SmartSpend Demo Data Seeding Utility`);
  console.log(`  Connecting to: ${MONGODB_URI}`);
  console.log(`==================================================\n`);

  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✓ Successfully connected to MongoDB.');

    // 1. Create or retrieve demo user
    let user = await User.findOne({ email: DEMO_EMAIL.toLowerCase().trim() });
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(DEMO_PASSWORD, salt);

      user = await User.create({
        name: DEMO_NAME,
        email: DEMO_EMAIL.toLowerCase().trim(),
        passwordHash,
        currency: 'INR'
      });
      console.log(`✓ Created demo user: ${DEMO_EMAIL}`);
    } else {
      console.log(`✓ Found existing demo user: ${DEMO_EMAIL}`);
    }

    const userId = user._id;

    // 2. Clean previous demo transactions & budgets for idempotency
    await Transaction.deleteMany({ userId });
    await Budget.deleteMany({ userId });
    console.log('✓ Cleaned previous records for demo user.');

    // 3. Create demo monthly budgets for October 2026
    const currentMonth = 10;
    const currentYear = 2026;

    const sampleBudgets = [
      { category: 'Groceries', monthlyLimit: 12000, month: currentMonth, year: currentYear },
      { category: 'Dining Out', monthlyLimit: 6000, month: currentMonth, year: currentYear },
      { category: 'Bills', monthlyLimit: 5000, month: currentMonth, year: currentYear },
      { category: 'Rent', monthlyLimit: 25000, month: currentMonth, year: currentYear },
      { category: 'Travel', monthlyLimit: 5000, month: currentMonth, year: currentYear },
      { category: 'Shopping', monthlyLimit: 8000, month: currentMonth, year: currentYear },
      { category: 'Health', monthlyLimit: 3000, month: currentMonth, year: currentYear },
      { category: 'Entertainment', monthlyLimit: 2500, month: currentMonth, year: currentYear }
    ];

    await Budget.insertMany(sampleBudgets.map((b) => ({ ...b, userId })));
    console.log(`✓ Seeded ${sampleBudgets.length} category budgets for 10/2026.`);

    // 4. Create realistic transactions
    const sampleTransactions = [
      // Incomes
      {
        userId,
        title: 'Monthly Tech Salary - Acquired Oct',
        type: 'income',
        amount: 85000,
        category: 'Salary',
        transactionDate: new Date('2026-10-01T09:30:00Z'),
        paymentMethod: 'Net Banking',
        notes: 'Monthly direct salary transfer from tech employer'
      },
      {
        userId,
        title: 'Freelance React Dashboard Project',
        type: 'income',
        amount: 28500,
        category: 'Freelancing',
        transactionDate: new Date('2026-10-12T14:15:00Z'),
        paymentMethod: 'UPI',
        notes: 'Milestone payment for client web portal'
      },
      {
        userId,
        title: 'Mutual Fund Dividend Payout',
        type: 'income',
        amount: 3200,
        category: 'Investments',
        transactionDate: new Date('2026-10-18T11:00:00Z'),
        paymentMethod: 'Net Banking',
        notes: 'Quarterly index fund dividend distribution'
      },

      // Expenses - Groceries
      {
        userId,
        title: 'D-Mart Monthly Grocery Basket',
        type: 'expense',
        amount: 4850.50,
        category: 'Groceries',
        transactionDate: new Date('2026-10-03T16:45:00Z'),
        paymentMethod: 'Credit Card',
        notes: 'Provisions, grains, oils, and home cleaning supplies'
      },
      {
        userId,
        title: 'Blinkit Instant Fresh Produce',
        type: 'expense',
        amount: 890.25,
        category: 'Groceries',
        transactionDate: new Date('2026-10-08T18:20:00Z'),
        paymentMethod: 'UPI',
        notes: 'Fruits, dairy, and vegetables'
      },
      {
        userId,
        title: 'Zepto Weekly Essentials',
        type: 'expense',
        amount: 1420.00,
        category: 'Groceries',
        transactionDate: new Date('2026-10-15T20:10:00Z'),
        paymentMethod: 'UPI',
        notes: 'Morning groceries and snacks'
      },

      // Expenses - Rent & Bills
      {
        userId,
        title: 'Apartment Monthly Rent',
        type: 'expense',
        amount: 24000,
        category: 'Rent',
        transactionDate: new Date('2026-10-02T10:00:00Z'),
        paymentMethod: 'Net Banking',
        notes: 'Transfer to landlord for 2BHK rental'
      },
      {
        userId,
        title: 'Electricity Bill (Bescom)',
        type: 'expense',
        amount: 1850.75,
        category: 'Bills',
        transactionDate: new Date('2026-10-06T12:00:00Z'),
        paymentMethod: 'UPI',
        notes: 'September power billing'
      },
      {
        userId,
        title: 'Airtel Fiber Broadband Plan',
        type: 'expense',
        amount: 1179.00,
        category: 'Bills',
        transactionDate: new Date('2026-10-07T14:30:00Z'),
        paymentMethod: 'Credit Card',
        notes: '200 Mbps unlimited monthly broadband'
      },
      {
        userId,
        title: 'Mobile Postpaid Recharge',
        type: 'expense',
        amount: 589.00,
        category: 'Bills',
        transactionDate: new Date('2026-10-10T11:00:00Z'),
        paymentMethod: 'UPI',
        notes: 'Monthly cell connection'
      },

      // Expenses - Dining Out
      {
        userId,
        title: 'Dinner at Social Cafe with Friends',
        type: 'expense',
        amount: 2350.00,
        category: 'Dining Out',
        transactionDate: new Date('2026-10-04T21:30:00Z'),
        paymentMethod: 'Debit Card',
        notes: 'Weekend dinner and beverages'
      },
      {
        userId,
        title: 'Swiggy Gourmet Lunch Delivery',
        type: 'expense',
        amount: 680.00,
        category: 'Dining Out',
        transactionDate: new Date('2026-10-11T13:40:00Z'),
        paymentMethod: 'UPI',
        notes: 'Work day lunch order'
      },
      {
        userId,
        title: 'Blue Tokai Specialty Coffee',
        type: 'expense',
        amount: 450.00,
        category: 'Dining Out',
        transactionDate: new Date('2026-10-16T17:15:00Z'),
        paymentMethod: 'UPI',
        notes: 'Afternoon coffee meeting'
      },

      // Expenses - Travel & Commute
      {
        userId,
        title: 'Shell Petrol Station Refill',
        type: 'expense',
        amount: 2400.00,
        category: 'Travel',
        transactionDate: new Date('2026-10-05T08:30:00Z'),
        paymentMethod: 'Credit Card',
        notes: 'Full tank fuel for commute'
      },
      {
        userId,
        title: 'Uber Premier Airport Ride',
        type: 'expense',
        amount: 1250.00,
        category: 'Travel',
        transactionDate: new Date('2026-10-09T06:00:00Z'),
        paymentMethod: 'UPI',
        notes: 'Early morning taxi ride'
      },

      // Expenses - Shopping & Health
      {
        userId,
        title: 'Amazon Festival Electronics & Cables',
        type: 'expense',
        amount: 3499.00,
        category: 'Shopping',
        transactionDate: new Date('2026-10-13T19:00:00Z'),
        paymentMethod: 'Credit Card',
        notes: 'USB-C hub and ergonomic mouse'
      },
      {
        userId,
        title: 'Apollo Pharmacy Vitamins & Cold Meds',
        type: 'expense',
        amount: 980.50,
        category: 'Health',
        transactionDate: new Date('2026-10-14T15:30:00Z'),
        paymentMethod: 'UPI',
        notes: 'Prescription refills'
      },
      {
        userId,
        title: 'End of Month Electronics (Oct 31)',
        type: 'expense',
        amount: 1500.00,
        category: 'Shopping',
        transactionDate: new Date('2026-10-31T18:00:00Z'),
        paymentMethod: 'UPI',
        notes: 'Purchased on the 31st of October'
      },

      // Previous Month (September 2026) for trend comparison
      {
        userId,
        title: 'Monthly Tech Salary - Sept',
        type: 'income',
        amount: 85000,
        category: 'Salary',
        transactionDate: new Date('2026-09-01T09:30:00Z'),
        paymentMethod: 'Net Banking'
      },
      {
        userId,
        title: 'September Apartment Rent',
        type: 'expense',
        amount: 24000,
        category: 'Rent',
        transactionDate: new Date('2026-09-02T10:00:00Z'),
        paymentMethod: 'Net Banking'
      },
      {
        userId,
        title: 'September Total Groceries Aggregated',
        type: 'expense',
        amount: 8400,
        category: 'Groceries',
        transactionDate: new Date('2026-09-15T12:00:00Z'),
        paymentMethod: 'Credit Card'
      },
      {
        userId,
        title: 'September Dining Out Aggregated',
        type: 'expense',
        amount: 4200,
        category: 'Dining Out',
        transactionDate: new Date('2026-09-20T20:00:00Z'),
        paymentMethod: 'UPI'
      }
    ];

    await Transaction.insertMany(sampleTransactions);
    console.log(`✓ Seeded ${sampleTransactions.length} sample transactions.`);

    console.log(`\n==================================================`);
    console.log(`  Demo Seeding Complete!`);
    console.log(`  Email:    ${DEMO_EMAIL}`);
    console.log(`  Password: ${DEMO_PASSWORD}`);
    console.log(`==================================================\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedData();
