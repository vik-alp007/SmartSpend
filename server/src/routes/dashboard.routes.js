const express = require('express');
const router = express.Router();
const { getSummary, getCharts } = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/summary', getSummary);
router.get('/charts', getCharts);

module.exports = router;
