const express = require('express');
const router = express.Router();
const {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget
} = require('../controllers/budgetController');
const { authenticate } = require('../middleware/auth');
const { validateBudget } = require('../middleware/validate');

router.use(authenticate);

router.get('/', getBudgets);
router.post('/', validateBudget, createBudget);
router.patch('/:id', updateBudget);
router.delete('/:id', deleteBudget);

module.exports = router;
