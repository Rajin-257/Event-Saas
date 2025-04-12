const User = require('./User');
const Event = require('./Event');
const EventCategory = require('./EventCategory');
const Sponsor = require('./Sponsor');
const Ticket = require('./Ticket');
const Booking = require('./Booking');
const Product = require('./Product');
const ProductCategory = require('./ProductCategory');
const ProductVariant = require('./ProductVariant');
const Inventory = require('./Inventory');
const Supplier = require('./Supplier');
const Referral = require('./Referral');
const Payout = require('./Payout');

// User Associations
User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
User.hasOne(Referral, { foreignKey: 'userId', as: 'referral' });
User.hasMany(Payout, { foreignKey: 'userId', as: 'payouts' });
User.hasMany(Inventory, { foreignKey: 'recordedBy', as: 'inventoryRecords' });
User.hasMany(Booking, { foreignKey: 'checkedInBy', as: 'checkedInBookings' });
User.hasMany(Event, { foreignKey: 'createdBy', as: 'events' });

// Event Associations
Event.belongsTo(EventCategory, { foreignKey: 'categoryId', as: 'category' });
Event.hasMany(Ticket, { foreignKey: 'eventId', as: 'tickets' });
Event.hasMany(Sponsor, { foreignKey: 'eventId', as: 'sponsors' });
Event.hasMany(Booking, { foreignKey: 'eventId', as: 'bookings' });
Event.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// EventCategory Associations
EventCategory.hasMany(Event, { foreignKey: 'categoryId', as: 'events' });

// Sponsor Associations
Sponsor.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

// Ticket Associations
Ticket.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
Ticket.hasMany(Booking, { foreignKey: 'ticketId', as: 'bookings' });

// Booking Associations
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Booking.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
Booking.belongsTo(Ticket, { foreignKey: 'ticketId', as: 'ticket' });
Booking.belongsTo(User, { foreignKey: 'checkedInBy', as: 'checkedInByUser' });

// Product Associations
Product.belongsTo(ProductCategory, { foreignKey: 'categoryId', as: 'category' });
Product.hasMany(ProductVariant, { foreignKey: 'productId', as: 'variants' });
Product.hasMany(Inventory, { foreignKey: 'productId', as: 'inventoryRecords' });

// ProductCategory Associations
ProductCategory.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

// ProductVariant Associations
ProductVariant.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
ProductVariant.hasMany(Inventory, { foreignKey: 'variantId', as: 'inventoryRecords' });

// Inventory Associations
Inventory.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Inventory.belongsTo(ProductVariant, { foreignKey: 'variantId', as: 'variant' });
Inventory.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });
Inventory.belongsTo(User, { foreignKey: 'recordedBy', as: 'recorder' });

// Supplier Associations
Supplier.hasMany(Inventory, { foreignKey: 'supplierId', as: 'inventoryRecords' });

// Referral Associations
Referral.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Payout Associations
Payout.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Payout.belongsTo(User, { foreignKey: 'processedBy', as: 'processor' });

module.exports = {
  User,
  Event,
  EventCategory,
  Sponsor,
  Ticket,
  Booking,
  Product,
  ProductCategory,
  ProductVariant,
  Inventory,
  Supplier,
  Referral,
  Payout
};