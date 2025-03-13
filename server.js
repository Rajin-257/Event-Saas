require('dotenv').config();
const app = require('./app');
const db = require('./models');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(`${err.name}: ${err.message}`);
  
  // Also log to console
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(`${err.name}: ${err.message}`);
  
  process.exit(1);
});

// Sync database and start server
db.sequelize
  .sync()
  .then(() => {
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
    
    // Handle unhandled rejections
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
      logger.error(`${err.name}: ${err.message}`);
      
      // Also log to console
      console.error('UNHANDLED REJECTION! 💥 Shutting down...');
      console.error(`${err.name}: ${err.message}`);
      
      server.close(() => {
        process.exit(1);
      });
    });
    
    // Handle SIGTERM signal
    process.on('SIGTERM', () => {
      logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
      
      // Also log to console
      console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
      
      server.close(() => {
        logger.info('💥 Process terminated!');
        console.log('💥 Process terminated!');
      });
    });
  })
  .catch((err) => {
    logger.error('Unable to connect to the database:', err);
    
    // Also log to console
    console.error('Unable to connect to the database:', err);
  });