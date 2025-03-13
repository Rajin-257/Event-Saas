/**
 * Authentication middleware
 */

// Ensure user is authenticated
exports.ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to access this resource');
    res.redirect('/login');
  };
  
  // Ensure user is not authenticated (for login/register pages)
  exports.ensureNotAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/dashboard');
  };
  
  // Ensure the user has the specified role
  exports.ensureRole = (roles) => {
    return (req, res, next) => {
      // Convert to array if single role provided
      if (typeof roles === 'string') {
        roles = [roles];
      }
  
      if (req.isAuthenticated() && req.user.Roles) {
        // Check if the user has at least one of the required roles
        const userRoles = req.user.Roles.map(role => role.name);
        const hasRole = roles.some(role => userRoles.includes(role));
        
        if (hasRole) {
          return next();
        }
      }
      
      req.flash('error_msg', 'You do not have permission to access this resource');
      res.redirect('/dashboard');
    };
  };
  
  // API authentication middleware using JWT
  exports.apiAuth = (req, res, next) => {
    // Implementation will be added with JWT
    // This is a placeholder for now
    next();
  };