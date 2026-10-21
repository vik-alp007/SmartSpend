const rateLimit = require('express-rate-limit');
const config = require('../config/env');

// Rate limiting for auth endpoints (registration & login)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.nodeEnv === 'test' ? 1000 : 30, // Relaxed in test environment
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login or registration attempts. Please try again after 15 minutes.'
  },
  skip: () => config.nodeEnv === 'test'
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.nodeEnv === 'test' ? 10000 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.nodeEnv === 'test'
});

module.exports = {
  authLimiter,
  apiLimiter
};
