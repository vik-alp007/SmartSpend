const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const config = require('../config/env');

router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const isHealthy = mongoose.connection.readyState === 1;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: dbStatus
    },
    version: '1.0.0'
  });
});

// Safe client configuration settings (does not expose secrets or bug details)
router.get('/config/client-settings', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      bugChallengeMode: config.bugChallengeMode,
      currency: 'INR',
      appName: 'SmartSpend',
      tagline: 'Track Your Money. Master Your Spending.'
    }
  });
});

module.exports = router;
