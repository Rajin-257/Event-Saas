const Product = require('../models/Product');
const ProductCategory = require('../models/ProductCategory');
const ProductVariant = require('../models/ProductVariant');
const Inventory = require('../models/Inventory');
const Supplier = require('../models/Supplier');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const upload = require('../middleware/upload');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    
    // Filters
    const filters = {};
    
    if (req.query.category) {
      filters.categoryId = req.query.category;
    }
    
    if (req.query.search) {
      filters.name = {
        [Op.like]: `%${req.query.search}%`
      };
    }
    
    if (req.query.stock === 'low') {
      filters.currentStock = {
        [Op.lte]: sequelize.col('minimumStock')
      };
    }
    
    // Get products
    const { count, rows: products } = await Product.findAndCountAll({
      where: filters,
      include: [
        { model: ProductCategory, as: 'category' }
      ],
      order: [['name', 'ASC']],
      limit,
      offset
    });
    
    // Get categories for filter
    const categories = await ProductCategory.findAll({
      order: [['name', 'ASC']]
    });
    
    res.render('products/index', {
      title: 'Product Inventory',
      products,
      categories,
      filters: req.query,
      pagination: {
        page,
        pageCount: Math.ceil(count / limit),
        count
      },
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error fetching products', { error: error.message });
    req.flash('error', 'Failed to fetch products');
    res.redirect('/dashboard');
  }
};

// Show create product form
exports.getCreateProduct = async (req, res) => {
  try {
    const categories = await ProductCategory.findAll({
      order: [['name', 'ASC']]
    });
    
    res.render('products/create', {
      title: 'Add New Product',
      categories,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error loading create product page', { error: error.message });
    req.flash('error', 'Failed to load create product page');
    res.redirect('/products');
  }
};

// Process product creation
exports.postCreateProduct = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      name,
      description,
      categoryId,
      sku,
      costPrice,
      sellingPrice,
      currentStock,
      minimumStock
    } = req.body;
    
    // Check if SKU is unique
    const existingSku = await Product.findOne({
      where: { sku },
      transaction
    });
    
    if (existingSku) {
      await transaction.rollback();
      req.flash('error', 'SKU already exists');
      return res.redirect('/products/create');
    }
    
    // Create product
    const product = await Product.create({
      name,
      description,
      categoryId,
      sku,
      costPrice,
      sellingPrice,
      currentStock: currentStock || 0,
      minimumStock: minimumStock || 5,
      image: req.file ? `/uploads/products/${req.file.filename}` : null,
      isActive: true
    }, { transaction });
    
    // Add initial inventory entry if stock > 0
    if (parseInt(currentStock) > 0) {
      await Inventory.create({
        productId: product.id,
        type: 'In',
        quantity: parseInt(currentStock),
        note: 'Initial stock',
        price: costPrice,
        recordedBy: req.user.id
      }, { transaction });
    }
    
    await transaction.commit();
    
    logger.info(`Product created: ${name}`, { userId: req.user.id, productId: product.id });
    
    req.flash('success', 'Product created successfully');
    res.redirect(`/products/${product.id}`);
  } catch (error) {
    await transaction.rollback();
    logger.error('Product creation error', { error: error.message });
    req.flash('error', 'Failed to create product');
    res.redirect('/products/create');
  }
};

// Show product details
exports.getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id, {
      include: [
        { model: ProductCategory, as: 'category' },
        { model: ProductVariant, as: 'variants' }
      ]
    });
    
    if (!product) {
      req.flash('error', 'Product not found');
      return res.redirect('/products');
    }
    
    // Get inventory history
    const inventory = await Inventory.findAll({
      where: { productId: id },
      include: [
        { model: User, as: 'recorder', attributes: ['id', 'fullName'] },
        { model: Supplier, as: 'supplier', required: false }
      ],
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    
    res.render('products/details', {
      title: product.name,
      product,
      inventory,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error fetching product details', { error: error.message });
    req.flash('error', 'Failed to fetch product details');
    res.redirect('/products');
  }
};

// Show edit product form
exports.getEditProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id);
    
    if (!product) {
      req.flash('error', 'Product not found');
      return res.redirect('/products');
    }
    
    const categories = await ProductCategory.findAll({
      order: [['name', 'ASC']]
    });
    
    res.render('products/edit', {
      title: `Edit ${product.name}`,
      product,
      categories,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error loading edit product page', { error: error.message });
    req.flash('error', 'Failed to load edit product page');
    res.redirect('/products');
  }
};

// Process product update
exports.postUpdateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      categoryId,
      sellingPrice,
      minimumStock,
      isActive
    } = req.body;
    
    const product = await Product.findByPk(id);
    
    if (!product) {
      req.flash('error', 'Product not found');
      return res.redirect('/products');
    }
    
    // Update product
    product.name = name;
    product.description = description;
    product.categoryId = categoryId;
    product.sellingPrice = sellingPrice;
    product.minimumStock = minimumStock;
    product.isActive = isActive === 'on';
    
    if (req.file) {
      product.image = `/uploads/products/${req.file.filename}`;
    }
    
    await product.save();
    
    logger.info(`Product updated: ${name}`, { userId: req.user.id, productId: id });
    
    req.flash('success', 'Product updated successfully');
    res.redirect(`/products/${id}`);
  } catch (error) {
    logger.error('Product update error', { error: error.message });
    req.flash('error', 'Failed to update product');
    res.redirect(`/products/${req.params.id}/edit`);
  }
};

// Product variants
exports.getProductVariants = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id, {
      include: [{ model: ProductVariant, as: 'variants' }]
    });
    
    if (!product) {
      req.flash('error', 'Product not found');
      return res.redirect('/products');
    }
    
    res.render('products/variants', {
      title: `Variants - ${product.name}`,
      product,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error fetching product variants', { error: error.message });
    req.flash('error', 'Failed to fetch product variants');
    res.redirect('/products');
  }
};

// Add product variant
exports.postAddVariant = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { size, color, additionalPrice, stock, variantSku } = req.body;
    
    const product = await Product.findByPk(id, { transaction });
    
    if (!product) {
      await transaction.rollback();
      req.flash('error', 'Product not found');
      return res.redirect('/products');
    }
    
    // Check if variant SKU is unique
    const existingVariantSku = await ProductVariant.findOne({
      where: { variantSku },
      transaction
    });
    
    if (existingVariantSku) {
      await transaction.rollback();
      req.flash('error', 'Variant SKU already exists');
      return res.redirect(`/products/${id}/variants`);
    }
    
    // Create variant
    const variant = await ProductVariant.create({
      productId: id,
      size,
      color,
      additionalPrice,
      stock: stock || 0,
      variantSku
    }, { transaction });
    
    // Add inventory entry if stock > 0
    if (parseInt(stock) > 0) {
      await Inventory.create({
        productId: product.id,
        variantId: variant.id,
        type: 'In',
        quantity: parseInt(stock),
        note: 'Initial variant stock',
        price: product.costPrice,
        recordedBy: req.user.id
      }, { transaction });
    }
    
    await transaction.commit();
    
    logger.info(`Product variant added: ${variantSku}`, { userId: req.user.id, productId: id });
    
    req.flash('success', 'Variant added successfully');
    res.redirect(`/products/${id}/variants`);
  } catch (error) {
    await transaction.rollback();
    logger.error('Variant creation error', { error: error.message });
    req.flash('error', 'Failed to add variant');
    res.redirect(`/products/${req.params.id}/variants`);
  }
};

// Update product variant
exports.postUpdateVariant = async (req, res) => {
  try {
    const { id, variantId } = req.params;
    const { size, color, additionalPrice } = req.body;
    
    const variant = await ProductVariant.findOne({
      where: {
        id: variantId,
        productId: id
      }
    });
    
    if (!variant) {
      req.flash('error', 'Variant not found');
      return res.redirect(`/products/${id}/variants`);
    }
    
    // Update variant
    variant.size = size;
    variant.color = color;
    variant.additionalPrice = additionalPrice;
    
    await variant.save();
    
    logger.info(`Product variant updated: ${variant.variantSku}`, { userId: req.user.id });
    
    req.flash('success', 'Variant updated successfully');
    res.redirect(`/products/${id}/variants`);
  } catch (error) {
    logger.error('Variant update error', { error: error.message });
    req.flash('error', 'Failed to update variant');
    res.redirect(`/products/${req.params.id}/variants`);
  }
};

// Delete product variant
exports.deleteVariant = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id, variantId } = req.params;
    
    const variant = await ProductVariant.findOne({
      where: {
        id: variantId,
        productId: id
      },
      transaction
    });
    
    if (!variant) {
      await transaction.rollback();
      req.flash('error', 'Variant not found');
      return res.redirect(`/products/${id}/variants`);
    }
    
    // Delete variant
    await variant.destroy({ transaction });
    
    await transaction.commit();
    
    logger.info(`Product variant deleted: ${variant.variantSku}`, { userId: req.user.id });
    
    req.flash('success', 'Variant deleted successfully');
    res.redirect(`/products/${id}/variants`);
  } catch (error) {
    await transaction.rollback();
    logger.error('Variant deletion error', { error: error.message });
    req.flash('error', 'Failed to delete variant');
    res.redirect(`/products/${req.params.id}/variants`);
  }
};

// Show stock management form
exports.getStockManagement = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id, {
      include: [
        { model: ProductCategory, as: 'category' },
        { model: ProductVariant, as: 'variants' }
      ]
    });
    
    if (!product) {
      req.flash('error', 'Product not found');
      return res.redirect('/products');
    }
    
    // Get suppliers
    const suppliers = await Supplier.findAll({
      order: [['name', 'ASC']]
    });
    
    res.render('products/stock', {
      title: `Stock Management - ${product.name}`,
      product,
      suppliers,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error loading stock management page', { error: error.message });
    req.flash('error', 'Failed to load stock management page');
    res.redirect('/products');
  }
};

// Process stock update
exports.postUpdateStock = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const {
      type,
      quantity,
      note,
      supplierId,
      price,
      variantId
    } = req.body;
    
    const product = await Product.findByPk(id, { transaction });
    
    if (!product) {
      await transaction.rollback();
      req.flash('error', 'Product not found');
      return res.redirect('/products');
    }
    
    // Validate quantity
    if (!quantity || quantity <= 0) {
      await transaction.rollback();
      req.flash('error', 'Quantity must be greater than zero');
      return res.redirect(`/products/${id}/stock`);
    }
    
    // Check if removing more than available (for stock out)
    if (type === 'Out') {
      if (variantId) {
        const variant = await ProductVariant.findByPk(variantId, { transaction });
        if (!variant || variant.stock < quantity) {
          await transaction.rollback();
          req.flash('error', 'Not enough stock in this variant');
          return res.redirect(`/products/${id}/stock`);
        }
        
        // Update variant stock
        variant.stock = variant.stock - parseInt(quantity);
        await variant.save({ transaction });
      } else {
        if (product.currentStock < quantity) {
          await transaction.rollback();
          req.flash('error', 'Not enough stock');
          return res.redirect(`/products/${id}/stock`);
        }
        
        // Update product stock
        product.currentStock = product.currentStock - parseInt(quantity);
        await product.save({ transaction });
      }
    } else {
      // For stock in
      if (variantId) {
        const variant = await ProductVariant.findByPk(variantId, { transaction });
        if (!variant) {
          await transaction.rollback();
          req.flash('error', 'Variant not found');
          return res.redirect(`/products/${id}/stock`);
        }
        
        // Update variant stock
        variant.stock = variant.stock + parseInt(quantity);
        await variant.save({ transaction });
      } else {
        // Update product stock
        product.currentStock = product.currentStock + parseInt(quantity);
        
        // Update cost price for stock in
        if (price) {
          product.costPrice = price;
        }
        
        await product.save({ transaction });
      }
    }
    
    // Create inventory record
    await Inventory.create({
      productId: id,
      variantId: variantId || null,
      type,
      quantity: parseInt(quantity),
      note,
      supplierId: supplierId || null,
      price: price || product.costPrice,
      recordedBy: req.user.id
    }, { transaction });
    
    await transaction.commit();
    
    logger.info(`Stock ${type.toLowerCase()} recorded for product: ${product.name}`, { 
      userId: req.user.id, 
      productId: id,
      quantity
    });
    
    req.flash('success', `Stock ${type.toLowerCase()} recorded successfully`);
    res.redirect(`/products/${id}`);
  } catch (error) {
    await transaction.rollback();
    logger.error('Stock update error', { error: error.message });
    req.flash('error', 'Failed to update stock');
    res.redirect(`/products/${req.params.id}/stock`);
  }
};

// Product categories
exports.getProductCategories = async (req, res) => {
  try {
    const categories = await ProductCategory.findAll({
      order: [['name', 'ASC']]
    });
    
    res.render('products/categories', {
      title: 'Product Categories',
      categories,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error fetching product categories', { error: error.message });
    req.flash('error', 'Failed to fetch categories');
    res.redirect('/products');
  }
};

// Create product category
exports.postCreateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    await ProductCategory.create({
      name,
      description,
      icon: req.file ? `/uploads/categories/${req.file.filename}` : null
    });
    
    logger.info(`Product category created: ${name}`, { userId: req.user.id });
    
    req.flash('success', 'Category created successfully');
    res.redirect('/products/categories');
  } catch (error) {
    logger.error('Category creation error', { error: error.message });
    req.flash('error', 'Failed to create category');
    res.redirect('/products/categories');
  }
};

// Update product category
exports.postUpdateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const category = await ProductCategory.findByPk(id);
    
    if (!category) {
      req.flash('error', 'Category not found');
      return res.redirect('/products/categories');
    }
    
    category.name = name;
    category.description = description;
    
    if (req.file) {
      category.icon = `/uploads/categories/${req.file.filename}`;
    }
    
    await category.save();
    
    logger.info(`Product category updated: ${name}`, { userId: req.user.id, categoryId: id });
    
    req.flash('success', 'Category updated successfully');
    res.redirect('/products/categories');
  } catch (error) {
    logger.error('Category update error', { error: error.message });
    req.flash('error', 'Failed to update category');
    res.redirect('/products/categories');
  }
};

// Delete product category
exports.deleteCategory = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Check if category is used in any products
    const products = await Product.findAll({
      where: { categoryId: id },
      transaction
    });
    
    if (products.length > 0) {
      await transaction.rollback();
      req.flash('error', 'Cannot delete category that is used in products');
      return res.redirect('/products/categories');
    }
    
    await ProductCategory.destroy({
      where: { id },
      transaction
    });
    
    await transaction.commit();
    
    logger.info(`Product category deleted`, { userId: req.user.id, categoryId: id });
    
    req.flash('success', 'Category deleted successfully');
    res.redirect('/products/categories');
  } catch (error) {
    await transaction.rollback();
    logger.error('Category deletion error', { error: error.message });
    req.flash('error', 'Failed to delete category');
    res.redirect('/products/categories');
  }
};

// Supplier management
exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({
      order: [['name', 'ASC']]
    });
    
    res.render('products/suppliers', {
      title: 'Suppliers',
      suppliers,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error fetching suppliers', { error: error.message });
    req.flash('error', 'Failed to fetch suppliers');
    res.redirect('/products');
  }
};

// Create supplier
exports.postCreateSupplier = async (req, res) => {
  try {
    const { name, email, phone, address, contactPerson } = req.body;
    
    await Supplier.create({
      name,
      email,
      phone,
      address,
      contactPerson
    });
    
    logger.info(`Supplier created: ${name}`, { userId: req.user.id });
    
    req.flash('success', 'Supplier created successfully');
    res.redirect('/products/suppliers');
  } catch (error) {
    logger.error('Supplier creation error', { error: error.message });
    req.flash('error', 'Failed to create supplier');
    res.redirect('/products/suppliers');
  }
};

// Update supplier
exports.postUpdateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, contactPerson } = req.body;
    
    const supplier = await Supplier.findByPk(id);
    
    if (!supplier) {
      req.flash('error', 'Supplier not found');
      return res.redirect('/products/suppliers');
    }
    
    supplier.name = name;
    supplier.email = email;
    supplier.phone = phone;
    supplier.address = address;
    supplier.contactPerson = contactPerson;
    
    await supplier.save();
    
    logger.info(`Supplier updated: ${name}`, { userId: req.user.id, supplierId: id });
    
    req.flash('success', 'Supplier updated successfully');
    res.redirect('/products/suppliers');
  } catch (error) {
    logger.error('Supplier update error', { error: error.message });
    req.flash('error', 'Failed to update supplier');
    res.redirect('/products/suppliers');
  }
};

// Delete supplier
exports.deleteSupplier = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Check if supplier is used in any inventory records
    const inventoryCount = await Inventory.count({
      where: { supplierId: id },
      transaction
    });
    
    if (inventoryCount > 0) {
      await transaction.rollback();
      req.flash('error', 'Cannot delete supplier that is used in inventory records');
      return res.redirect('/products/suppliers');
    }
    
    await Supplier.destroy({
      where: { id },
      transaction
    });
    
    await transaction.commit();
    
    logger.info(`Supplier deleted`, { userId: req.user.id, supplierId: id });
    
    req.flash('success', 'Supplier deleted successfully');
    res.redirect('/products/suppliers');
  } catch (error) {
    await transaction.rollback();
    logger.error('Supplier deletion error', { error: error.message });
    req.flash('error', 'Failed to delete supplier');
    res.redirect('/products/suppliers');
  }
};

// Export inventory data to CSV
exports.exportInventoryCSV = async (req, res) => {
  try {
    // Get all products with their categories
    const products = await Product.findAll({
      include: [
        { model: ProductCategory, as: 'category' }
      ],
      order: [['name', 'ASC']]
    });
    
    // Prepare CSV data
    let csvData = 'SKU,Name,Category,Cost Price,Selling Price,Current Stock,Minimum Stock,Status\n';
    
    products.forEach(product => {
      csvData += `${product.sku},"${product.name}","${product.category.name}",${product.costPrice},${product.sellingPrice},${product.currentStock},${product.minimumStock},${product.isActive ? 'Active' : 'Inactive'}\n`;
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory.csv');
    
    // Send CSV data
    res.status(200).send(csvData);
  } catch (error) {
    logger.error('CSV export error', { error: error.message });
    req.flash('error', 'Failed to export inventory data');
    res.redirect('/products');
  }
};

// Get inventory valuation report
exports.getInventoryValuation = async (req, res) => {
  try {
    // Get products with categories
    const products = await Product.findAll({
      include: [
        { model: ProductCategory, as: 'category' }
      ],
      order: [['name', 'ASC']]
    });
    
    // Calculate totals
    let totalCostValue = 0;
    let totalRetailValue = 0;
    let potentialProfit = 0;
    
    products.forEach(product => {
      const costValue = product.costPrice * product.currentStock;
      const retailValue = product.sellingPrice * product.currentStock;
      
      totalCostValue += costValue;
      totalRetailValue += retailValue;
      potentialProfit += (retailValue - costValue);
    });
    
    res.render('products/valuation', {
      title: 'Inventory Valuation',
      products,
      summary: {
        totalCostValue,
        totalRetailValue,
        potentialProfit,
        productCount: products.length
      },
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Inventory valuation error', { error: error.message });
    req.flash('error', 'Failed to generate valuation report');
    res.redirect('/products');
  }
};

// Get fast/slow moving products report
exports.getProductMovementReport = async (req, res) => {
  try {
    // Time period filter
    const period = req.query.period || '30'; // Default 30 days
    const startDate = moment().subtract(parseInt(period), 'days').toDate();
    
    // Get inventory movement data
    const inventoryMovement = await Inventory.findAll({
      attributes: [
        'productId',
        [sequelize.literal('SUM(CASE WHEN type = "Out" THEN quantity ELSE 0 END)'), 'outQuantity'],
        [sequelize.literal('SUM(CASE WHEN type = "In" THEN quantity ELSE 0 END)'), 'inQuantity']
      ],
      where: {
        createdAt: {
          [Op.gte]: startDate
        }
      },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'sku', 'currentStock', 'sellingPrice'],
          include: [
            { model: ProductCategory, as: 'category' }
          ]
        }
      ],
      group: ['productId'],
      order: [[sequelize.literal('outQuantity'), 'DESC']]
    });
    
    // Get products with no movement
    const productsWithMovement = inventoryMovement.map(item => item.product.id);
    
    const noMovementProducts = await Product.findAll({
      where: {
        id: {
          [Op.notIn]: productsWithMovement
        }
      },
      include: [
        { model: ProductCategory, as: 'category' }
      ]
    });
    
    res.render('products/movement', {
      title: 'Product Movement Report',
      inventoryMovement,
      noMovementProducts,
      period,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Product movement report error', { error: error.message });
    req.flash('error', 'Failed to generate movement report');
    res.redirect('/products');
  }
};