const authConfig = require('../config/auth');

/**
 * Role-based access control middleware
 * Checks if the user has the required role or permissions
 */
module.exports = {
  // Check if user has a specific role
  hasRole: (roles) => {
    return (req, res, next) => {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        req.flash('error_msg', 'Please log in to access this page');
        return res.redirect('/login');
      }
      
      // Convert roles to array if it's a single string
      const requiredRoles = Array.isArray(roles) ? roles : [roles];
      
      // Check if user has any of the required roles
      if (requiredRoles.includes(req.user.role)) {
        return next();
      }
      
      // If user doesn't have the required role
      req.flash('error_msg', 'You do not have permission to access this page');
      res.redirect('/dashboard');
    };
  },
  
  // Check if user has a specific permission
  hasPermission: (permission) => {
    return (req, res, next) => {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        req.flash('error_msg', 'Please log in to access this page');
        return res.redirect('/login');
      }
      
      // Get permissions for the user's role
      const userPermissions = authConfig.permissions[req.user.role] || [];
      
      // Super admin has all permissions
      if (req.user.role === authConfig.roles.SUPER_ADMIN) {
        return next();
      }
      
      // Check if user has the required permission
      if (userPermissions.includes(permission)) {
        return next();
      }
      
      // If user doesn't have the required permission
      req.flash('error_msg', 'You do not have permission to perform this action');
      res.redirect('/dashboard');
    };
  },
  
  // Check if user is the owner of a resource or an admin
  isOwnerOrAdmin: (resourceModel, resourceIdParam, ownerField = 'userId') => {
    return async (req, res, next) => {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        req.flash('error_msg', 'Please log in to access this page');
        return res.redirect('/login');
      }
      
      // Super admin can access any resource
      if (req.user.role === authConfig.roles.SUPER_ADMIN) {
        return next();
      }
      
      try {
        // Get resource ID from request parameters
        const resourceId = req.params[resourceIdParam];
        
        // Get the resource from the database
        const resource = await resourceModel.findByPk(resourceId);
        
        // If resource not found
        if (!resource) {
          req.flash('error_msg', 'Resource not found');
          return res.redirect('back');
        }
        
        // Check if current user is the owner of the resource
        if (resource[ownerField] === req.user.id) {
          return next();
        }
        
        // If user is not the owner
        req.flash('error_msg', 'You do not have permission to access this resource');
        res.redirect('back');
      } catch (err) {
        console.error('Error in isOwnerOrAdmin middleware:', err);
        req.flash('error_msg', 'An error occurred');
        res.redirect('back');
      }
    };
  }
};