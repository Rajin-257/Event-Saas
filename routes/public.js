const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Public routes
router.get('/', publicController.getHomePage);
router.get('/events', publicController.getEventsPage);
router.get('/events/:slug', publicController.getEventDetailPage);
router.get('/about', publicController.getAboutPage);
router.get('/contact', publicController.getContactPage);
router.post('/contact', publicController.postContactForm);

module.exports = router;