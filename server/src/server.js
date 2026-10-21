const app = require('./app');
const config = require('./config/env');
const { connectDB, disconnectDB } = require('./config/database');

let server;

async function startServer() {
  try {
    // 1. Authoritative DB connection
    await connectDB();

    // 2. Start HTTP server
    server = app.listen(config.port, () => {
      console.log(`\n==================================================`);
      console.log(`  \x1b[32mSmartSpend Backend Server Running\x1b[0m`);
      console.log(`  Environment:   ${config.nodeEnv}`);
      console.log(`  Port:          ${config.port}`);
      console.log(`  API Base:      http://localhost:${config.port}/api`);
      console.log(`  Health Check:  http://localhost:${config.port}/api/health`);
      console.log(`  Competition Mode: ${config.bugChallengeMode ? '\x1b[33mACTIVE (Defects Enabled)\x1b[0m' : '\x1b[32mDISABLED (Corrected Mode)\x1b[0m'}`);
      console.log(`==================================================\n`);
    });

    // Handle unexpected server errors
    server.on('error', (err) => {
      console.error('[SERVER ERROR]', err.message);
      process.exit(1);
    });
  } catch (error) {
    console.error('[FATAL STARTUP ERROR]', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
async function gracefulShutdown(signal) {
  console.log(`\n[SHUTDOWN] Received ${signal}. Closing HTTP server and database connections...`);

  if (server) {
    server.close(async () => {
      console.log('[SHUTDOWN] HTTP server closed.');
      await disconnectDB();
      console.log('[SHUTDOWN] Database connection closed.');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('[SHUTDOWN] Could not close connections in time, forcefully shutting down.');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Uncaught exceptions & unhandled rejections
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { startServer };
