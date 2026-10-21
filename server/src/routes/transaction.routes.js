const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
} = require('../controllers/transactionController');
const { authenticate } = require('../middleware/auth');
const { validateTransaction } = require('../middleware/validate');

router.use(authenticate);

router.get('/', getTransactions);
router.post('/', validateTransaction, createTransaction);
router.get('/:id', getTransactionById);
router.patch('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
