const express = require('express');
const router = express.Router();
const { getMonthlyReport, getCategoryReport } = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/monthly', getMonthlyReport);
router.get('/categories', getCategoryReport);

module.exports = router;
