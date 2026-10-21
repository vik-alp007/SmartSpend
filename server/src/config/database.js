
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
      console.log(
        `[DATABASE] Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`
      );
    }

    return conn;
  } catch (error) {
    console.error(
      '[DATABASE ERROR] Failed to connect to MongoDB:',
      error.message
    );

    console.error(
      'Check your MongoDB Atlas URI, credentials, and network access settings.'
    );

    isConnected = false;
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
