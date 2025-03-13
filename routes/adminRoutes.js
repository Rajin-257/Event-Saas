/**
 * Admin Routes
 */
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { ensureAuthenticated, ensureRole } = require('../middlewares/auth');
const validators = require('../utils/validators');

// All admin routes require admin role
router.use(ensureAuthenticated, ensureRole('admin'));

// API Routes
// User management
router.get('/api/users', validators.paginationRules, validators.validate, adminController.getAllUsers);
router.get('/api/users/:id', adminController.getUserById);
router.post('/api/users',  validators.validate, adminController.createUser);
router.put('/api/users/:id', adminController.updateUser);
router.post('/api/users/:id/reset-password', adminController.resetUserPassword);
router.delete('/api/users/:id', adminController.deleteUser);

// Department management
router.get('/api/departments', validators.paginationRules, validators.validate, adminController.getAllDepartments);
router.post('/api/departments',  validators.validate, adminController.createDepartment);
router.put('/api/departments/:id',  validators.validate, adminController.updateDepartment);
router.delete('/api/departments/:id', adminController.deleteDepartment);

// Payment method management
router.get('/api/payment-methods', adminController.getAllPaymentMethods);
router.post('/api/payment-methods',  validators.validate, adminController.createPaymentMethod);
router.put('/api/payment-methods/:id',  validators.validate, adminController.updatePaymentMethod);

// System stats
router.get('/api/stats', adminController.getSystemStats);

// Web Routes
router.get('/', adminController.renderDashboard);
router.get('/users', adminController.renderUsersPage);
router.get('/departments', adminController.renderDepartmentsPage);
router.get('/payments', adminController.renderPaymentsPage);
router.get('/settings', adminController.renderSettingsPage);

module.exports = router;