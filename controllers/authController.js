const passport = require("passport");
const crypto = require("crypto");
const User = require("../models/User");
const config = require("../config/config");
const emailService = require("../utils/email");

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// @desc    Render login page
// @route   GET /auth/login
// @access  Public
exports.getLogin = (req, res) => {
  res.render("backend/auth/login", {
    title: "Login",
    formData: req.flash("formData")[0] || {},
    errorMsg: req.flash("error_msg")[0] || null,
  });
};

// @desc    Process login
// @route   POST /auth/login
// @access  Public
exports.postLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({
    where: { email: email.toLowerCase() },
  });

  // Check if user exists
  if (!user) {
    req.flash("error_msg", "No account found with that email");
    return res.redirect("/auth/login");
  }

  // Check if user is verified
  if (!user.verify_email) {
    req.flash("error_msg", "Please verify your email before logging in");
    return res.redirect("/auth/login");
  }

  // Authenticate user
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      req.flash("error_msg", info.message || "Invalid credentials");
      return res.redirect("/auth/login");
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }

      req.flash("success_msg", "You are now logged in");
      res.redirect("/user/dashboard");
    });
  })(req, res, next);
});

// @desc    Process login with JWT
// @route   POST /auth/login
// @access  Public
exports.loginWithJWT = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({
    where: { email: email.toLowerCase() },
  });

  // Check if user exists
  if (!user) {
    req.flash("error_msg", "No account found with that email");
    return res.redirect("/auth/login");
  }

  // Check if user is verified
  if (!user.verify_email) {
    req.flash("error_msg", "Please verify your email before logging in");
    return res.redirect("/auth/login");
  }

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      req.flash("error_msg", info.message || "Invalid credentials");
      return res.redirect("/auth/login");
    }

    // User authenticated, generate token
    const token = user.getSignedJwtToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token to database
    user.refresh_token = refreshToken;
    user.last_login_data = new Date();
    user.save();

    // Set cookie options
    const cookieOptions = {
      expires: new Date(
        Date.now() + config.jwt.cookieExpire * 24 * 60 * 60 * 1000,
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // Added for security
    };

    // Set cookies
    res.cookie("jwt", token, cookieOptions);
    res.cookie("refresh_token", refreshToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    req.flash("success_msg", "You are now logged in");
    res.redirect("/user/dashboard");
  })(req, res, next);
});

// @desc    Render register page
// @route   GET /auth/register
// @access  Public
exports.getRegister = (req, res) => {
  res.render("auth/register", {
    title: "Register",
    formData: req.flash("formData")[0] || {},
    errorMsg: req.flash("error_msg")[0] || null,
  });
};

// @desc    Process register
// @route   POST /auth/register
// @access  Public
exports.postRegister = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    req.flash("error_msg", "An account with this email already exists");
    req.flash("formData", req.body);
    return res.redirect("/auth/register");
  }

  // Create user
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
  });

  // Generate verification token
  const verificationToken = crypto.randomBytes(20).toString("hex");

  // Create verification URL with shorter expiration
  const verificationURL = `${config.app.url}/auth/verify-email/${
    user.id
  }/${verificationToken}?expires=${Date.now() + 24 * 60 * 60 * 1000}`;

  try {
    // Send verification email
    await emailService.sendVerificationEmail({
      name: user.name,
      email: user.email,
      verificationURL,
    });

    req.flash(
      "success_msg",
      "Registration successful! Please check your email to verify your account.",
    );
    res.redirect("/auth/login");
  } catch (emailError) {
    // If email sending fails, delete the user
    await user.destroy();

    req.flash(
      "error_msg",
      "Failed to send verification email. Please try registering again.",
    );
    res.redirect("/auth/register");
  }
});

exports.postuserRegister = asyncHandler(async (req, res) => {
  const { name, email, password, mobile, role, menupuletedby } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    req.flash("error_msg", "An account with this email already exists");
    req.flash("formData", req.body);
    return res.redirect("/user/user-details");
  }

  // Create user
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    mobile,
    role,
    menupuletedby,
  });

  // Generate verification token
  const verificationToken = crypto.randomBytes(20).toString("hex");

  // Create verification URL with shorter expiration
  const verificationURL = `${config.app.url}/auth/verify-email/${
    user.id
  }/${verificationToken}?expires=${Date.now() + 24 * 60 * 60 * 1000}`;

  try {
    // Send verification email
    await emailService.sendVerificationEmail({
      name: user.name,
      email: user.email,
      verificationURL,
    });

    req.flash(
      "success_msg",
      "Registration successful! Please check User email to verify your account.",
    );
    console.log("Post User");
    res.redirect("/user/user-details");
  } catch (emailError) {
    // If email sending fails, delete the user
    await user.destroy();

    req.flash(
      "error_msg",
      "Failed to send verification email. Please try registering again.",
    );
    res.redirect("/user/user-details");
  }
});

exports.updateRole = async (req, res, next) => {
  try {
    // Get the role and userId from the request body
    const { role, userId, menupuletedby } = req.body;

    await User.update(
      { role: role, menupuletedby: menupuletedby },
      { where: { id: userId } },
    );

    req.flash("success_msg", "Role updated successfully");
    res.redirect("/user/user-details");
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { userID } = req.body;

    // Use destroy() instead of delete()
    await User.destroy({ where: { id: userID } });

    req.flash("success_msg", "User deleted successfully");
    res.redirect("/user/user-details");
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email
// @route   GET /auth/verify-email/:id/:token
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { id, token } = req.params;
  const { expires } = req.query;

  // Check token expiration
  if (!expires || Date.now() > parseInt(expires)) {
    req.flash("error_msg", "Verification link has expired");
    return res.redirect("/auth/login");
  }

  // Find user by ID
  const user = await User.findByPk(id);

  if (!user) {
    req.flash("error_msg", "Invalid verification link");
    return res.redirect("/auth/login");
  }

  // Check if already verified
  if (user.verify_email) {
    req.flash("success_msg", "Email is already verified. You can log in.");
    return res.redirect("/auth/login");
  }

  // Update user
  user.verify_email = true;
  await user.save();

  req.flash(
    "success_msg",
    "Email verification successful! You can now log in.",
  );
  res.redirect("/auth/login");
});

// @desc    Render forgot password page
// @route   GET /auth/forgot-password
// @access  Public
exports.getForgotPassword = (req, res) => {
  res.render("backend/auth/recoverpw", {
    title: "Forgot Password",
    formData: req.flash("formData")[0] || {},
    errorMsg: req.flash("error_msg")[0] || null,
  });
};

// @desc    Process forgot password
// @route   POST /auth/forgot-password
// @access  Public
exports.postForgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Find user by email
  const user = await User.findOne({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    req.flash("error_msg", "No account found with that email");
    return res.redirect("/auth/forgot-password");
  }

  // Check if user is verified
  if (!user.verify_email) {
    req.flash(
      "error_msg",
      "Please verify your email before resetting password",
    );
    return res.redirect("/auth/forgot-password");
  }

  try {
    // Generate and save OTP
    const otp = await user.generatePasswordResetOTP();

    // Send password reset email with OTP
    await emailService.sendPasswordResetEmail({
      name: user.name,
      email: user.email,
      otp,
    });

    req.flash("success_msg", "Password reset OTP has been sent to your email");
    res.redirect("/auth/reset-password");
  } catch (error) {
    req.flash(
      "error_msg",
      "Failed to send password reset OTP. Please try again.",
    );
    res.redirect("/auth/forgot-password");
  }
});

// @desc    Render reset password page
// @route   GET /auth/reset-password
// @access  Public
exports.getResetPassword = (req, res) => {
  res.render("backend/auth/changepw", {
    title: "Reset Password",
    formData: req.flash("formData")[0] || {},
    errorMsg: req.flash("error_msg")[0] || null,
  });
};

// @desc    Process reset password
// @route   POST /auth/reset-password
// @access  Public
exports.postResetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;

  // Find user by email
  const user = await User.findOne({
    where: { email: email.toLowerCase() },
  });

  if (!/^\d{6}$/.test(otp)) {
    req.flash("error_msg", "Invalid OTP format. OTP must be a 6-digit number.");
    return res.redirect("/auth/reset-password");
  }

  // Check if OTP matches
  if (user.forgot_pass_otp !== otp) {
    req.flash("error_msg", "Invalid OTP");
    return res.redirect("/auth/reset-password");
  }

  if (!user) {
    req.flash("error_msg", "No account found with that email");
    return res.redirect("/auth/reset-password");
  }

  // Check if OTP exists and not expired
  if (!user.forgot_pass_otp || !user.forgot_pass_expiry) {
    req.flash("error_msg", "Invalid or expired OTP");
    return res.redirect("/auth/reset-password");
  }

  // Check if OTP expired
  if (new Date() > new Date(user.forgot_pass_expiry)) {
    req.flash("error_msg", "OTP has expired. Please request a new one");
    return res.redirect("/auth/forgot-password");
  }

  // Update password
  user.password = password;
  user.forgot_pass_otp = null;
  user.forgot_pass_expiry = null;
  await user.save();

  req.flash(
    "success_msg",
    "Password reset successful! You can now log in with your new password.",
  );
  res.redirect("/auth/login");
});

// @desc    Logout user
// @route   GET /auth/logout
// @access  Private
exports.logout = (req, res, next) => {
  // Clear cookies
  res.clearCookie("jwt");
  res.clearCookie("refresh_token");

  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success_msg", "You are logged out");
    res.redirect("/auth/login");
  });
};
