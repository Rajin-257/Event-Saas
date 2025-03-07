const fs = require("fs");
const path = require("path");
const multer = require("multer");
const User = require("../models/User");
const config = require("../config/config");
const { title } = require("process");
const FrontpageSettings = require("../models/frontpage");

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create folder if it doesn't exist
    if (!fs.existsSync(config.paths.avatarUpload)) {
      fs.mkdirSync(config.paths.avatarUpload, { recursive: true });
    }
    cb(null, config.paths.avatarUpload);
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9,
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Set up multer upload
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    // Check file type
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );

    if (mimetype && extname) {
      return cb(null, true);
    }

    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif)"));
  },
}).single("avatar"); // 'avatar' is the name of the input field

// @desc    Dashboard
// @route   GET /user/dashboard
// @access  Private
exports.getDashboard = async (req, res) => {
  const frontpageData = await FrontpageSettings.findOne({
    where: { id: 1 },
  });
  res.render("backend/index", {
    title: "Dashboard",
    frontData: frontpageData || {},
    user: req.user,
  });
};

// @desc    Profile page
// @route   GET /user/edit-profile
// @access  Private
exports.getProfile = async (req, res) => {
  const frontpageData = await FrontpageSettings.findOne({
    where: { id: 1 },
  });
  res.render("backend/userpages/profile", {
    title: "My Profile",
    user: req.user,
    frontData: frontpageData || {},
    formData: req.flash("formData")[0] || req.user,
  });
};
exports.getEditProfile = async (req, res) => {
  const frontpageData = await FrontpageSettings.findOne({
    where: { id: 1 },
  });
  res.render("backend/userpages/editprofile", {
    title: "Edit Profile",
    user: req.user,
    frontData: frontpageData || {},
    formData: req.flash("formData")[0] || req.user,
  });
};

// @desc    Update profile
// @route   PUT /user/edit-profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  // Multer upload middleware
  upload(req, res, async (err) => {
    if (err) {
      req.flash("error_msg", err.message);
      return res.redirect("/user/edit-profile");
    }

    try {
      const { name, mobile, address } = req.body;
      const updateData = { name, mobile, address };

      // If there's a new avatar
      if (req.file) {
        // Delete old avatar if exists
        if (req.user.avatar) {
          const oldAvatarPath = path.join(
            config.paths.avatarUpload,
            path.basename(req.user.avatar),
          );
          if (fs.existsSync(oldAvatarPath)) {
            fs.unlinkSync(oldAvatarPath);
          }
        }

        // Save new avatar path
        updateData.avatar = `/uploads/avatars/${req.file.filename}`;
      }

      // Update user
      await req.user.update(updateData);

      req.flash("success_msg", "Profile updated successfully");
      res.redirect("/user/edit-profile");
    } catch (error) {
      next(error);
    }
  });
};

// @desc    Change password page
// @route   GET /user/change-password
// @access  Private
exports.getChangePassword = async (req, res) => {
  const frontpageData = await FrontpageSettings.findOne({
    where: { id: 1 },
  });
  res.render("backend/userpages/change-password", {
    title: "Change Password",
    frontData: frontpageData || {},
    user: req.user,
  });
};

// @desc    Update password
// @route   PUT /user/change-password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Check current password
    const isMatch = await req.user.matchPassword(currentPassword);

    if (!isMatch) {
      req.flash("error_msg", "Current password is incorrect");
      return res.redirect("/user/change-password");
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    req.flash("success_msg", "Password updated successfully");
    res.redirect("/user/edit-profile");
  } catch (error) {
    next(error);
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.findAll();
    const frontpageData = await FrontpageSettings.findOne({
      where: { id: 1 },
    });

    res.render("backend/userpages/user-details", {
      title: "User's",
      user: req.user,
      users: users,
      frontData: frontpageData || {},
      formData: req.flash("formData")[0] || req.user,
    });
  } catch (error) {
    // Handle any errors
    req.flash("error_msg", "Unable to fetch users");
    res.redirect("/user/dashboard");
  }
};
