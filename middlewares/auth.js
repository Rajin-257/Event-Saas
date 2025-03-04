const passport = require("passport");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../models/User");

// Protect routes - require authentication
exports.protect = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    // If error or no user
    if (err || !user) {
      req.flash("error_msg", "Please log in to access this page");
      return res.redirect("/auth/login");
    }

    // Set the user in the request
    req.user = user;
    next();
  })(req, res, next);
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      req.flash("error_msg", "Please log in to access this page");
      return res.redirect("/auth/login");
    }

    if (!roles.includes(req.user.role)) {
      req.flash("error_msg", "You are not authorized to access this page");
      return res.redirect("/");
    }

    next();
  };
};

// Check if user is authenticated for conditional UI rendering
exports.isAuthenticated = (req, res, next) => {
  // Check for JWT in cookies
  const token = req.cookies.jwt;

  if (!token) {
    res.locals.isAuthenticated = false;
    return next();
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Find user by ID
    User.findByPk(decoded.id)
      .then((user) => {
        if (!user || user.status !== "Active") {
          res.locals.isAuthenticated = false;
        } else {
          res.locals.isAuthenticated = true;
          res.locals.currentUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
          };
        }
        next();
      })
      .catch(() => {
        res.locals.isAuthenticated = false;
        next();
      });
  } catch (error) {
    res.locals.isAuthenticated = false;
    next();
  }
};

// Redirect if authenticated (for login/register pages)
exports.redirectIfAuthenticated = (req, res, next) => {
  // Check for JWT in cookies
  const token = req.cookies.jwt;

  if (!token) {
    return next();
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Find user by ID
    User.findByPk(decoded.id)
      .then((user) => {
        if (!user || user.status !== "Active") {
          next();
        } else {
          req.flash("success_msg", "You are already logged in");
          res.redirect("/user/dashboard");
        }
      })
      .catch(() => {
        next();
      });
  } catch (error) {
    next();
  }
};
