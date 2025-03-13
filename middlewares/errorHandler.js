const logger = require('../utils/logger');

// Custom error handler middleware
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log the error
  logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  logger.error(err.stack);

  // Operational, trusted error: send message to client
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).render('error', {
      title: 'Error',
      message: err.message,
      error: err,
      stack: err.stack,
    });
  } 
  
  // Production mode: don't leak error details
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Error',
      message: err.message,
      error: {},
    });
  }
  
  // Programming or other unknown errors: don't leak error details
  logger.error('ERROR 💥', err);
  return res.status(500).render('error', {
    title: 'Error',
    message: 'Something went wrong',
    error: {},
  });
};