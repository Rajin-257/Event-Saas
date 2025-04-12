const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

// Product routes
router.get('/', auth, roleCheck(['SuperAdmin', 'Admin', 'Office Staff']), productController.getAllProducts);
router.get('/create', auth, roleCheck(['SuperAdmin', 'Admin']), productController.getCreateProduct);
router.post('/create', auth, roleCheck(['SuperAdmin', 'Admin']), upload.single('image'), productController.postCreateProduct);
router.get('/:id', auth, roleCheck(['SuperAdmin', 'Admin', 'Office Staff']), productController.getProductDetails);
router.get('/:id/edit', auth, roleCheck(['SuperAdmin', 'Admin']), productController.getEditProduct);
router.post('/:id/update', auth, roleCheck(['SuperAdmin', 'Admin']), upload.single('image'), productController.postUpdateProduct);

// Product variant routes
router.get('/:id/variants', auth, roleCheck(['SuperAdmin', 'Admin', 'Office Staff']), productController.getProductVariants);
router.post('/:id/variants/add', auth, roleCheck(['SuperAdmin', 'Admin']), productController.postAddVariant);
router.post('/:id/variants/:variantId/update', auth, roleCheck(['SuperAdmin', 'Admin']), productController.postUpdateVariant);
router.post('/:id/variants/:variantId/delete', auth, roleCheck(['SuperAdmin', 'Admin']), productController.deleteVariant);

// Stock management routes
router.get('/:id/stock', auth, roleCheck(['SuperAdmin', 'Admin', 'Office Staff']), productController.getStockManagement);
router.post('/:id/stock/update', auth, roleCheck(['SuperAdmin', 'Admin', 'Office Staff']), productController.postUpdateStock);

// Category routes
router.get('/categories', auth, roleCheck(['SuperAdmin', 'Admin']), productController.getProductCategories);
router.post('/categories/create', auth, roleCheck(['SuperAdmin', 'Admin']), upload.single('icon'), productController.postCreateCategory);
router.post('/categories/:id/update', auth, roleCheck(['SuperAdmin', 'Admin']), upload.single('icon'), productController.postUpdateCategory);
router.post('/categories/:id/delete', auth, roleCheck(['SuperAdmin', 'Admin']), productController.deleteCategory);

// Supplier routes
router.get('/suppliers', auth, roleCheck(['SuperAdmin', 'Admin', 'Office Staff']), productController.getSuppliers);
router.post('/suppliers/create', auth, roleCheck(['SuperAdmin', 'Admin']), productController.postCreateSupplier);
router.post('/suppliers/:id/update', auth, roleCheck(['SuperAdmin', 'Admin']), productController.postUpdateSupplier);
router.post('/suppliers/:id/delete', auth, roleCheck(['SuperAdmin', 'Admin']), productController.deleteSupplier);

module.exports = router;