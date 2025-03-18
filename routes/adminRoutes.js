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
router.get('/api/users',  adminController.getAllUsers);
router.get('/api/users/:id', adminController.getUserById);
router.post('/api/users',   adminController.createUser);
router.post('/api/usersUpdate/', adminController.updateUser);
router.post('/api/users/:id/reset-password', adminController.resetUserPassword);
router.post('/api/delUsers', adminController.deleteUser);

// Department management
router.get('/api/departments',  adminController.getAllDepartments);
router.post('/api/departments',   adminController.createDepartment);
router.post('/api/departments/update',   adminController.updateDepartment);
router.post('/api/departments/delete', adminController.deleteDepartment);

// Payment method management
router.get('/api/payment-methods', adminController.getAllPaymentMethods);
router.post('/api/payment-methods',   adminController.createPaymentMethod);
router.put('/api/payment-methods/:id',   adminController.updatePaymentMethod);

// System stats
router.get('/api/stats', adminController.getSystemStats);
 
// Web Routes
router.get('/dashboard', ensureAuthenticated, ensureRole('admin'), adminController.renderDashboard);
router.get('/users', adminController.renderUsersPage);
router.get('/departments', adminController.renderDepartmentsPage);
router.get('/payments', adminController.renderPaymentsPage);
router.get('/settings', adminController.renderSettingsPage);

module.exports = router;