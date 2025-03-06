const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const settingsController = require("../controllers/settingsController");
const {
  validate,
  profileUpdateValidation,
  changePasswordValidation,
} = require("../middlewares/validation");
const { protect } = require("../middlewares/auth");

// Protect all routes in this router
router.use(protect);

// Frontpage Settings routes
router.get("/frontpage-setting", settingsController.getFrontPageSettings);
router.put("/frontpage-setting", settingsController.updateFrontPageSettings);
router.post("/frontpage-setting", settingsController.updateFrontPageSettings); // Alternative for backward compatibility

// Menu Settings routes
router.get("/menu-setting", settingsController.getMenuSettings);
router.put("/menu-setting", settingsController.updateMenuSettings);
router.post("/menu-setting", settingsController.updateMenuSettings); // Adding POST for compatibility

module.exports = router;
