const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

module.exports = async (req, res, next) => {
  try {
    // Check if token exists in cookies
    const token = req.cookies.token;
    
    if (!token) {
      req.flash('error', 'Please login to continue');
      return res.redirect('/auth/login');
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/auth/login');
    }
    
    // Check if user is active
    if (!user.isActive) {
      req.flash('error', 'Your account has been deactivated');
      return res.redirect('/auth/login');
    }
    
    // Set user in request
    req.user = user;
    res.locals.user = user;
    
    next();
  } catch (error) {
    req.flash('error', 'Session expired. Please login again');
    return res.redirect('/auth/login');
  }
};