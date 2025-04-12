const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');

// Subscribe to newsletter
router.post('/subscribe', newsletterController.subscribe);

// Unsubscribe from newsletter
router.get('/unsubscribe', newsletterController.unsubscribe);

module.exports = router;