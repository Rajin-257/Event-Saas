const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const { ExtractJwt } = require("passport-jwt");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const config = require("./config");

// Cookie extractor function for JWT
const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["jwt"];
  }
  return token;
};

module.exports = (passport) => {
  // Local Strategy (username/password)
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          // Find user by email
          const user = await User.findOne({
            where: { email: email.toLowerCase() },
          });

          // If user doesn't exist
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }

          // If user is not active
          if (user.status !== "Active") {
            return done(null, false, {
              message: "Your account is not active. Please contact support.",
            });
          }

          // If email is not verified
          if (!user.verify_email) {
            return done(null, false, {
              message: "Please verify your email before logging in.",
            });
          }

          // Check password
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: "Invalid email or password" });
          }

          // Update last login date
          await user.update({ last_login_data: new Date() });

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );

  // JWT Strategy
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([
          cookieExtractor,
          ExtractJwt.fromAuthHeaderAsBearerToken(),
        ]),
        secretOrKey: config.jwt.secret,
      },
      async (jwtPayload, done) => {
        try {
          // Find user by ID from JWT
          const user = await User.findByPk(jwtPayload.id);

          if (!user) {
            return done(null, false);
          }

          // If user is not active
          if (user.status !== "Active") {
            return done(null, false);
          }

          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      },
    ),
  );

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findByPk(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};
