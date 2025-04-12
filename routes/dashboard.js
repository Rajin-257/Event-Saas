const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

// Dashboard route - will route to appropriate dashboard based on user role
router.get('/', auth, dashboardController.getDashboard);

module.exports = router;