const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const config = require('../config/env');

router.get('/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    return res.status(200).json({
      status: 'ok',
      database: 'connected',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString()
    });
  }

  return res.status(503).json({
    status: 'degraded',
    database: 'disconnected',
    message: 'Backend server is running, but database is disconnected. Verify MONGODB_URI and MongoDB Atlas network access.',
    timestamp: new Date().toISOString()
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
