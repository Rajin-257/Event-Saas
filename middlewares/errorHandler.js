// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';
  let errors = err.errors || null;

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.errors.map(e => ({
      field: e.path,
      message: `${e.path.charAt(0).toUpperCase() + e.path.slice(1)} already exists.`
    }));
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your token has expired. Please log in again.';
  }

  // Handle API vs. Web requests differently
  const isApiRequest = req.originalUrl.startsWith('/api/');

  if (isApiRequest) {
    // API Response
    return res.status(statusCode).json({
      success: false,
      error: {
        message,
        errors,
        statusCode
      }
    });
  } else {
    // Web Response - Render error page
    return res.status(statusCode).render('error', {
      title: `Error ${statusCode}`,
      message,
      errors,
      statusCode
    });
  }
};

module.exports = errorHandler;