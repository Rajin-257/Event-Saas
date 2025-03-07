const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const settingsController = require("../controllers/settingsController");
const guestsController = require("../controllers/guestsController"); // Import merged controller
const eventsController = require("../controllers/eventsController");
const galleryController = require("../controllers/galleryController");
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
router.post("/frontpage-setting", settingsController.updateFrontPageSettings);

// Menu Settings routes
router.get("/menu-setting", settingsController.getMenuSettings);
router.put("/menu-setting", settingsController.updateMenuSettings);
router.post("/menu-setting", settingsController.updateMenuSettings);

// Guest Settings Routes
router.get("/guests", guestsController.getGuestDetails);
router.post(
  "/guests/create",
  guestsController.uploadGuestImage,
  guestsController.createGuest,
);
router.get("/guests/:id", guestsController.getGuestById);
router.put(
  "/guests/:id",
  guestsController.uploadGuestImage,
  guestsController.updateGuest,
);
router.post(
  "/guests/update/:id",
  guestsController.uploadGuestImage,
  guestsController.updateGuest,
);
router.delete("/guests/:id", guestsController.deleteGuest);
router.post("/guests/delete/:id", guestsController.deleteGuest);

// Department Settings Routes
router.get("/departments", guestsController.getDepartments);
router.post("/departments/create", guestsController.createDepartment);
router.get("/departments/:id", guestsController.getDepartmentById);
router.put("/departments/:id", guestsController.updateDepartment);
router.post("/departments/update/:id", guestsController.updateDepartment);
router.delete("/departments/:id", guestsController.deleteDepartment);
router.post("/departments/delete/:id", guestsController.deleteDepartment);

router.get("/events", eventsController.getEventDetails);
router.post("/events/create", eventsController.createEvent);
router.get("/events/:id", eventsController.getEventById);
router.put("/events/:id", eventsController.updateEvent);
router.post("/events/update/:id", eventsController.updateEvent);
router.delete("/events/:id", eventsController.deleteEvent);
router.post("/events/delete/:id", eventsController.deleteEvent);

router.get("/gallery", galleryController.getAllGallery);

// Add a new gallery item
router.post("/gallery/add", galleryController.addGallery);

// Delete a gallery item
router.post("/gallery/delete", galleryController.deleteGallery);

module.exports = router;
