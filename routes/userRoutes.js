const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  validate,
  profileUpdateValidation,
  changePasswordValidation,
} = require("../middlewares/validation");
const { protect } = require("../middlewares/auth");

// Protect all routes in this router
router.use(protect);

// Dashboard
router.get("/dashboard", userController.getDashboard);

// Profile routes
router.get("/profile", userController.getProfile);
router.put(
  "/profile",
  validate(profileUpdateValidation),
  userController.updateProfile,
);

// Change password routes
router.get("/change-password", userController.getChangePassword);
router.put(
  "/change-password",
  validate(changePasswordValidation),
  userController.updatePassword,
);

router.get("/edit-profile", userController.getEditProfile);
router.put(
  "/edit-profile",
  validate(profileUpdateValidation),
  userController.updateProfile,
);

router.get("/user-details", userController.getUserDetails);

module.exports = router;
