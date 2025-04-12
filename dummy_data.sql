USE event_management;

-- Insert Users
INSERT INTO Users (fullName, email, phone, password, role, isActive) VALUES
('Admin User', 'admin@example.com', '1234567890', '$2b$10$9X7vfQvGU.K1WV3FtzT9s.XfXMPrVb8s.iK6x7zs9DI0mXCR.l.xS', 'SuperAdmin', TRUE), -- password: admin123
('Staff Member', 'staff@example.com', '2345678901', '$2b$10$lkLUQQQNQj3c1tedVdoMwe0EVUz.aTZ8JzXwNFAs5HFm79QwTdmCG', 'Office Staff', TRUE), -- password: staff123
('Ticket Person', 'ticket@example.com', '3456789012', '$2b$10$QGYRyMj2XF7BPaZL0EMDLOiSiGh5p.AQFSFnsg3X7L9vbJFnKDFxy', 'Ticket Checker', TRUE), -- password: ticket123
('Regular User', 'user@example.com', '4567890123', '$2b$10$9SqzD8OQ8kK1TxlT83U.ZOCKpPWN1ARrQUisL2/55KiN7QQWyYTrO', 'User', TRUE), -- password: user123
('John Doe', 'john@example.com', '5678901234', '$2b$10$9SqzD8OQ8kK1TxlT83U.ZOCKpPWN1ARrQUisL2/55KiN7QQWyYTrO', 'User', TRUE), -- password: user123
('Jane Smith', 'jane@example.com', '6789012345', '$2b$10$9SqzD8OQ8kK1TxlT83U.ZOCKpPWN1ARrQUisL2/55KiN7QQWyYTrO', 'User', TRUE); -- password: user123

-- Insert Event Categories
INSERT INTO EventCategories (name, description) VALUES
('Conference', 'Professional conferences and summits'),
('Concert', 'Live music performances and concerts'),
('Workshop', 'Interactive learning and skill development'),
('Exhibition', 'Art, science, and cultural exhibitions'),
('Sports', 'Sporting events and competitions'),
('Corporate', 'Corporate events and meetings');

-- Insert Events
INSERT INTO Events (title, description, categoryId, startDate, endDate, venue, address, status, capacity, isPublished, createdBy) VALUES
('Tech Summit 2025', 'Annual technology conference featuring industry leaders', 1, '2025-06-15 09:00:00', '2025-06-17 18:00:00', 'Grand Convention Center', '123 Convention Blvd, Tech City', 'Upcoming', 1000, TRUE, 1),
('Rock Festival', 'The biggest rock music festival of the year', 2, '2025-05-20 16:00:00', '2025-05-22 23:00:00', 'City Stadium', '456 Stadium Road, Music City', 'Upcoming', 5000, TRUE, 1),
('Data Science Workshop', 'Hands-on workshop on machine learning and AI', 3, '2025-04-25 10:00:00', '2025-04-25 17:00:00', 'Digital Learning Center', '789 Education St, Knowledge Town', 'Upcoming', 100, TRUE, 1),
('Art Exhibition', 'Contemporary art from local and international artists', 4, '2025-04-15 09:00:00', '2025-05-15 18:00:00', 'National Art Gallery', '321 Gallery Lane, Art City', 'Ongoing', 300, TRUE, 1),
('Annual Corporate Conference', 'Strategic planning and networking event', 6, '2025-03-10 08:00:00', '2025-03-12 17:00:00', 'Business Tower', '555 Business Avenue, Corporate City', 'Completed', 500, TRUE, 1);

-- Insert Sponsors
INSERT INTO Sponsors (name, type, website, eventId) VALUES
('TechCorp', 'Sponsor', 'https://techcorp.example.com', 1),
('Innovate Inc', 'Partner', 'https://innovate.example.com', 1),
('SoundWave Records', 'Sponsor', 'https://soundwave.example.com', 2),
('Melody Makers', 'Sponsor', 'https://melodymakers.example.com', 2),
('DataTech Solutions', 'Sponsor', 'https://datatech.example.com', 3),
('Art Foundation', 'Partner', 'https://artfoundation.example.com', 4),
('Corporate Alliance', 'Sponsor', 'https://corpalliance.example.com', 5);

-- Insert Tickets
INSERT INTO Tickets (eventId, type, price, quantity, quantitySold, description, isActive, saleStartDate, saleEndDate) VALUES
(1, 'VIP', 1500.00, 100, 30, 'VIP access with exclusive networking sessions', TRUE, '2025-01-15 00:00:00', '2025-06-14 23:59:59'),
(1, 'Standard', 800.00, 500, 150, 'Standard conference access', TRUE, '2025-01-15 00:00:00', '2025-06-14 23:59:59'),
(1, 'Early Bird', 500.00, 200, 200, 'Discounted early bird tickets', FALSE, '2025-01-15 00:00:00', '2025-03-15 23:59:59'),
(2, 'VIP', 2000.00, 500, 200, 'VIP area with backstage access', TRUE, '2025-02-01 00:00:00', '2025-05-19 23:59:59'),
(2, 'General', 800.00, 4000, 1500, 'General admission', TRUE, '2025-02-01 00:00:00', '2025-05-19 23:59:59'),
(3, 'Workshop Seat', 300.00, 100, 45, 'Access to full-day workshop with materials', TRUE, '2025-02-15 00:00:00', '2025-04-24 23:59:59'),
(4, 'General', 150.00, 300, 80, 'Exhibition access', TRUE, '2025-03-01 00:00:00', '2025-05-14 23:59:59'),
(5, 'Professional', 1200.00, 300, 300, 'Full access to conference and workshops', FALSE, '2025-01-05 00:00:00', '2025-03-09 23:59:59'),
(5, 'Basic', 600.00, 200, 150, 'Conference access only', FALSE, '2025-01-05 00:00:00', '2025-03-09 23:59:59');

-- Insert Referrals
INSERT INTO Referrals (userId, code, commissionPercentage, usageCount, totalEarnings, isActive) VALUES
(4, 'REG123', 5.00, 3, 150.00, TRUE),
(5, 'JOHND', 5.00, 1, 40.00, TRUE),
(6, 'JANES', 5.00, 0, 0.00, TRUE);

-- Insert Bookings
INSERT INTO Bookings (userId, eventId, ticketId, quantity, totalAmount, discountAmount, promoCode, referralCode, status, paymentMethod, paymentStatus, transactionId, isCheckedIn) VALUES
(4, 1, 2, 2, 1600.00, 0.00, NULL, NULL, 'Confirmed', 'Card', 'Paid', 'TRX12345', FALSE),
(5, 1, 1, 1, 1500.00, 0.00, NULL, NULL, 'Confirmed', 'Bkash', 'Paid', 'TRX23456', FALSE),
(6, 2, 4, 2, 4000.00, 0.00, NULL, 'REG123', 'Confirmed', 'Nagad', 'Paid', 'TRX34567', FALSE),
(4, 3, 6, 1, 300.00, 0.00, NULL, NULL, 'Confirmed', 'Cash', 'Paid', 'TRX45678', FALSE),
(5, 4, 7, 2, 300.00, 0.00, 'ARTLOVER', NULL, 'Confirmed', 'Bkash', 'Paid', 'TRX56789', TRUE),
(6, 5, 8, 1, 1200.00, 0.00, NULL, 'JOHND', 'Confirmed', 'Card', 'Paid', 'TRX67890', TRUE);

-- Insert Product Categories
INSERT INTO ProductCategories (name, description) VALUES
('Merchandise', 'Event branded merchandise'),
('Food & Beverage', 'Food and beverage items'),
('Supplies', 'Office and event supplies'),
('Equipment', 'Technical and event equipment'),
('Promotional', 'Promotional materials');

-- Insert Products
INSERT INTO Products (name, description, categoryId, sku, costPrice, sellingPrice, currentStock, minimumStock, isActive) VALUES
('Event T-Shirt', 'Official event t-shirt with logo', 1, 'TSHIRT-001', 250.00, 500.00, 120, 20, TRUE),
('Event Cap', 'Official event cap with logo', 1, 'CAP-001', 150.00, 300.00, 80, 15, TRUE),
('Water Bottle', 'Branded water bottle', 2, 'BOTTLE-001', 60.00, 120.00, 200, 50, TRUE),
('Snack Box', 'Assorted snacks for events', 2, 'SNACK-001', 100.00, 200.00, 50, 10, TRUE),
('Notepad', 'Conference notepad with pen', 3, 'NOTE-001', 40.00, 80.00, 250, 30, TRUE),
('Projector', 'High-definition projector for events', 4, 'PROJ-001', 25000.00, 0.00, 5, 2, TRUE),
('Flyer', 'Promotional flyers', 5, 'FLYER-001', 2.00, 0.00, 1000, 200, TRUE);

-- Insert Product Variants
INSERT INTO ProductVariants (productId, size, color, additionalPrice, stock, variantSku) VALUES
(1, 'S', 'Black', 0.00, 20,