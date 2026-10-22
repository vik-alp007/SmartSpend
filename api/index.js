const app = require('../server/src/app');
const { connectDB } = require('../server/src/config/database');

let dbConnection = null;

module.exports = async (req, res) => {
  try {
    if (!dbConnection) {
      dbConnection = connectDB().catch((error) => {
        dbConnection = null;
        throw error;
      });
    }

    await dbConnection;
    return app(req, res);
  } catch (error) {
    console.error('[API ERROR]', error.message);

    if (!res.headersSent) {
      return res.status(503).json({
        success: false,
        message: 'Server temporarily unavailable: ' + error.message
      });
    }
  }
};
