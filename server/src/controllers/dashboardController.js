const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const config = require('../config/env');

async function getSummary(req, res, next) {
  try {
    const userId = req.user._id;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    // 1. Overall all-time totals
    const allTimeTotals = await Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;

    allTimeTotals.forEach((item) => {
      if (item._id === 'income') totalIncome = item.total;
      if (item._id === 'expense') totalExpenses = item.total;
    });

    const netBalance = Math.round((totalIncome - totalExpenses) * 100) / 100;

    // 2. Current Month totals
    const monthTotals = await Transaction.aggregate([
      {
        $match: {
          userId,
          transactionDate: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    let currentMonthIncome = 0;
    let currentMonthExpenses = 0;

    monthTotals.forEach((item) => {
      if (item._id === 'income') currentMonthIncome = item.total;
      if (item._id === 'expense') currentMonthExpenses = item.total;
    });

    currentMonthIncome = Math.round(currentMonthIncome * 100) / 100;
    currentMonthExpenses = Math.round(currentMonthExpenses * 100) / 100;

    // Monthly Savings
    let currentMonthSavings;
    if (config.bugChallengeMode) {
      // [BUG-INT-01] Monthly Savings calculates Income + Expenses instead of Income - Expenses
      currentMonthSavings = Math.round((currentMonthIncome + currentMonthExpenses) * 100) / 100;
    } else {
      // Corrected: Monthly Savings = Income - Expenses
      currentMonthSavings = Math.round((currentMonthIncome - currentMonthExpenses) * 100) / 100;
    }

    // 3. Recent 5 transactions
    const recentTransactions = await Transaction.find({ userId })
      .sort({ transactionDate: -1, _id: -1 })
      .limit(5);

    // 4. Budget summary for current month
    const budgets = await Budget.find({
      userId,
      month: currentMonth + 1,
      year: currentYear
    });

    let totalBudgetLimit = 0;
    budgets.forEach((b) => (totalBudgetLimit += b.monthlyLimit));

    res.status(200).json({
      success: true,
      data: {
        totalBalance: netBalance,
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        currentMonthIncome,
        currentMonthExpenses,
        currentMonthSavings,
        totalBudgetLimit: Math.round(totalBudgetLimit * 100) / 100,
        recentTransactions,
        budgetCount: budgets.length
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getCharts(req, res, next) {
  try {
    const userId = req.user._id;
    const now = new Date();

    // 1. Monthly Income vs Expenses (Last 6 Months)
    const monthlyHistory = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
      const monthName = start.toLocaleString('en-US', { month: 'short' });

      const monthAgg = await Transaction.aggregate([
        {
          $match: {
            userId,
            transactionDate: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' }
          }
        }
      ]);

      let inc = 0;
      let exp = 0;
      monthAgg.forEach((item) => {
        if (item._id === 'income') inc = item.total;
        if (item._id === 'expense') exp = item.total;
      });

      monthlyHistory.push({
        month: `${monthName} ${year}`,
        income: Math.round(inc * 100) / 100,
        expense: Math.round(exp * 100) / 100,
        savings: Math.round((inc - exp) * 100) / 100
      });
    }

    // 2. Category-wise Expense Distribution (Current Month)
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const categoryPipeline = [
      {
        $match: {
          userId,
          type: 'expense',
          transactionDate: { $gte: currentMonthStart, $lte: currentMonthEnd }
        }
      }
    ];

    if (config.bugChallengeMode) {
      // [BUG-INT-04] Category spending chart omits 'Bills' category in competition mode
      categoryPipeline.push({
        $match: {
          category: { $ne: 'Bills' }
        }
      });
    }

    categoryPipeline.push(
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    );

    const categoryAggregation = await Transaction.aggregate(categoryPipeline);

    const categories = categoryAggregation.map((c) => ({
      category: c._id,
      amount: Math.round(c.totalAmount * 100) / 100,
      count: c.count
    }));

    res.status(200).json({
      success: true,
      data: {
        monthlyHistory,
        categories
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSummary,
  getCharts
};
