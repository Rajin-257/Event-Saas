const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcryptjs');

// Load User model
const db = require('../models');
const User = db.User;
const Role = db.Role;

module.exports = (passport) => {
  // Local Strategy for username/password login
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          // Find user by email
          const user = await User.findOne({ 
            where: { email },
            include: [{
              model: Role,
              through: { attributes: [] } // Exclude junction table attributes
            }]
          });

          // No user found
          if (!user) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          // Check if account is active
          if (user.status !== 'active') {
            return done(null, false, { message: 'Account is not active. Please contact support.' });
          }

          // Match password
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          // Update last login time
          await user.update({
            last_login: new Date(),
            last_activity: new Date()
          });

          // Return user if successful
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // JWT Strategy for API authentication
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };

  passport.use(
    new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
      try {
        // Find user by ID from JWT payload
        const user = await User.findByPk(jwt_payload.id, {
          include: [{
            model: Role,
            through: { attributes: [] }
          }]
        });

        if (user) {
          // Update last activity
          await user.update({ last_activity: new Date() });
          return done(null, user);
        }
        
        return done(null, false);
      } catch (err) {
        return done(err, false);
      }
    })
  );

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findByPk(id, {
        include: [{
          model: Role,
          through: { attributes: [] }
        }]
      });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};