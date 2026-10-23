const config = require('../config/env');

function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;
  let statusCode = err.statusCode || 500;

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    error.message = `Resource not found. Invalid ID: ${err.value}`;
  }

  // Mongoose duplicate key error (11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error.message = `Duplicate entry: A record with that ${field} already exists.`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((val) => val.message);
    error.message = messages.join('. ');
  }

  if (config.nodeEnv !== 'test') {
    console.error(`[ERROR] ${statusCode} - ${error.message}`);
  }

  // Ensure CORS headers exist on error response so browser can read error details
  if (req && req.headers && req.headers.origin && !res.getHeader('Access-Control-Allow-Origin')) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
}

module.exports = errorHandler;
