const fs = require('fs');
const path = require('path');
const moment = require('moment');

// Ensure log directory exists
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Create log entry
const createLogEntry = (level, message, meta = {}) => {
  const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
  return {
    timestamp,
    level,
    message,
    ...meta
  };
};

// Write log to file
const writeLog = (entry) => {
  const today = moment().format('YYYY-MM-DD');
  const logFile = path.join(logDir, `${today}.log`);
  
  const logString = `[${entry.timestamp}] [${entry.level}] ${entry.message} ${
    Object.keys(entry).length > 3 ? JSON.stringify(entry) : ''
  }\n`;
  
  fs.appendFileSync(logFile, logString);
  
  // Also log to console in development
  if (process.env.NODE_ENV !== 'production') {
    const consoleMethod = entry.level === LOG_LEVELS.ERROR ? 'error' : 
                         entry.level === LOG_LEVELS.WARN ? 'warn' : 
                         entry.level === LOG_LEVELS.DEBUG ? 'debug' : 'log';
    console[consoleMethod](logString);
  }
};

// Logger methods
const logger = {
  error: (message, meta = {}) => {
    const entry = createLogEntry(LOG_LEVELS.ERROR, message, meta);
    writeLog(entry);
  },
  
  warn: (message, meta = {}) => {
    const entry = createLogEntry(LOG_LEVELS.WARN, message, meta);
    writeLog(entry);
  },
  
  info: (message, meta = {}) => {
    const entry = createLogEntry(LOG_LEVELS.INFO, message, meta);
    writeLog(entry);
  },
  
  debug: (message, meta = {}) => {
    // Only log debug in development
    if (process.env.NODE_ENV !== 'production') {
      const entry = createLogEntry(LOG_LEVELS.DEBUG, message, meta);
      writeLog(entry);
    }
  }
};

module.exports = logger;