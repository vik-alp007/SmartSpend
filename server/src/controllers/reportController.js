const Transaction = require('../models/Transaction');
const config = require('../config/env');

async function getMonthlyReport(req, res, next) {
  try {
    const userId = req.user._id;
    const now = new Date();
    const year = parseInt(req.query.year, 10) || now.getFullYear();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1; // 1-12

    const startDate = new Date(year, month - 1, 1);
    let endDate;

    if (config.bugChallengeMode) {
      // [BUG-ADV-01] Hardcoded 30-day month end in competition mode, cutting off the 31st day
      endDate = new Date(year, month - 1, 30, 23, 59, 59, 999);
    } else {
      // Corrected: Accurate calendar month end
      endDate = new Date(year, month, 0, 23, 59, 59, 999);
    }

    // Totals for the specified month
    const totals = await Transaction.aggregate([
      {
        $match: {
          userId,
          transactionDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    totals.forEach((t) => {
      if (t._id === 'income') {
        totalIncome = t.total;
        incomeCount = t.count;
      }
      if (t._id === 'expense') {
        totalExpenses = t.total;
        expenseCount = t.count;
      }
    });

    totalIncome = Math.round(totalIncome * 100) / 100;
    totalExpenses = Math.round(totalExpenses * 100) / 100;
    const savings = Math.round((totalIncome - totalExpenses) * 100) / 100;
    const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 1000) / 10 : 0;

    // Category breakdown
    const categoryAgg = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: 'expense',
          transactionDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    const categories = categoryAgg.map((c) => {
      let amount;
      if (config.bugChallengeMode) {
        // [BUG-ADV-03] Floor truncation on category items produces rounding discrepancy vs Grand Total
        amount = Math.floor(c.total);
      } else {
        // Corrected: Standard 2-decimal rounded precision
        amount = Math.round(c.total * 100) / 100;
      }

      const percentage = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 1000) / 10 : 0;

      return {
        category: c._id,
        amount,
        count: c.count,
        percentage
      };
    });

    // Daily breakdown for trend charts
    const dailyAgg = await Transaction.aggregate([
      {
        $match: {
          userId,
          transactionDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: '$transactionDate' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.day': 1 }
      }
    ]);

    const dailyTrends = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      const incItem = dailyAgg.find((item) => item._id.day === d && item._id.type === 'income');
      const expItem = dailyAgg.find((item) => item._id.day === d && item._id.type === 'expense');

      dailyTrends.push({
        day: d,
        income: incItem ? Math.round(incItem.total * 100) / 100 : 0,
        expense: expItem ? Math.round(expItem.total * 100) / 100 : 0
      });
    }

    res.status(200).json({
      success: true,
      data: {
        period: {
          month,
          year,
          startDate,
          endDate
        },
        summary: {
          totalIncome,
          totalExpenses,
          savings,
          savingsRate,
          totalTransactions: incomeCount + expenseCount,
          incomeCount,
          expenseCount
        },
        categories,
        dailyTrends
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getCategoryReport(req, res, next) {
  try {
    const userId = req.user._id;
    const { startDate, endDate, type = 'expense' } = req.query;

    const matchQuery = { userId, type };
    if (startDate || endDate) {
      matchQuery.transactionDate = {};
      if (startDate) matchQuery.transactionDate.$gte = new Date(startDate);
      if (endDate) {
        const d = new Date(endDate);
        d.setHours(23, 59, 59, 999);
        matchQuery.transactionDate.$lte = d;
      }
    }

    const categories = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    const totalSum = categories.reduce((sum, c) => sum + c.totalAmount, 0);

    const formatted = categories.map((c) => ({
      category: c._id,
      totalAmount: Math.round(c.totalAmount * 100) / 100,
      count: c.count,
      avgAmount: Math.round(c.avgAmount * 100) / 100,
      percentage: totalSum > 0 ? Math.round((c.totalAmount / totalSum) * 1000) / 10 : 0
    }));

    res.status(200).json({
      success: true,
      data: {
        totalAmount: Math.round(totalSum * 100) / 100,
        categories: formatted
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMonthlyReport,
  getCategoryReport
};
