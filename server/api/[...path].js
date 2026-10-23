const app = require('../src/app');
const { connectDB } = require('../src/config/database');

function setFallbackCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
}

module.exports = async (req, res) => {
  // 1. Handle OPTIONS preflight immediately without requiring DB connection
  if (req.method === 'OPTIONS') {
    return app(req, res);
  }

  // 2. Attempt DB connection
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('[API SERVERLESS ERROR]', error.message);

    if (req.url && (req.url.endsWith('/health') || req.url.includes('/health'))) {
      return app(req, res);
    }

    if (!res.headersSent) {
      setFallbackCorsHeaders(req, res);
      return res.status(503).json({
        success: false,
        error: 'DATABASE_CONNECTION_ERROR',
        message: 'Backend server is running, but database connection could not be established. Please verify MONGODB_URI and MongoDB Atlas network access (IP Access List).',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};
