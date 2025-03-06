const express = require("express");
const router = express.Router();
const indexController = require("../controllers/indexController");
const {
  validate,
  contactFormValidation,
} = require("../middlewares/validation");
const { isAuthenticated } = require("../middlewares/auth");

// Apply isAuthenticated middleware to all routes
router.use(isAuthenticated);

// Home page
router.get("/", indexController.getIndex);

// Process contact form
// router.post('/contact', validate(contactFormValidation), indexController.postContact);

module.exports = router;
