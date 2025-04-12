module.exports = (roles = []) => {
    // Convert string to array if only one role is passed
    if (typeof roles === 'string') {
      roles = [roles];
    }
    
    return (req, res, next) => {
      if (!req.user) {
        req.flash('error', 'Please login to continue');
        return res.redirect('/auth/login');
      }
      
      if (roles.length && !roles.includes(req.user.role)) {
        req.flash('error', 'You are not authorized to access this page');
        return res.redirect('/dashboard');
      }
      
      next();
    };
  };