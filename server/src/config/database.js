const mongoose = require('mongoose');
const config = require('./env');

let isConnected = false;

async function connectDB(customUri = null) {
  const uri = customUri || config.mongodbUri;

  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });

    isConnected = true;
    if (config.nodeEnv !== 'test') {
      console.log(`\x1b[32m[DATABASE] Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}\x1b[0m`);
    }
    return conn;
  } catch (error) {
    console.error('\x1b[31m[DATABASE ERROR] Failed to connect to MongoDB:\x1b[0m', error.message);
    console.error('\x1b[33mTroubleshooting steps:\x1b[0m');
    console.error('1. Check if MongoDB is running locally (run "mongod" or check service).');
    console.error('2. If using MongoDB Atlas, check network access / IP whitelist and connection credentials in server/.env.');
    console.error('3. Verify the MONGODB_URI in server/.env.\n');
    isConnected = false;

    if (config.nodeEnv !== 'test') {
      process.exit(1);
    }
    throw error;
  }
}

async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
  }
}

module.exports = {
  connectDB,
  disconnectDB,
  isConnected: () => mongoose.connection.readyState === 1
};
