/**
 * Role-based access control middleware
 */
const logger = require('../utils/logger');

/**
 * Check if user has required role(s)
 * @param {string|string[]} roles - Required role(s)
 * @returns {function} - Middleware function
 */
module.exports = (roles) => {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
      }
      
      // Convert single role to array
      const requiredRoles = Array.isArray(roles) ? roles : [roles];
      
      // Get user roles
      const userRoles = req.user.Roles.map(role => role.name);
      
      // Check if user has at least one required role
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      
      if (hasRequiredRole) {
        return next();
      }
      
      // User does not have required role
      logger.warn(`User ${req.user.id} attempted to access resource requiring ${requiredRoles.join(', ')} role(s)`);
      
      // Send appropriate response based on request type
      if (req.xhr || req.path.startsWith('/api')) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied: Insufficient permissions'
        });
      }
      
      // If it's a web request, redirect with flash message
      req.flash('error_msg', 'You do not have permission to access this resource');
      return res.redirect('/dashboard');
    } catch (error) {
      logger.error(`Role check error: ${error.message}`);
      
      if (req.xhr || req.path.startsWith('/api')) {
        return res.status(500).json({
          status: 'error',
          message: 'An error occurred while checking permissions'
        });
      }
      
      req.flash('error_msg', 'An error occurred');
      return res.redirect('/dashboard');
    }
  };
};