-- Create database
CREATE DATABASE IF NOT EXISTS event_management;
USE event_management;

-- Users table
CREATE TABLE IF NOT EXISTS Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fullName VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('SuperAdmin', 'Admin', 'Office Staff', 'Ticket Checker', 'User') DEFAULT 'User',
  profileImage VARCHAR(255) NULL,
  isActive BOOLEAN DEFAULT TRUE,
  lastLogin DATETIME NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Event Categories table
CREATE TABLE IF NOT EXISTS EventCategories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL,
  icon VARCHAR(255) NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE IF NOT EXISTS Events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  categoryId INT NOT NULL,
  startDate DATETIME NOT NULL,
  endDate DATETIME NOT NULL,
  venue VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  status ENUM('Upcoming', 'Ongoing', 'Completed') DEFAULT 'Upcoming',
  featuredImage VARCHAR(255) NULL,
  capacity INT NOT NULL,
  isPublished BOOLEAN DEFAULT FALSE,
  createdBy INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoryId) REFERENCES EventCategories(id),
  FOREIGN KEY (createdBy) REFERENCES Users(id)
);

-- Sponsors table
CREATE TABLE IF NOT EXISTS Sponsors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  logo VARCHAR(255) NULL,
  type ENUM('Sponsor', 'Partner') DEFAULT 'Sponsor',
  website VARCHAR(255) NULL,
  eventId INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (eventId) REFERENCES Events(id) ON DELETE CASCADE
);

-- Tickets table
CREATE TABLE IF NOT EXISTS Tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  eventId INT NOT NULL,
  type VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL,
  quantitySold INT DEFAULT 0,
  description TEXT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  saleStartDate DATETIME NOT NULL,
  saleEndDate DATETIME NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (eventId) REFERENCES Events(id) ON DELETE CASCADE
);

-- Referrals table
CREATE TABLE IF NOT EXISTS Referrals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  commissionPercentage DECIMAL(5, 2) NOT NULL DEFAULT 5.00,
  usageCount INT DEFAULT 0,
  totalEarnings DECIMAL(10, 2) DEFAULT 0,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

-- Bookings table
CREATE TABLE IF NOT EXISTS Bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  eventId INT NOT NULL,
  ticketId INT NOT NULL,
  quantity INT NOT NULL,
  totalAmount DECIMAL(10, 2) NOT NULL,
  discountAmount DECIMAL(10, 2) DEFAULT 0,
  promoCode VARCHAR(50) NULL,
  referralCode VARCHAR(20) NULL,
  status ENUM('Pending', 'Confirmed', 'Cancelled', 'Refunded') DEFAULT 'Pending',
  paymentMethod ENUM('Bkash', 'Nagad', 'Card', 'Cash') NOT NULL,
  paymentStatus ENUM('Pending', 'Paid', 'Failed', 'Refunded') DEFAULT 'Pending',
  transactionId VARCHAR(100) NULL,
  qrCode VARCHAR(255) NULL,
  isCheckedIn BOOLEAN DEFAULT FALSE,
  checkedInAt DATETIME NULL,
  checkedInBy INT NULL,
  adminNotes TEXT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id),
  FOREIGN KEY (eventId) REFERENCES Events(id),
  FOREIGN KEY (ticketId) REFERENCES Tickets(id),
  FOREIGN KEY (checkedInBy) REFERENCES Users(id)
);

-- Product Categories table
CREATE TABLE IF NOT EXISTS ProductCategories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL,
  icon VARCHAR(255) NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS Products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  categoryId INT NOT NULL,
  sku VARCHAR(50) NOT NULL UNIQUE,
  costPrice DECIMAL(10, 2) NOT NULL,
  sellingPrice DECIMAL(10, 2) NOT NULL,
  currentStock INT NOT NULL DEFAULT 0,
  minimumStock INT NOT NULL DEFAULT 5,
  image VARCHAR(255) NULL,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoryId) REFERENCES ProductCategories(id)
);

-- Product Variants table
CREATE TABLE IF NOT EXISTS ProductVariants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  productId INT NOT NULL,
  size VARCHAR(50) NULL,
  color VARCHAR(50) NULL,
  additionalPrice DECIMAL(10, 2) DEFAULT 0,
  stock INT DEFAULT 0,
  variantSku VARCHAR(50) NOT NULL UNIQUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS Suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NULL,
  contactPerson VARCHAR(100) NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inventory table
CREATE TABLE IF NOT EXISTS Inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  productId INT NOT NULL,
  variantId INT NULL,
  type ENUM('In', 'Out') NOT NULL,
  quantity INT NOT NULL,
  note TEXT NULL,
  supplierId INT NULL,
  price DECIMAL(10, 2) NOT NULL,
  recordedBy INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES Products(id),
  FOREIGN KEY (variantId) REFERENCES ProductVariants(id) ON DELETE SET NULL,
  FOREIGN KEY (supplierId) REFERENCES Suppliers(id) ON DELETE SET NULL,
  FOREIGN KEY (recordedBy) REFERENCES Users(id)
);

-- Payouts table
CREATE TABLE IF NOT EXISTS Payouts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status ENUM('Pending', 'Paid', 'Cancelled') DEFAULT 'Pending',
  paymentMethod VARCHAR(50) NOT NULL,
  transactionId VARCHAR(100) NULL,
  note TEXT NULL,
  processedBy INT NULL,
  processedAt DATETIME NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id),
  FOREIGN KEY (processedBy) REFERENCES Users(id)
);

-- Newsletter Subscribers table
CREATE TABLE IF NOT EXISTS NewsletterSubscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Settings table
CREATE TABLE IF NOT EXISTS Settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  settingKey VARCHAR(100) NOT NULL UNIQUE,
  settingValue TEXT NOT NULL,
  description TEXT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);