const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Report routes
router.get('/ticket-sales', auth, roleCheck(['SuperAdmin', 'Admin', 'Office Staff']), reportController.getTicketSalesReport);
router.get('/inventory', auth, roleCheck(['SuperAdmin', 'Admin', 'Office Staff']), reportController.getInventoryReport);
router.get('/commission', auth, roleCheck(['SuperAdmin', 'Admin']), reportController.getCommissionReport);
router.get('/event-performance', auth, roleCheck(['SuperAdmin', 'Admin']), reportController.getEventPerformanceReport);
router.get('/event-performance/:id', auth, roleCheck(['SuperAdmin', 'Admin']), reportController.getEventPerformanceReport);
router.get('/user-activity', auth, roleCheck(['SuperAdmin', 'Admin']), reportController.getUserActivityReport);

module.exports = router;