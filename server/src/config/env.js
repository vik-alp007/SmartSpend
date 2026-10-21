const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from server/.env if present, otherwise root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
if (!process.env.PORT) {
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
}

const requiredEnv = ['JWT_SECRET'];

function validateEnv() {
  const missing = [];
  for (const key of requiredEnv) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error(`\x1b[31m[CONFIG ERROR] Missing required environment variable(s): ${missing.join(', ')}\x1b[0m`);
    console.error('Please create a server/.env file based on .env.example before starting.');
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
}

// In test environment, provide fallback JWT_SECRET if not supplied
if (process.env.NODE_ENV === 'test' && !process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test_secret_for_automated_testing_key_12345';
}

validateEnv();

const config = {
  port: parseInt(process.env.PORT, 10) || 8080,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/smartspend',
  jwtSecret: process.env.JWT_SECRET || 'test_secret_for_automated_testing_key_12345',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  cookieSecret: process.env.COOKIE_SECRET || 'smartspend_cookie_secret_dev_32chars_min',
  // Competition Challenge Mode: default true
  bugChallengeMode: process.env.BUG_CHALLENGE_MODE !== 'false'
};

module.exports = config;
