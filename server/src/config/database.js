const mongoose = require('mongoose');
const config = require('./env');

let cachedPromise = null;

async function connectDB(customUri = null) {
  const uri = customUri !== null ? customUri : config.mongodbUri;

  if (!uri || (typeof uri === 'string' && !uri.trim())) {
    const error = new Error(
      'MONGODB_URI is not configured. Localhost fallback is disabled in production environments. Please configure MONGODB_URI in Vercel Environment Variables with your MongoDB Atlas connection string.'
    );
    console.error('[DATABASE ERROR]', error.message);
    throw error;
  }

  // 1. If already connected, return existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // 2. If connection is currently in progress, return the in-flight promise
  if (mongoose.connection.readyState === 2 && cachedPromise) {
    return cachedPromise;
  }

  // 3. Initiate new connection with caching
  cachedPromise = mongoose
    .connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: config.nodeEnv !== 'production'
    })
    .then((conn) => {
      if (config.nodeEnv !== 'test') {
        console.log(
          `[DATABASE] Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`
        );
      }
      return conn;
    })
    .catch((error) => {
      cachedPromise = null;
      console.error(
        '[DATABASE ERROR] Failed to connect to MongoDB:',
        error.message
      );
      console.error(
        'Check your MongoDB Atlas URI, credentials, and network access settings (allow 0.0.0.0/0 on Atlas).'
      );
      throw error;
    });

  return cachedPromise;
}

async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    cachedPromise = null;
  }
}

module.exports = {
  connectDB,
  disconnectDB,
  isConnected: () => mongoose.connection.readyState === 1
};
