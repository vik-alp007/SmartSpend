const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const config = require('../config/env');

async function getBudgets(req, res, next) {
  try {
    const userId = req.user._id;
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const budgets = await Budget.find({ userId, month, year }).sort({ category: 1 });

    // Calculate actual spending for each budget's category in that month/year
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        // Find total expense for this category
        const expenseAggregation = await Transaction.aggregate([
          {
            $match: {
              userId,
              type: 'expense',
              category: budget.category,
              transactionDate: { $gte: startOfMonth, $lte: endOfMonth }
            }
          },
          {
            $group: {
              _id: null,
              totalSpent: { $sum: '$amount' }
            }
          }
        ]);

        const spent = expenseAggregation.length > 0 ? Math.round(expenseAggregation[0].totalSpent * 100) / 100 : 0;

        let limit = budget.monthlyLimit;

        if (config.bugChallengeMode) {
          // [BUG-ADV-02] Category income subtracted from budget limit instead of offsetting spent
          const incomeAggregation = await Transaction.aggregate([
            {
              $match: {
                userId,
                type: 'income',
                category: budget.category,
                transactionDate: { $gte: startOfMonth, $lte: endOfMonth }
              }
            },
            {
              $group: {
                _id: null,
                totalIncome: { $sum: '$amount' }
              }
            }
          ]);

          const catIncome = incomeAggregation.length > 0 ? incomeAggregation[0].totalIncome : 0;
          if (catIncome > 0) {
            limit = Math.max(1, budget.monthlyLimit - catIncome);
          }
        }

        const remaining = Math.round((limit - spent) * 100) / 100;
        const rawPercentage = limit > 0 ? (spent / limit) * 100 : 0;
        const percentage = Math.round(rawPercentage * 10) / 10;

        return {
          id: budget._id,
          category: budget.category,
          monthlyLimit: budget.monthlyLimit,
          effectiveLimit: limit,
          month: budget.month,
          year: budget.year,
          spent,
          remaining,
          utilizationPercentage: percentage,
          isOverBudget: spent > limit
        };
      })
    );

    res.status(200).json({
      success: true,
      data: budgetsWithSpending
    });
  } catch (error) {
    next(error);
  }
}

async function createBudget(req, res, next) {
  try {
    const userId = req.user._id;
    const { category, monthlyLimit, month, year } = req.body;

    const numLimit = Number(monthlyLimit);
    const numMonth = Number(month);
    const numYear = Number(year);

    const existingBudget = await Budget.findOne({
      userId,
      category: category.trim(),
      month: numMonth,
      year: numYear
    });

    if (existingBudget) {
      return res.status(409).json({
        success: false,
        message: `A budget for category "${category.trim()}" in ${numMonth}/${numYear} already exists.`
      });
    }

    const budget = await Budget.create({
      userId,
      category: category.trim(),
      monthlyLimit: Math.round(numLimit * 100) / 100,
      month: numMonth,
      year: numYear
    });

    res.status(201).json({
      success: true,
      message: 'Budget created successfully.',
      data: budget
    });
  } catch (error) {
    next(error);
  }
}

async function updateBudget(req, res, next) {
  try {
    const { monthlyLimit } = req.body;
    const numLimit = Number(monthlyLimit);

    if (isNaN(numLimit) || numLimit <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Monthly limit must be greater than 0.'
      });
    }

    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { monthlyLimit: Math.round(numLimit * 100) / 100 },
      { new: true, runValidators: true }
    );

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully.',
      data: budget
    });
  } catch (error) {
    next(error);
  }
}

async function deleteBudget(req, res, next) {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget
};
