const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

module.exports = (passport) => {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        // Match user
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }

        // Check if user is blocked or inactive
        if (user.status !== 'active') {
          return done(null, false, { message: 'Your account is not active. Please contact support.' });
        }

        // Match password
        const isMatch = await user.validatePassword(password);
        
        if (!isMatch) {
          return done(null, false, { message: 'Password incorrect' });
        }

        // Update last login time
        user.lastLogin = new Date();
        await user.save();

        return done(null, user);
      } catch (err) {
        console.error('Passport authentication error:', err);
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findByPk(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};