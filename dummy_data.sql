-- Users table
INSERT INTO `users` (`fullName`, `email`, `phone`, `password`, `role`, `profileImage`, `isActive`, `lastLogin`, `createdAt`, `updatedAt`) VALUES
('John Doe', 'john@example.com', '+8801712345671', '$2a$10$EXxpZ8z3KEgbwAFEuuVK6evRwH.VjClv0FEJc2jTYXS5ZRMZz7FPa', 'SuperAdmin', 'profile1.jpg', 1, '2025-04-23 14:30:00', '2024-01-15 09:00:00', '2025-04-23 14:30:00'),
('Jane Smith', 'jane@example.com', '+8801712345672', '$2a$10$EXxpZ8z3KEgbwAFEuuVK6evRwH.VjClv0FEJc2jTYXS5ZRMZz7FPa', 'Admin', 'profile2.jpg', 1, '2025-04-22 10:15:00', '2024-01-16 11:30:00', '2025-04-22 10:15:00'),
('Mike Johnson', 'mike@example.com', '+8801712345673', '$2a$10$EXxpZ8z3KEgbwAFEuuVK6evRwH.VjClv0FEJc2jTYXS5ZRMZz7FPa', 'Office Staff', 'profile3.jpg', 1, '2025-04-21 16:45:00', '2024-01-17 13:00:00', '2025-04-21 16:45:00'),
('Sarah Williams', 'sarah@example.com', '+8801712345674', '$2a$10$EXxpZ8z3KEgbwAFEuuVK6evRwH.VjClv0FEJc2jTYXS5ZRMZz7FPa', 'Ticket Checker', 'profile4.jpg', 1, '2025-04-20 09:30:00', '2024-01-18 10:00:00', '2025-04-20 09:30:00'),
('David Brown', 'david@example.com', '+8801712345675', '$2a$10$EXxpZ8z3KEgbwAFEuuVK6evRwH.VjClv0FEJc2jTYXS5ZRMZz7FPa', 'User', 'profile5.jpg', 1, '2025-04-19 13:20:00', '2024-01-19 15:45:00', '2025-04-19 13:20:00'),
('Emily Davis', 'emily@example.com', '+8801712345676', '$2a$10$EXxpZ8z3KEgbwAFEuuVK6evRwH.VjClv0FEJc2jTYXS5ZRMZz7FPa', 'User', 'profile6.jpg', 1, '2025-04-18 11:10:00', '2024-01-20 09:30:00', '2025-04-18 11:10:00'),
('James Wilson', 'james@example.com', '+8801712345677', '$2a$10$EXxpZ8z3KEgbwAFEuuVK6evRwH.VjClv0FEJc2jTYXS5ZRMZz7FPa', 'User', 'profile7.jpg', 1, '2025-04-17 14:55:00', '2024-01-21 14:15:00', '2025-04-17 14:55:00'),
('Linda Garcia', 'linda@example.com', '+8801712345678', '$2a$10$EXxpZ8z3KEgbwAFEuuVK6evRwH.VjClv0FEJc2jTYXS5ZRMZz7FPa', 'Admin', 'profile8.jpg', 1, '2025-04-16 10:40:00', '2024-01-22 11:20:00', '2025-04-16 10:40:00'),
('Robert Martinez', 'robert@example.com', '+8801712345679', '$2a$10$EXxpZ8z3KEgbwAFEuuVK6evRwH.VjClv0FEJc2jTYXS5ZRMZz7FPa', 'Office Staff', 'profile9.jpg', 1, '2025-04-15 09:25:00', '2024-01-23 16:30:00', '2025-04-15 09:25:00'),
('Patricia Robinson', 'patricia@example.com', '+8801712345680', '$2a$10$EXxpZ8z3KEgbwAFEuuVK6evRwH.VjClv0FEJc2jTYXS5ZRMZz7FPa', 'Ticket Checker', 'profile10.jpg', 1, '2025-04-14 15:30:00', '2024-01-24 10:45:00', '2025-04-14 15:30:00'),
('Michael Clark', 'michael@example.com', '+8801712345681', '$2a$10$EXxpZ8z3KEgbwAFEuuVK6evRwH.VjClv0FEJc2jTYXS5ZRMZz7FPa', 'User', 'profile11.jpg', 1, '2025-04-13 11:15:00', '2024-01-25 13:50:00', '2025-04-13 11:15:00'),
('Elizabeth Lewis', 'elizabeth@example.com', '+8801712345682', '$2a$10$EXxpZ8z3KEgbwAFEuuVK6evRwH.VjClv0FEJc2jTYXS5ZRMZz7FPa', 'User', 'profile12.jpg', 1, '2025-04-12 14:10:00', '2024-01-26 15:00:00', '2025-04-12 14:10:00'),
('Thomas Lee', 'thomas@example.com', '+8801712345683', '$2a$10$EXxpZ8z3KEgbwAFEuuVK6evRwH.VjClv0FEJc2jTYXS5ZRMZz7FPa', 'User', 'profile13.jpg', 1, '2025-04-11 16:45:00', '2024-01-27 09:10:00', '2025-04-11 16:45:00'),
('Jennifer Walker', 'jennifer@example.com', '+8801712345684', '$2a$10$EXxpZ8z3KEgbwAFEuuVK6evRwH.VjClv0FEJc2jTYXS5ZRMZz7FPa', 'User', 'profile14.jpg', 1, '2025-04-10 10:30:00', '2024-01-28 11:35:00', '2025-04-10 10:30:00'),
('Daniel Hall', 'daniel@example.com', '+8801712345685', '$2a$10$EXxpZ8z3KEgbwAFEuuVK6evRwH.VjClv0FEJc2jTYXS5ZRMZz7FPa', 'User', 'profile15.jpg', 1, '2025-04-09 13:20:00', '2024-01-29 14:40:00', '2025-04-09 13:20:00');

-- Event Categories table
INSERT INTO `eventcategories` (`name`, `description`, `icon`, `createdAt`, `updatedAt`) VALUES
('Music Concert', 'Live music performances by artists and bands', 'music-icon.png', '2024-02-01 09:00:00', '2024-02-01 09:00:00'),
('Tech Conference', 'Technology and innovation conferences', 'tech-icon.png', '2024-02-02 10:30:00', '2024-02-02 10:30:00'),
('Food Festival', 'Culinary events celebrating food and drinks', 'food-icon.png', '2024-02-03 11:15:00', '2024-02-03 11:15:00'),
('Business Workshop', 'Professional development and business training sessions', 'business-icon.png', '2024-02-04 13:45:00', '2024-02-04 13:45:00'),
('Art Exhibition', 'Showcasing visual arts, paintings, and sculptures', 'art-icon.png', '2024-02-05 14:30:00', '2024-02-05 14:30:00'),
('Sports Tournament', 'Competitive sporting events and tournaments', 'sports-icon.png', '2024-02-06 15:20:00', '2024-02-06 15:20:00'),
('Film Festival', 'Showcasing films and cinema from various genres', 'film-icon.png', '2024-02-07 16:10:00', '2024-02-07 16:10:00'),
('Literary Event', 'Book launches, author meets, and literary discussions', 'book-icon.png', '2024-02-08 09:45:00', '2024-02-08 09:45:00'),
('Health & Wellness', 'Yoga, meditation, and health awareness events', 'health-icon.png', '2024-02-09 10:50:00', '2024-02-09 10:50:00'),
('Educational Seminar', 'Learning and educational events', 'education-icon.png', '2024-02-10 11:30:00', '2024-02-10 11:30:00'),
('Fashion Show', 'Fashion and design showcases', 'fashion-icon.png', '2024-02-11 13:15:00', '2024-02-11 13:15:00'),
('Gaming Convention', 'Video game and esports events', 'gaming-icon.png', '2024-02-12 14:20:00', '2024-02-12 14:20:00'),
('Charity Fundraiser', 'Events for raising funds for social causes', 'charity-icon.png', '2024-02-13 15:35:00', '2024-02-13 15:35:00'),
('Cultural Festival', 'Celebrating cultural diversity and heritage', 'culture-icon.png', '2024-02-14 16:40:00', '2024-02-14 16:40:00'),
('Wedding Expo', 'Wedding planning and bridal exhibitions', 'wedding-icon.png', '2024-02-15 09:25:00', '2024-02-15 09:25:00');

-- Events table
INSERT INTO `events` (`title`, `description`, `categoryId`, `startDate`, `endDate`, `venue`, `address`, `status`, `featuredImage`, `capacity`, `isPublished`, `createdBy`, `createdAt`, `updatedAt`) VALUES
('Summer Music Festival', 'The biggest music festival of the summer featuring top artists', 1, '2025-06-15 16:00:00', '2025-06-17 23:00:00', 'Central Park', '123 Park Avenue, Dhaka', 'Upcoming', 'music-fest.jpg', 5000, 1, 1, '2025-02-10 10:00:00', '2025-02-10 10:00:00'),
('Tech Innovation Summit', 'Exploring latest technology trends and innovations', 2, '2025-05-20 09:00:00', '2025-05-21 18:00:00', 'Tech Hub Convention Center', '456 Digital Road, Dhaka', 'Upcoming', 'tech-summit.jpg', 1200, 1, 2, '2025-02-11 11:30:00', '2025-02-11 11:30:00'),
('International Food Carnival', 'A celebration of global cuisines and culinary arts', 3, '2025-07-05 11:00:00', '2025-07-07 22:00:00', 'Food Court Arena', '789 Flavor Street, Chittagong', 'Upcoming', 'food-carnival.jpg', 3000, 1, 1, '2025-02-12 13:45:00', '2025-02-12 13:45:00'),
('Business Leadership Conference', 'Developing leadership skills for modern business challenges', 4, '2025-04-30 08:30:00', '2025-04-30 17:30:00', 'Business Tower', '101 Corporate Lane, Dhaka', 'Upcoming', 'business-conf.jpg', 600, 1, 3, '2025-02-13 14:20:00', '2025-02-13 14:20:00'),
('Modern Art Exhibition', 'Showcasing contemporary artists and their works', 5, '2025-05-10 10:00:00', '2025-05-25 19:00:00', 'National Art Gallery', '202 Creative Avenue, Sylhet', 'Upcoming', 'art-exhibit.jpg', 800, 1, 2, '2025-02-14 15:10:00', '2025-02-14 15:10:00'),
('National Cricket Tournament', 'Annual cricket tournament featuring national teams', 6, '2025-06-01 09:00:00', '2025-06-10 18:00:00', 'National Cricket Stadium', '303 Sports Boulevard, Dhaka', 'Upcoming', 'cricket-tourney.jpg', 15000, 1, 1, '2025-02-15 09:30:00', '2025-02-15 09:30:00'),
('Independent Film Festival', 'Celebrating independent filmmakers and their creations', 7, '2025-07-15 13:00:00', '2025-07-20 22:00:00', 'City Cinema Hall', '404 Movie Lane, Khulna', 'Upcoming', 'film-fest.jpg', 1000, 1, 3, '2025-02-16 10:45:00', '2025-02-16 10:45:00'),
('Book Fair & Literary Meet', 'Annual book fair featuring author meetings and discussions', 8, '2025-05-01 10:00:00', '2025-05-15 20:00:00', 'Central Library Complex', '505 Reading Road, Rajshahi', 'Upcoming', 'book-fair.jpg', 2500, 1, 2, '2025-02-17 11:50:00', '2025-02-17 11:50:00'),
('Wellness Retreat Weekend', 'A weekend of yoga, meditation, and holistic wellness', 9, '2025-04-26 07:00:00', '2025-04-28 19:00:00', 'Serenity Resort', '606 Peaceful Path, Cox\'s Bazar', 'Upcoming', 'wellness-retreat.jpg', 200, 1, 1, '2025-02-18 13:15:00', '2025-02-18 13:15:00'),
('Education & Career Expo', 'Connecting students with educational institutions and employers', 10, '2025-05-05 09:00:00', '2025-05-06 17:00:00', 'University Convention Center', '707 Academic Avenue, Dhaka', 'Upcoming', 'edu-expo.jpg', 3000, 1, 3, '2025-02-19 14:30:00', '2025-02-19 14:30:00'),
('Bangladesh Fashion Week', 'Showcasing the latest in Bangladesh and international fashion', 11, '2025-06-20 18:00:00', '2025-06-23 22:00:00', 'Luxury Hotel Ballroom', '808 Style Street, Dhaka', 'Upcoming', 'fashion-week.jpg', 1200, 1, 2, '2025-02-20 15:40:00', '2025-02-20 15:40:00'),
('Gaming Championship', 'Competitive gaming tournament with multiple game categories', 12, '2025-07-01 10:00:00', '2025-07-03 20:00:00', 'Digital Arena', '909 Gamer Road, Dhaka', 'Upcoming', 'gaming-champ.jpg', 1500, 1, 1, '2025-02-21 09:20:00', '2025-02-21 09:20:00'),
('Charity Gala Dinner', 'Annual gala dinner raising funds for children\'s education', 13, '2025-04-25 19:00:00', '2025-04-25 23:00:00', 'Grand Ballroom', '111 Charity Circle, Dhaka', 'Upcoming', 'charity-gala.jpg', 500, 1, 3, '2025-02-22 10:45:00', '2025-02-22 10:45:00'),
('Bengali Cultural Festival', 'Celebrating Bengali culture, music, and traditions', 14, '2025-05-15 11:00:00', '2025-05-17 21:00:00', 'Heritage Park', '222 Cultural Road, Dhaka', 'Upcoming', 'bengali-fest.jpg', 4000, 1, 2, '2025-02-23 11:50:00', '2025-02-23 11:50:00'),
('Bridal Expo', 'Everything for the perfect wedding under one roof', 15, '2025-06-10 10:00:00', '2025-06-12 19:00:00', 'Wedding Palace', '333 Bridal Way, Dhaka', 'Upcoming', 'bridal-expo.jpg', 2000, 1, 1, '2025-02-24 13:30:00', '2025-02-24 13:30:00');

-- Tickets table
INSERT INTO `tickets` (`eventId`, `type`, `price`, `quantity`, `quantitySold`, `description`, `isActive`, `saleStartDate`, `saleEndDate`, `createdAt`, `updatedAt`) VALUES
(1, 'VIP', 5000.00, 500, 120, 'VIP access with backstage pass', 1, '2025-03-01 00:00:00', '2025-06-14 23:59:59', '2025-02-25 09:00:00', '2025-04-23 10:15:00'),
(1, 'Regular', 2000.00, 4500, 1500, 'General admission', 1, '2025-03-01 00:00:00', '2025-06-14 23:59:59', '2025-02-25 09:15:00', '2025-04-23 10:20:00'),
(2, 'Premium', 3500.00, 300, 75, 'Premium seating with lunch included', 1, '2025-03-15 00:00:00', '2025-05-19 23:59:59', '2025-02-26 10:30:00', '2025-04-22 11:10:00'),
(2, 'Standard', 1500.00, 900, 250, 'Standard admission', 1, '2025-03-15 00:00:00', '2025-05-19 23:59:59', '2025-02-26 10:45:00', '2025-04-22 11:15:00'),
(3, 'All Access', 3000.00, 1000, 300, 'All-inclusive food and drink pass', 1, '2025-04-01 00:00:00', '2025-07-04 23:59:59', '2025-02-27 11:30:00', '2025-04-21 12:40:00'),
(3, 'Entry Only', 800.00, 2000, 650, 'Entry only, food purchased separately', 1, '2025-04-01 00:00:00', '2025-07-04 23:59:59', '2025-02-27 11:45:00', '2025-04-21 12:45:00'),
(4, 'Corporate', 4000.00, 200, 80, 'For business representatives', 1, '2025-03-10 00:00:00', '2025-04-29 23:59:59', '2025-02-28 13:15:00', '2025-04-20 14:30:00'),
(4, 'Individual', 2500.00, 400, 150, 'For individual professionals', 1, '2025-03-10 00:00:00', '2025-04-29 23:59:59', '2025-02-28 13:30:00', '2025-04-20 14:35:00'),
(5, 'Guided Tour', 1200.00, 300, 90, 'With professional art guide', 1, '2025-03-20 00:00:00', '2025-05-09 23:59:59', '2025-03-01 14:45:00', '2025-04-19 15:20:00'),
(5, 'Self Tour', 500.00, 500, 180, 'Self-guided exhibition tour', 1, '2025-03-20 00:00:00', '2025-05-09 23:59:59', '2025-03-01 15:00:00', '2025-04-19 15:25:00'),
(6, 'Season Pass', 8000.00, 2000, 750, 'Valid for all tournament days', 1, '2025-04-01 00:00:00', '2025-05-30 23:59:59', '2025-03-02 09:15:00', '2025-04-18 10:10:00'),
(6, 'Single Day', 1500.00, 13000, 4000, 'Valid for one day only', 1, '2025-04-01 00:00:00', '2025-05-30 23:59:59', '2025-03-02 09:30:00', '2025-04-18 10:15:00'),
(7, 'Festival Pass', 2500.00, 300, 120, 'Access to all screenings', 1, '2025-05-01 00:00:00', '2025-07-14 23:59:59', '2025-03-03 10:45:00', '2025-04-17 11:30:00'),
(7, 'Single Screening', 400.00, 700, 250, 'Access to one film screening', 1, '2025-05-01 00:00:00', '2025-07-14 23:59:59', '2025-03-03 11:00:00', '2025-04-17 11:35:00'),
(8, 'Complete Pass', 1000.00, 1000, 350, 'Access to all literary events', 1, '2025-03-15 00:00:00', '2025-04-30 23:59:59', '2025-03-04 12:15:00', '2025-04-16 13:20:00');

-- Bookings table
INSERT INTO `bookings` (`userId`, `eventId`, `ticketId`, `quantity`, `totalAmount`, `discountAmount`, `promoCode`, `referralCode`, `status`, `paymentMethod`, `paymentStatus`, `transactionId`, `qrCode`, `isCheckedIn`, `checkedInAt`, `checkedInBy`, `createdAt`, `updatedAt`) VALUES
(5, 1, 1, 2, 10000.00, 1000.00, 'SUMMER10', NULL, 'Confirmed', 'Bkash', 'Paid', 'TXN123456789', 'QR123456789', 0, NULL, NULL, '2025-03-10 10:30:00', '2025-03-10 10:35:00'),
(6, 1, 2, 3, 6000.00, 0.00, NULL, NULL, 'Confirmed', 'Nagad', 'Paid', 'TXN234567890', 'QR234567890', 0, NULL, NULL, '2025-03-11 11:45:00', '2025-03-11 11:50:00'),
(7, 2, 3, 1, 3500.00, 350.00, 'TECH10', NULL, 'Confirmed', 'Card', 'Paid', 'TXN345678901', 'QR345678901', 0, NULL, NULL, '2025-03-12 13:15:00', '2025-03-12 13:20:00'),
(8, 2, 4, 2, 3000.00, 0.00, NULL, NULL, 'Confirmed', 'Bkash', 'Paid', 'TXN456789012', 'QR456789012', 0, NULL, NULL, '2025-03-13 14:30:00', '2025-03-13 14:35:00'),
(9, 3, 5, 4, 12000.00, 1200.00, 'FOOD10', NULL, 'Confirmed', 'Card', 'Paid', 'TXN567890123', 'QR567890123', 0, NULL, NULL, '2025-03-14 15:45:00', '2025-03-14 15:50:00'),
(10, 3, 6, 5, 4000.00, 0.00, NULL, NULL, 'Confirmed', 'Nagad', 'Paid', 'TXN678901234', 'QR678901234', 0, NULL, NULL, '2025-03-15 09:30:00', '2025-03-15 09:35:00'),
(11, 4, 7, 1, 4000.00, 400.00, 'BIZ10', NULL, 'Confirmed', 'Card', 'Paid', 'TXN789012345', 'QR789012345', 0, NULL, NULL, '2025-03-16 10:45:00', '2025-03-16 10:50:00'),
(12, 4, 8, 2, 5000.00, 0.00, NULL, NULL, 'Confirmed', 'Bkash', 'Paid', 'TXN890123456', 'QR890123456', 0, NULL, NULL, '2025-03-17 11:15:00', '2025-03-17 11:20:00'),
(13, 5, 9, 3, 3600.00, 360.00, 'ART10', NULL, 'Confirmed', 'Nagad', 'Paid', 'TXN901234567', 'QR901234567', 0, NULL, NULL, '2025-03-18 13:30:00', '2025-03-18 13:35:00'),
(14, 5, 10, 4, 2000.00, 0.00, NULL, NULL, 'Confirmed', 'Cash', 'Paid', 'TXN012345678', 'QR012345678', 0, NULL, NULL, '2025-03-19 14:45:00', '2025-03-19 14:50:00'),
(15, 6, 11, 1, 8000.00, 800.00, 'SPORT10', NULL, 'Confirmed', 'Card', 'Paid', 'TXN123456780', 'QR123456780', 0, NULL, NULL, '2025-03-20 15:15:00', '2025-03-20 15:20:00'),
(5, 6, 12, 2, 3000.00, 0.00, NULL, NULL, 'Confirmed', 'Bkash', 'Paid', 'TXN234567801', 'QR234567801', 0, NULL, NULL, '2025-03-21 09:30:00', '2025-03-21 09:35:00'),
(6, 7, 13, 1, 2500.00, 250.00, 'FILM10', NULL, 'Confirmed', 'Nagad', 'Paid', 'TXN345678012', 'QR345678012', 0, NULL, NULL, '2025-03-22 10:45:00', '2025-03-22 10:50:00'),
(7, 7, 14, 3, 1200.00, 0.00, NULL, NULL, 'Confirmed', 'Cash', 'Paid', 'TXN456780123', 'QR456780123', 0, NULL, NULL, '2025-03-23 11:15:00', '2025-03-23 11:20:00'),
(8, 8, 15, 2, 2000.00, 200.00, 'BOOK10', NULL, 'Confirmed', 'Card', 'Paid', 'TXN567801234', 'QR567801234', 0, NULL, NULL, '2025-03-24 13:30:00', '2025-03-24 13:35:00');

-- Product Categories table
INSERT INTO `productcategories` (`name`, `description`, `icon`, `createdAt`, `updatedAt`) VALUES
('Apparel', 'Clothing and wearable merchandise', 'tshirt-icon.png', '2024-03-01 09:00:00', '2024-03-01 09:00:00'),
('Accessories', 'Bags, caps, and other accessories', 'bag-icon.png', '2024-03-02 10:15:00', '2024-03-02 10:15:00'),
('Souvenirs', 'Memorabilia items', 'souvenir-icon.png', '2024-03-03 11:30:00', '2024-03-03 11:30:00'),
('Books', 'Books and printed materials', 'book-icon.png', '2024-03-04 13:45:00', '2024-03-04 13:45:00'),
('Music', 'CDs, vinyl records, and digital music', 'music-icon.png', '2024-03-05 14:15:00', '2024-03-05 14:15:00'),
('Art Prints', 'Artwork reproductions and prints', 'art-icon.png', '2024-03-06 15:30:00', '2024-03-06 15:30:00'),
('Food & Beverages', 'Packaged food items and drinks', 'food-icon.png', '2024-03-07 09:45:00', '2024-03-07 09:45:00'),
('Electronics', 'Electronic gadgets and accessories', 'electronics-icon.png', '2024-03-08 10:50:00', '2024-03-08 10:50:00'),
('Sports Equipment', 'Sporting goods and equipment', 'sports-icon.png', '2024-03-09 11:30:00', '2024-03-09 11:30:00'),
('Toys & Games', 'Toys, games, and entertainment items', 'toys-icon.png', '2024-03-10 13:15:00', '2024-03-10 13:15:00'),
('Stationery', 'Pens, notebooks, and office supplies', 'stationery-icon.png', '2024-03-11 14:20:00', '2024-03-11 14:20:00'),
('Home Decor', 'Decorative items for home', 'decor-icon.png', '2024-03-12 15:30:00', '2024-03-12 15:30:00'),
('Beauty Products', 'Cosmetics and personal care items', 'beauty-icon.png', '2024-03-13 09:15:00', '2024-03-13 09:15:00'),
('Jewelry', 'Jewelry and ornamental items', 'jewelry-icon.png', '2024-03-14 10:45:00', '2024-03-14 10:45:00'),
('Digital Products', 'Digital downloads and online content', 'digital-icon.png', '2024-03-15 11:50:00', '2024-03-15 11:50:00');

-- Products table
INSERT INTO `products` (`name`, `description`, `categoryId`, `sku`, `costPrice`, `sellingPrice`, `currentStock`, `minimumStock`, `image`, `isActive`, `createdAt`, `updatedAt`) VALUES
('Event T-Shirt', 'Official event branded t-shirt', 1, 'TS001', 350.00, 700.00, 250, 50, 'tshirt.jpg', 1, '2024-03-16 09:00:00', '2024-03-16 09:00:00'),
('Tote Bag', 'Canvas tote bag with event logo', 2, 'TB001', 200.00, 450.00, 300, 50, 'tote.jpg', 1, '2024-03-17 10:15:00', '2024-03-17 10:15:00'),
('Event Mug', 'Ceramic mug with event logo', 3, 'MG001', 150.00, 350.00, 200, 40, 'mug.jpg', 1, '2024-03-18 11:30:00', '2024-03-18 11:30:00'),
('Event Guide Book', 'Comprehensive guide to the event', 4, 'BK001', 100.00, 250.00, 500, 100, 'guidebook.jpg', 1, '2024-03-19 13:45:00', '2024-03-19 13:45:00'),
('Artist CD', 'Music CD featuring event artists', 5, 'CD001', 120.00, 300.00, 150, 30, 'cd.jpg', 1, '2024-03-20 14:15:00', '2024-03-20 14:15:00'),
('Poster Print', 'Limited edition event poster', 6, 'PP001', 80.00, 200.00, 100, 20, 'poster.jpg', 1, '2024-03-21 15:30:00', '2024-03-21 15:30:00'),
('Energy Drink', 'Official event energy drink', 7, 'ED001', 30.00, 80.00, 1000, 200, 'drink.jpg', 1, '2024-03-22 09:45:00', '2024-03-22 09:45:00'),
('Portable Charger', 'Event branded power bank', 8, 'PC001', 600.00, 1500.00, 100, 20, 'charger.jpg', 1, '2024-03-23 10:50:00', '2024-03-23 10:50:00'),
('Sports Jersey', 'Team jersey for sports events', 9, 'SJ001', 800.00, 1800.00, 150, 30, 'jersey.jpg', 1, '2024-03-24 11:30:00', '2024-03-24 11:30:00'),
('Event Puzzle', 'Puzzle featuring event theme', 10, 'PZ001', 200.00, 450.00, 75, 15, 'puzzle.jpg', 1, '2024-03-25 13:15:00', '2024-03-25 13:15:00'),
('Notebook Set', 'Set of 3 branded notebooks', 11, 'NS001', 150.00, 350.00, 200, 40, 'notebook.jpg', 1, '2024-03-26 14:20:00', '2024-03-26 14:20:00'),
('Decorative Lamp', 'Event themed decorative lamp', 12, 'DL001', 400.00, 950.00, 50, 10, 'lamp.jpg', 1, '2024-03-27 15:30:00', '2024-03-27 15:30:00'),
('Perfume', 'Limited edition event fragrance', 13, 'PF001', 500.00, 1200.00, 80, 20, 'perfume.jpg', 1, '2024-03-28 09:15:00', '2024-03-28 09:15:00'),
('Bracelet', 'Handcrafted event bracelet', 14, 'BR001', 250.00, 600.00, 120, 25, 'bracelet.jpg', 1, '2024-03-29 10:45:00', '2024-03-29 10:45:00'),
('Digital Album', 'Downloadable album of event performances', 15, 'DA001', 100.00, 250.00, 1000, 0, 'album.jpg', 1, '2024-03-30 11:50:00', '2024-03-30 11:50:00');

-- Product Variants table
INSERT INTO `productvariants` (`productId`, `size`, `color`, `additionalPrice`, `stock`, `variantSku`, `createdAt`, `updatedAt`) VALUES
(1, 'S', 'Black', 0.00, 50, 'TS001-S-BLK', '2024-04-01 09:00:00', '2024-04-01 09:00:00'),
(1, 'M', 'Black', 0.00, 70, 'TS001-M-BLK', '2024-04-01 09:05:00', '2024-04-01 09:05:00'),
(1, 'L', 'Black', 0.00, 80, 'TS001-L-BLK', '2024-04-01 09:10:00', '2024-04-01 09:10:00'),
(1, 'XL', 'Black', 50.00, 50, 'TS001-XL-BLK', '2024-04-01 09:15:00', '2024-04-01 09:15:00'),
(1, 'S', 'White', 0.00, 40, 'TS001-S-WHT', '2024-04-01 09:20:00', '2024-04-01 09:20:00'),
(1, 'M', 'White', 0.00, 60, 'TS001-M-WHT', '2024-04-01 09:25:00', '2024-04-01 09:25:00'),
(1, 'L', 'White', 0.00, 70, 'TS001-L-WHT', '2024-04-01 09:30:00', '2024-04-01 09:30:00'),
(1, 'XL', 'White', 50.00, 40, 'TS001-XL-WHT', '2024-04-01 09:35:00', '2024-04-01 09:35:00'),
(2, 'Standard', 'Black', 0.00, 100, 'TB001-STD-BLK', '2024-04-02 10:00:00', '2024-04-02 10:00:00'),
(2, 'Standard', 'Blue', 0.00, 100, 'TB001-STD-BLU', '2024-04-02 10:05:00', '2024-04-02 10:05:00'),
(2, 'Standard', 'Red', 0.00, 100, 'TB001-STD-RED', '2024-04-02 10:10:00', '2024-04-02 10:10:00'),
(3, 'Standard', 'White', 0.00, 100, 'MG001-STD-WHT', '2024-04-03 11:00:00', '2024-04-03 11:00:00'),
(3, 'Standard', 'Black', 0.00, 100, 'MG001-STD-BLK', '2024-04-03 11:05:00', '2024-04-03 11:05:00'),
(9, 'M', 'Red', 0.00, 50, 'SJ001-M-RED', '2024-04-04 13:00:00', '2024-04-04 13:00:00'),
(9, 'L', 'Red', 0.00, 50, 'SJ001-L-RED', '2024-04-04 13:05:00', '2024-04-04 13:05:00');

-- Suppliers table
INSERT INTO `suppliers` (`name`, `email`, `phone`, `address`, `contactPerson`, `createdAt`, `updatedAt`) VALUES
('ABC Textile Ltd.', 'info@abctextile.com', '+8801812345678', '123 Industrial Area, Dhaka', 'Rahim Khan', '2024-04-05 09:00:00', '2024-04-05 09:00:00'),
('XYZ Merchandising', 'contact@xyzmerch.com', '+8801912345678', '456 Commercial Zone, Chittagong', 'Karim Rahman', '2024-04-06 10:15:00', '2024-04-06 10:15:00'),
('Global Print Solutions', 'sales@globalprint.com', '+8801712345678', '789 Print Avenue, Dhaka', 'Sabina Ahmed', '2024-04-07 11:30:00', '2024-04-07 11:30:00'),
('Paper & Press', 'info@paperpress.com', '+8801612345678', '101 Publisher Road, Dhaka', 'Jahangir Alam', '2024-04-08 13:45:00', '2024-04-08 13:45:00'),
('Music Distribution BD', 'contact@musicbd.com', '+8801512345678', '202 Media Street, Dhaka', 'Nadia Islam', '2024-04-09 14:15:00', '2024-04-09 14:15:00'),
('Art House Prints', 'info@arthouse.com', '+8801312345678', '303 Creative Lane, Sylhet', 'Rafiq Hasan', '2024-04-10 15:30:00', '2024-04-10 15:30:00'),
('Beverage Suppliers Ltd.', 'orders@beveragesuppliers.com', '+8801212345678', '404 Drink Road, Dhaka', 'Taslima Begum', '2024-04-11 09:45:00', '2024-04-11 09:45:00'),
('Tech Gadgets BD', 'sales@techgadgetsbd.com', '+8801112345678', '505 Digital Plaza, Dhaka', 'Fahim Ahmed', '2024-04-12 10:50:00', '2024-04-12 10:50:00'),
('Sports Gear Bangladesh', 'info@sportsgearbd.com', '+8801912345679', '606 Sports Complex, Dhaka', 'Nazmul Haque', '2024-04-13 11:30:00', '2024-04-13 11:30:00'),
('Playful Creations', 'orders@playfulcreations.com', '+8801812345679', '707 Toy Street, Dhaka', 'Rubina Akter', '2024-04-14 13:15:00', '2024-04-14 13:15:00'),
('Office Supply Co.', 'sales@officesupply.com', '+8801712345679', '808 Stationery Road, Dhaka', 'Aminul Islam', '2024-04-15 14:20:00', '2024-04-15 14:20:00'),
('Home Decor Imports', 'contact@homedecor.com', '+8801612345679', '909 Decor Avenue, Chittagong', 'Sultana Yasmin', '2024-04-16 15:30:00', '2024-04-16 15:30:00'),
('Beauty & Cosmetics Ltd.', 'info@beautycosmetics.com', '+8801512345679', '111 Beauty Road, Dhaka', 'Farida Begum', '2024-04-17 09:15:00', '2024-04-17 09:15:00'),
('Jewelry Crafters', 'sales@jewelrycrafters.com', '+8801312345679', '222 Jewelry Lane, Dhaka', 'Masud Rana', '2024-04-18 10:45:00', '2024-04-18 10:45:00'),
('Digital Content BD', 'content@digitalbd.com', '+8801212345679', '333 Digital Road, Dhaka', 'Nasreen Jahan', '2024-04-19 11:50:00', '2024-04-19 11:50:00');

-- Inventories table
INSERT INTO `inventories` (`productId`, `variantId`, `type`, `quantity`, `note`, `supplierId`, `price`, `recordedBy`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'In', 50, 'Initial stock', 1, 350.00, 1, '2024-04-20 09:00:00', '2024-04-20 09:00:00'),
(1, 2, 'In', 70, 'Initial stock', 1, 350.00, 1, '2024-04-20 09:05:00', '2024-04-20 09:05:00'),
(1, 3, 'In', 80, 'Initial stock', 1, 350.00, 1, '2024-04-20 09:10:00', '2024-04-20 09:10:00'),
(1, 4, 'In', 50, 'Initial stock', 1, 375.00, 1, '2024-04-20 09:15:00', '2024-04-20 09:15:00'),
(1, 5, 'In', 40, 'Initial stock', 1, 350.00, 1, '2024-04-20 09:20:00', '2024-04-20 09:20:00'),
(1, 6, 'In', 60, 'Initial stock', 1, 350.00, 1, '2024-04-20 09:25:00', '2024-04-20 09:25:00'),
(1, 7, 'In', 70, 'Initial stock', 1, 350.00, 1, '2024-04-20 09:30:00', '2024-04-20 09:30:00'),
(1, 8, 'In', 40, 'Initial stock', 1, 375.00, 1, '2024-04-20 09:35:00', '2024-04-20 09:35:00'),
(2, 9, 'In', 100, 'Initial stock', 2, 200.00, 2, '2024-04-21 10:00:00', '2024-04-21 10:00:00'),
(2, 10, 'In', 100, 'Initial stock', 2, 200.00, 2, '2024-04-21 10:05:00', '2024-04-21 10:05:00'),
(2, 11, 'In', 100, 'Initial stock', 2, 200.00, 2, '2024-04-21 10:10:00', '2024-04-21 10:10:00'),
(3, 12, 'In', 100, 'Initial stock', 3, 150.00, 3, '2024-04-22 11:00:00', '2024-04-22 11:00:00'),
(3, 13, 'In', 100, 'Initial stock', 3, 150.00, 3, '2024-04-22 11:05:00', '2024-04-22 11:05:00'),
(4, NULL, 'In', 500, 'Initial stock', 4, 100.00, 1, '2024-04-23 13:00:00', '2024-04-23 13:00:00'),
(5, NULL, 'In', 150, 'Initial stock', 5, 120.00, 2, '2024-04-24 14:00:00', '2024-04-24 14:00:00');

-- Newsletter Subscribers table
INSERT INTO `newslettersubscribers` (`email`, `isActive`, `createdAt`, `updatedAt`) VALUES
('subscriber1@example.com', 1, '2024-05-01 09:00:00', '2024-05-01 09:00:00'),
('subscriber2@example.com', 1, '2024-05-02 10:15:00', '2024-05-02 10:15:00'),
('subscriber3@example.com', 1, '2024-05-03 11:30:00', '2024-05-03 11:30:00'),
('subscriber4@example.com', 1, '2024-05-04 13:45:00', '2024-05-04 13:45:00'),
('subscriber5@example.com', 1, '2024-05-05 14:15:00', '2024-05-05 14:15:00'),
('subscriber6@example.com', 1, '2024-05-06 15:30:00', '2024-05-06 15:30:00'),
('subscriber7@example.com', 1, '2024-05-07 09:45:00', '2024-05-07 09:45:00'),
('subscriber8@example.com', 1, '2024-05-08 10:50:00', '2024-05-08 10:50:00'),
('subscriber9@example.com', 1, '2024-05-09 11:30:00', '2024-05-09 11:30:00'),
('subscriber10@example.com', 1, '2024-05-10 13:15:00', '2024-05-10 13:15:00'),
('subscriber11@example.com', 0, '2024-05-11 14:20:00', '2024-05-15 10:30:00'),
('subscriber12@example.com', 1, '2024-05-12 15:30:00', '2024-05-12 15:30:00'),
('subscriber13@example.com', 1, '2024-05-13 09:15:00', '2024-05-13 09:15:00'),
('subscriber14@example.com', 0, '2024-05-14 10:45:00', '2024-05-16 11:20:00'),
('subscriber15@example.com', 1, '2024-05-15 11:50:00', '2024-05-15 11:50:00');

-- Sponsors table
INSERT INTO `sponsors` (`name`, `logo`, `type`, `website`, `eventId`, `createdAt`, `updatedAt`) VALUES
('ABC Corporation', 'abc-logo.png', 'Sponsor', 'https://www.abccorp.com', 1, '2024-05-16 09:00:00', '2024-05-16 09:00:00'),
('XYZ Technologies', 'xyz-logo.png', 'Sponsor', 'https://www.xyztech.com', 1, '2024-05-17 10:15:00', '2024-05-17 10:15:00'),
('Global Media', 'global-logo.png', 'Partner', 'https://www.globalmedia.com', 1, '2024-05-18 11:30:00', '2024-05-18 11:30:00'),
('Digital Solutions', 'digital-logo.png', 'Sponsor', 'https://www.digitalsolutions.com', 2, '2024-05-19 13:45:00', '2024-05-19 13:45:00'),
('Tech Innovations', 'techinno-logo.png', 'Sponsor', 'https://www.techinnovations.com', 2, '2024-05-20 14:15:00', '2024-05-20 14:15:00'),
('Software Partners', 'software-logo.png', 'Partner', 'https://www.softwarepartners.com', 2, '2024-05-21 15:30:00', '2024-05-21 15:30:00'),
('Food Delights', 'food-logo.png', 'Sponsor', 'https://www.fooddelights.com', 3, '2024-05-22 09:45:00', '2024-05-22 09:45:00'),
('Beverage Co', 'beverage-logo.png', 'Sponsor', 'https://www.beverageco.com', 3, '2024-05-23 10:50:00', '2024-05-23 10:50:00'),
('Culinary Arts Association', 'culinary-logo.png', 'Partner', 'https://www.culinaryarts.org', 3, '2024-05-24 11:30:00', '2024-05-24 11:30:00'),
('Business Network', 'business-logo.png', 'Sponsor', 'https://www.businessnetwork.com', 4, '2024-05-25 13:15:00', '2024-05-25 13:15:00'),
('Leadership Institute', 'leadership-logo.png', 'Partner', 'https://www.leadershipinstitute.org', 4, '2024-05-26 14:20:00', '2024-05-26 14:20:00'),
('Art Foundation', 'art-logo.png', 'Sponsor', 'https://www.artfoundation.org', 5, '2024-05-27 15:30:00', '2024-05-27 15:30:00'),
('Sports Brand', 'sports-logo.png', 'Sponsor', 'https://www.sportsbrand.com', 6, '2024-05-28 09:15:00', '2024-05-28 09:15:00'),
('Film Academy', 'film-logo.png', 'Partner', 'https://www.filmacademy.org', 7, '2024-05-29 10:45:00', '2024-05-29 10:45:00'),
('Book Publishers', 'book-logo.png', 'Sponsor', 'https://www.bookpublishers.com', 8, '2024-05-30 11:50:00', '2024-05-30 11:50:00');

-- Referrals table
INSERT INTO `referrals` (`userId`, `code`, `commissionPercentage`, `usageCount`, `totalEarnings`, `isActive`, `createdAt`, `updatedAt`) VALUES
(5, 'DAVID2025', 5.00, 12, 3600.00, 1, '2024-06-01 09:00:00', '2025-04-23 10:30:00'),
(6, 'EMILY2025', 5.00, 8, 2400.00, 1, '2024-06-02 10:15:00', '2025-04-22 11:45:00'),
(7, 'JAMES2025', 5.00, 5, 1500.00, 1, '2024-06-03 11:30:00', '2025-04-21 13:15:00'),
(8, 'LINDA2025', 5.00, 7, 2100.00, 1, '2024-06-04 13:45:00', '2025-04-20 14:30:00'),
(9, 'ROBERT2025', 5.00, 6, 1800.00, 1, '2024-06-05 14:15:00', '2025-04-19 15:45:00'),
(10, 'PATRICIA2025', 5.00, 3, 900.00, 1, '2024-06-06 15:30:00', '2025-04-18 09:30:00'),
(11, 'MICHAEL2025', 5.00, 4, 1200.00, 1, '2024-06-07 09:45:00', '2025-04-17 10:45:00'),
(12, 'ELIZABETH2025', 5.00, 2, 600.00, 1, '2024-06-08 10:50:00', '2025-04-16 11:15:00'),
(13, 'THOMAS2025', 5.00, 5, 1500.00, 1, '2024-06-09 11:30:00', '2025-04-15 13:30:00'),
(14, 'JENNIFER2025', 5.00, 3, 900.00, 1, '2024-06-10 13:15:00', '2025-04-14 14:45:00'),
(15, 'DANIEL2025', 5.00, 6, 1800.00, 1, '2024-06-11 14:20:00', '2025-04-13 15:15:00'),
(5, 'DAVID2025VIP', 10.00, 4, 2000.00, 1, '2024-06-12 15:30:00', '2025-04-12 09:30:00'),
(6, 'EMILY2025VIP', 10.00, 3, 1500.00, 1, '2024-06-13 09:15:00', '2025-04-11 10:45:00'),
(7, 'JAMES2025VIP', 10.00, 2, 1000.00, 1, '2024-06-14 10:45:00', '2025-04-10 11:15:00'),
(8, 'LINDA2025VIP', 10.00, 5, 2500.00, 1, '2024-06-15 11:50:00', '2025-04-09 13:30:00');

-- Settings table
INSERT INTO `settings` (`settingKey`, `settingValue`, `description`, `createdAt`, `updatedAt`) VALUES
('site_name', 'EventMaster BD', 'Name of the website', '2024-06-16 09:00:00', '2024-06-16 09:00:00'),
('site_logo', 'logo.png', 'Logo of the website', '2024-06-17 10:15:00', '2024-06-17 10:15:00'),
('contact_email', 'contact@eventmaster.com', 'Contact email for the website', '2024-06-18 11:30:00', '2024-06-18 11:30:00'),
('contact_phone', '+8801712345670', 'Contact phone for the website', '2024-06-19 13:45:00', '2024-06-19 13:45:00'),
('office_address', '123 Event Street, Dhaka, Bangladesh', 'Office address', '2024-06-20 14:15:00', '2024-06-20 14:15:00'),
('facebook_link', 'https://www.facebook.com/eventmasterbd', 'Facebook page link', '2024-06-21 15:30:00', '2024-06-21 15:30:00'),
('instagram_link', 'https://www.instagram.com/eventmasterbd', 'Instagram page link', '2024-06-22 09:45:00', '2024-06-22 09:45:00'),
('twitter_link', 'https://www.twitter.com/eventmasterbd', 'Twitter page link', '2024-06-23 10:50:00', '2024-06-23 10:50:00'),
('default_commission', '5', 'Default commission percentage for referrals', '2024-06-24 11:30:00', '2024-06-24 11:30:00'),
('meta_description', 'EventMaster BD - Your one-stop solution for event management in Bangladesh', 'Meta description for SEO', '2024-06-25 13:15:00', '2024-06-25 13:15:00'),
('meta_keywords', 'events, tickets, Bangladesh, music, conference, festivals', 'Meta keywords for SEO', '2024-06-26 14:20:00', '2024-06-26 14:20:00'),
('currency', 'BDT', 'Default currency', '2024-06-27 15:30:00', '2024-06-27 15:30:00'),
('google_analytics', 'UA-12345678-9', 'Google Analytics tracking ID', '2024-06-28 09:15:00', '2024-06-28 09:15:00'),
('sms_api_key', 'SMS123456789', 'API key for SMS service', '2024-06-29 10:45:00', '2024-06-29 10:45:00'),
('payment_gateway_key', 'PAYMENT123456789', 'API key for payment gateway', '2024-06-30 11:50:00', '2024-06-30 11:50:00');

-- Payouts table
INSERT INTO `payouts` (`userId`, `amount`, `status`, `paymentMethod`, `transactionId`, `note`, `processedBy`, `processedAt`, `createdAt`, `updatedAt`) VALUES
(5, 3600.00, 'Paid', 'Bank Transfer', 'PT123456789', 'Monthly referral commission payout', 1, '2025-04-01 10:30:00', '2025-03-31 15:00:00', '2025-04-01 10:30:00'),
(6, 2400.00, 'Paid', 'Bank Transfer', 'PT234567890', 'Monthly referral commission payout', 1, '2025-04-01 10:45:00', '2025-03-31 15:15:00', '2025-04-01 10:45:00'),
(7, 1500.00, 'Paid', 'Bank Transfer', 'PT345678901', 'Monthly referral commission payout', 1, '2025-04-01 11:00:00', '2025-03-31 15:30:00', '2025-04-01 11:00:00'),
(8, 2100.00, 'Paid', 'Bank Transfer', 'PT456789012', 'Monthly referral commission payout', 1, '2025-04-01 11:15:00', '2025-03-31 15:45:00', '2025-04-01 11:15:00'),
(9, 1800.00, 'Paid', 'Bank Transfer', 'PT456789012', 'Monthly referral commission payout', 1, '2025-04-01 11:30:00', '2025-03-31 16:00:00', '2025-04-01 11:30:00'),
(10, 900.00, 'Paid', 'Mobile Banking', 'PT567890123', 'Monthly referral commission payout', 1, '2025-04-01 11:45:00', '2025-03-31 16:15:00', '2025-04-01 11:45:00'),
(11, 1200.00, 'Paid', 'Mobile Banking', 'PT678901234', 'Monthly referral commission payout', 1, '2025-04-01 12:00:00', '2025-03-31 16:30:00', '2025-04-01 12:00:00'),
(12, 600.00, 'Paid', 'Mobile Banking', 'PT789012345', 'Monthly referral commission payout', 1, '2025-04-01 12:15:00', '2025-03-31 16:45:00', '2025-04-01 12:15:00'),
(13, 1500.00, 'Pending', 'Bank Transfer', NULL, 'Monthly referral commission payout', NULL, NULL, '2025-04-20 14:00:00', '2025-04-20 14:00:00'),
(14, 900.00, 'Pending', 'Mobile Banking', NULL, 'Monthly referral commission payout', NULL, NULL, '2025-04-20 14:15:00', '2025-04-20 14:15:00'),
(15, 1800.00, 'Pending', 'Bank Transfer', NULL, 'Monthly referral commission payout', NULL, NULL, '2025-04-20 14:30:00', '2025-04-20 14:30:00');
