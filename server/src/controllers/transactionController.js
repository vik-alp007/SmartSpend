const Transaction = require('../models/Transaction');
const config = require('../config/env');

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

async function getTransactions(req, res, next) {
  try {
    const userId = req.user._id;
    const {
      page = 1,
      limit = 10,
      search = '',
      type = '',
      category = '',
      startDate = '',
      endDate = '',
      sortBy = 'transactionDate',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));

    const filter = { userId };

    // Search by title
    if (search && search.trim() !== '') {
      if (config.bugChallengeMode) {
        // [BUG-BEG-01] Case-sensitive regex search in competition mode
        filter.title = { $regex: search.trim() };
      } else {
        // Corrected: Case-insensitive regex with escaped special characters
        filter.title = { $regex: escapeRegex(search.trim()), $options: 'i' };
      }
    }

    // Filter by type
    if (type && ['income', 'expense'].includes(type)) {
      filter.type = type;
    }

    // Filter by category
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.transactionDate = {};
      if (startDate) {
        filter.transactionDate.$gte = new Date(startDate);
      }
      if (endDate) {
        if (config.bugChallengeMode) {
          // [BUG-INT-03] End date boundary truncated to midnight 00:00:00, omitting same-day records
          const d = new Date(endDate);
          d.setHours(0, 0, 0, 0);
          filter.transactionDate.$lte = d;
        } else {
          // Corrected: Inclusive end date until 23:59:59.999
          const d = new Date(endDate);
          d.setHours(23, 59, 59, 999);
          filter.transactionDate.$lte = d;
        }
      }
    }

    // Sorting
    let sortOptions = {};
    let order = sortOrder === 'asc' ? 1 : -1;

    if (sortBy === 'amount') {
      if (config.bugChallengeMode) {
        // [BUG-BEG-02] Amount sort direction inversion in competition mode
        sortOptions.amount = order === 1 ? -1 : 1;
      } else {
        // Corrected: Standard sort order
        sortOptions.amount = order;
      }
    } else {
      sortOptions[sortBy] = order;
    }

    // Pagination count
    let totalCount;
    if (config.bugChallengeMode && (category || type || search)) {
      // [BUG-ADV-04] Counts unfiltered documents in competition mode when filters are active
      totalCount = await Transaction.countDocuments({ userId });
    } else {
      // Corrected: Counts filtered documents accurately
      totalCount = await Transaction.countDocuments(filter);
    }

    const skip = (pageNum - 1) * limitNum;
    const transactions = await Transaction.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalRecords: totalCount,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getTransactionById(req, res, next) {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
}

async function createTransaction(req, res, next) {
  try {
    const { title, type, amount, category, transactionDate, paymentMethod, notes } = req.body;
    const numAmount = Number(amount);

    if (config.bugChallengeMode) {
      // [BUG-BEG-03] Competition mode allows amount = 0
      if (isNaN(numAmount) || numAmount < 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount cannot be negative.'
        });
      }
    } else {
      // Corrected: Amount must be strictly greater than 0
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be a positive number greater than 0.'
        });
      }
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      title: title.trim(),
      type,
      amount: Math.round(numAmount * 100) / 100,
      category: category.trim(),
      transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
      paymentMethod: paymentMethod || 'UPI',
      notes: notes ? notes.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully.',
      data: transaction
    });
  } catch (error) {
    next(error);
  }
}

async function updateTransaction(req, res, next) {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.'
      });
    }

    const { title, type, amount, category, transactionDate, paymentMethod, notes } = req.body;

    if (amount !== undefined) {
      const numAmount = Number(amount);
      if (config.bugChallengeMode) {
        if (isNaN(numAmount) || numAmount < 0) {
          return res.status(400).json({
            success: false,
            message: 'Amount cannot be negative.'
          });
        }
      } else {
        if (isNaN(numAmount) || numAmount <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Amount must be greater than 0.'
          });
        }
      }
      transaction.amount = Math.round(numAmount * 100) / 100;
    }

    if (title) transaction.title = title.trim();
    if (type && ['income', 'expense'].includes(type)) transaction.type = type;
    if (category) transaction.category = category.trim();
    if (transactionDate) transaction.transactionDate = new Date(transactionDate);
    if (paymentMethod) transaction.paymentMethod = paymentMethod;
    if (notes !== undefined) transaction.notes = notes.trim();

    await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully.',
      data: transaction
    });
  } catch (error) {
    next(error);
  }
}

async function deleteTransaction(req, res, next) {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
};
