
-- Insert Users
-- Password is 'password123' hashed with bcrypt
INSERT INTO `Users` (`id`, `name`, `email`, `password`, `phone`, `role`, `profileImage`, `walletBalance`, `referralCode`, `referredBy`, `verified`, `status`, `lastLogin`, `createdAt`, `updatedAt`) VALUES
-- Super Admin
('a1b2c3d4-e5f6-4a5b-9c1d-2e3f4a5b6c7d', 'James Anderson', 'admin@eventmaster.com', '$2a$10$xVL3Z21HJF1j7zXnH4o0.OZXt.NIRv/Db0HeNmRgR3HyVqfBLwCVO', '1234567890', 'super_admin', '/uploads/profiles/admin.jpg', 0.00, 'JAM10001', NULL, TRUE, 'active', NOW(), NOW(), NOW()),

-- Organizers
('b2c3d4e5-f6a7-5b6c-0d1e-3f4a5b6c7d8e', 'Maria Garcia', 'maria@eventelite.com', '$2a$10$xVL3Z21HJF1j7zXnH4o0.OZXt.NIRv/Db0HeNmRgR3HyVqfBLwCVO', '2345678901', 'organizer', '/uploads/profiles/maria.jpg', 2750.00, 'MAR20001', NULL, TRUE, 'active', NOW(), NOW(), NOW()),
('c3d4e5f6-a7b8-6c7d-1e2f-4a5b6c7d8e9f', 'David Wong', 'david@summitevents.com', '$2a$10$xVL3Z21HJF1j7zXnH4o0.OZXt.NIRv/Db0HeNmRgR3HyVqfBLwCVO', '3456789012', 'organizer', '/uploads/profiles/david.jpg', 1850.00, 'DAV30001', NULL, TRUE, 'active', NOW(), NOW(), NOW()),
('d4e5f6a7-b8c9-7d8e-2f3a-5b6c7d8e9f0a', 'Priya Patel', 'priya@festivalhub.com', '$2a$10$xVL3Z21HJF1j7zXnH4o0.OZXt.NIRv/Db0HeNmRgR3HyVqfBLwCVO', '4567890123', 'organizer', '/uploads/profiles/priya.jpg', 3200.00, 'PRI40001', NULL, TRUE, 'active', NOW(), NOW(), NOW()),

-- Attendees
('e5f6a7b8-c9d0-8e9f-3a4b-6c7d8e9f0a1b', 'Michael Johnson', 'michael@gmail.com', '$2a$10$xVL3Z21HJF1j7zXnH4o0.OZXt.NIRv/Db0HeNmRgR3HyVqfBLwCVO', '5678901234', 'attendee', '/uploads/profiles/michael.jpg', 125.00, 'MIC50001', NULL, TRUE, 'active', NOW(), NOW(), NOW()),
('f6a7b8c9-d0e1-9f0a-4b5c-7d8e9f0a1b2c', 'Emma Wilson', 'emma.wilson@outlook.com', '$2a$10$xVL3Z21HJF1j7zXnH4o0.OZXt.NIRv/Db0HeNmRgR3HyVqfBLwCVO', '6789012345', 'attendee', '/uploads/profiles/emma.jpg', 75.00, 'EMM60001', 'e5f6a7b8-c9d0-8e9f-3a4b-6c7d8e9f0a1b', TRUE, 'active', NOW(), NOW(), NOW()),
('a7b8c9d0-e1f2-0a1b-5c6d-8e9f0a1b2c3d', 'Carlos Rodriguez', 'carlos@yahoo.com', '$2a$10$xVL3Z21HJF1j7zXnH4o0.OZXt.NIRv/Db0HeNmRgR3HyVqfBLwCVO', '7890123456', 'attendee', '/uploads/profiles/carlos.jpg', 0.00, 'CAR70001', 'e5f6a7b8-c9d0-8e9f-3a4b-6c7d8e9f0a1b', TRUE, 'active', NOW(), NOW(), NOW()),
('b8c9d0e1-f2a3-1b2c-6d7e-9f0a1b2c3d4e', 'Sophia Lee', 'sophia.lee@hotmail.com', '$2a$10$xVL3Z21HJF1j7zXnH4o0.OZXt.NIRv/Db0HeNmRgR3HyVqfBLwCVO', '8901234567', 'attendee', '/uploads/profiles/sophia.jpg', 200.00, 'SOP80001', NULL, TRUE, 'active', NOW(), NOW(), NOW()),
('c9d0e1f2-a3b4-2c3d-7e8f-0a1b2c3d4e5f', 'Ahmed Hassan', 'ahmed@gmail.com', '$2a$10$xVL3Z21HJF1j7zXnH4o0.OZXt.NIRv/Db0HeNmRgR3HyVqfBLwCVO', '9012345678', 'attendee', '/uploads/profiles/ahmed.jpg', 50.00, 'AHM90001', 'b8c9d0e1-f2a3-1b2c-6d7e-9f0a1b2c3d4e', TRUE, 'active', NOW(), NOW(), NOW());

-- Insert Events
INSERT INTO `Events` (`id`, `title`, `description`, `category`, `startDate`, `endDate`, `venue`, `venueAddress`, `status`, `bannerImage`, `organizerId`, `maxAttendees`, `isPublished`, `cancellationPolicy`, `organizerCommissionRate`, `createdAt`, `updatedAt`) VALUES
-- Past Events
('d0e1f2a3-b4c5-3d4e-8f9a-1b2c3d4e5f6a', 'TechConnect 2023', 'The ultimate web development workshop featuring the latest frameworks and technologies. Perfect for both beginners and experienced developers.', 'workshop', '2023-02-15 09:00:00', '2023-02-15 17:00:00', 'Innovation Hub', '123 Tech Avenue, San Francisco, CA 94105', 'completed', '/uploads/events/techconnect.jpg', 'b2c3d4e5-f6a7-5b6c-0d1e-3f4a5b6c7d8e', 80, TRUE, 'No refunds for cancellations made within 7 days of the event.', 10.00, '2023-01-01 12:00:00', '2023-01-01 12:00:00'),

('e1f2a3b4-c5d6-4e5f-9a0b-2c3d4e5f6a7b', 'Global Business Summit', 'Connect with top industry leaders and entrepreneurs from around the world. Learn cutting-edge business strategies and networking opportunities.', 'conference', '2023-04-20 10:00:00', '2023-04-22 16:00:00', 'Marriott Convention Center', '456 Financial District, New York, NY 10004', 'completed', '/uploads/events/business-summit.jpg', 'c3d4e5f6-a7b8-6c7d-1e2f-4a5b6c7d8e9f', 350, TRUE, 'Full refund available up to 14 days before the event. 50% refund up to 7 days before the event.', 15.00, '2023-02-01 12:00:00', '2023-02-01 12:00:00'),

-- Current/Upcoming Events
('f2a3b4c5-d6e7-5f6a-0b1c-3d4e5f6a7b8c', 'Summer Splash Music Festival', 'Experience three days of amazing live performances from top artists across multiple genres. Food stalls, art installations, and camping available!', 'concert', DATE_ADD(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 33 DAY), 'Lakeside Park', '789 Waterfront Drive, Austin, TX 78701', 'upcoming', '/uploads/events/summer-splash.jpg', 'd4e5f6a7-b8c9-7d8e-2f3a-5b6c7d8e9f0a', 2000, TRUE, 'No refunds available. Tickets can be transferred to another person up to 48 hours before the event.', 10.00, '2023-05-01 12:00:00', '2023-05-01 12:00:00'),

('a3b4c5d6-e7f8-6a7b-1c2d-4e5f6a7b8c9d', 'AI Revolution Conference', 'The world\'s leading AI and machine learning conference featuring keynotes from Google, Microsoft, and OpenAI. Live demos, workshops, and networking.', 'conference', DATE_ADD(NOW(), INTERVAL 15 DAY), DATE_ADD(NOW(), INTERVAL 17 DAY), 'Tech Conference Center', '321 Innovation Boulevard, Seattle, WA 98101', 'upcoming', '/uploads/events/ai-conference.jpg', 'c3d4e5f6-a7b8-6c7d-1e2f-4a5b6c7d8e9f', 500, TRUE, 'Full refund available up to 10 days before the event. No refunds after that.', 12.50, '2023-06-01 12:00:00', '2023-06-01 12:00:00'),

('b4c5d6e7-f8a9-7b8c-2d3e-5f6a7b8c9d0e', 'Digital Marketing Masterclass', 'Master the latest digital marketing strategies with hands-on workshops covering SEO, social media, content marketing, and data analytics.', 'workshop', DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), 'Digital Hub', '555 Market Street, Chicago, IL 60607', 'upcoming', '/uploads/events/marketing-masterclass.jpg', 'b2c3d4e5-f6a7-5b6c-0d1e-3f4a5b6c7d8e', 100, TRUE, 'Full refund available up to 5 days before the event. 25% refund up to 48 hours before the event.', 10.00, '2023-07-01 12:00:00', '2023-07-01 12:00:00'),

-- Ongoing Event
('c5d6e7f8-a9b0-8c9d-3e4f-6a7b8c9d0e1f', 'Nature Through the Lens', 'A spectacular exhibition featuring award-winning nature photography from National Geographic photographers. Workshops and guided tours available.', 'exhibition', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), 'Metropolitan Art Gallery', '987 Arts District, Los Angeles, CA 90012', 'ongoing', '/uploads/events/nature-photography.jpg', 'c3d4e5f6-a7b8-6c7d-1e2f-4a5b6c7d8e9f', 1000, TRUE, 'No refunds available.', 8.00, '2023-08-01 12:00:00', '2023-08-01 12:00:00'),

-- Draft Event (Not published)
('d6e7f8a9-b0c1-9d0e-4f5a-7b8c9d0e1f2a', 'Wellness & Mindfulness Retreat', 'A weekend of self-care with yoga, meditation, spa treatments, and healthy cuisine. Escape the city and reconnect with nature in this luxurious mountain resort.', 'workshop', DATE_ADD(NOW(), INTERVAL 60 DAY), DATE_ADD(NOW(), INTERVAL 62 DAY), 'Mountain Serenity Resort', '111 Peaceful Valley Road, Aspen, CO 81611', 'draft', '/uploads/events/wellness-retreat.jpg', 'b2c3d4e5-f6a7-5b6c-0d1e-3f4a5b6c7d8e', 50, FALSE, 'Full refund available up to 21 days before the event. 50% refund up to 14 days before.', 10.00, '2023-09-01 12:00:00', '2023-09-01 12:00:00');

-- Insert Speakers
INSERT INTO `Speakers` (`id`, `eventId`, `name`, `bio`, `photo`, `designation`, `organization`, `speakerType`, `sessionTopic`, `sessionTime`, `sessionDuration`, `socialLinks`, `createdAt`, `updatedAt`) VALUES
-- TechConnect Workshop Speakers
('e7f8a9b0-c1d2-0e1f-5a6b-8c9d0e1f2a3b', 'd0e1f2a3-b4c5-3d4e-8f9a-1b2c3d4e5f6a', 'Alex Chen', 'Alex is a Principal Engineer at Google with expertise in web frameworks and performance optimization.', '/uploads/speakers/alex-chen.jpg', 'Principal Engineer', 'Google', 'keynote', 'The Future of Web Development', '2023-02-15 09:30:00', 60, '{"twitter": "@alexchen", "linkedin": "alexchen"}', NOW(), NOW()),

('f8a9b0c1-d2e3-1f2a-6b7c-9d0e1f2a3b4c', 'd0e1f2a3-b4c5-3d4e-8f9a-1b2c3d4e5f6a', 'Jessica Martinez', 'Jessica is an award-winning UI/UX designer who has worked with startups and Fortune 500 companies.', '/uploads/speakers/jessica-martinez.jpg', 'Senior UX Designer', 'Adobe', 'regular', 'Creating Intuitive User Experiences', '2023-02-15 11:00:00', 45, '{"twitter": "@jessicam", "linkedin": "jessicamartinez"}', NOW(), NOW()),

-- Business Summit Speakers
('a9b0c1d2-e3f4-2a3b-7c8d-0e1f2a3b4c5d', 'e1f2a3b4-c5d6-4e5f-9a0b-2c3d4e5f6a7b', 'Robert Williams', 'Robert founded three successful tech startups and is an angel investor in over 30 companies.', '/uploads/speakers/robert-williams.jpg', 'CEO', 'Venture Capital Partners', 'keynote', 'Scaling Your Startup in a Competitive Market', '2023-04-20 10:30:00', 60, '{"twitter": "@robertw", "linkedin": "robertwilliams"}', NOW(), NOW()),

('b0c1d2e3-f4a5-3b4c-8d9e-1f2a3b4c5d6e', 'e1f2a3b4-c5d6-4e5f-9a0b-2c3d4e5f6a7b', 'Sophia Kim', 'Sophia is a marketing executive who transformed the global strategy of multiple Fortune 100 brands.', '/uploads/speakers/sophia-kim.jpg', 'CMO', 'Global Brands Inc.', 'guest', 'Digital Transformation in Marketing', '2023-04-20 13:30:00', 45, '{"twitter": "@sophiak", "linkedin": "sophiakim"}', NOW(), NOW()),

('c1d2e3f4-a5b6-4c5d-9e0f-2a3b4c5d6e7f', 'e1f2a3b4-c5d6-4e5f-9a0b-2c3d4e5f6a7b', 'Daniel Thompson', 'Daniel is a financial strategist specializing in growth models for technology companies.', '/uploads/speakers/daniel-thompson.jpg', 'CFO', 'Tech Financial Group', 'panel', 'Funding Strategies for Different Growth Stages', '2023-04-21 10:00:00', 90, '{"twitter": "@danielt", "linkedin": "danielthompson"}', NOW(), NOW()),

-- AI Conference Speakers
('d2e3f4a5-b6c7-5d6e-0f1a-3b4c5d6e7f8a', 'a3b4c5d6-e7f8-6a7b-1c2d-4e5f6a7b8c9d', 'Dr. James Miller', 'Dr. Miller leads AI research at Microsoft and has published over 50 papers on machine learning.', '/uploads/speakers/james-miller.jpg', 'Director of AI Research', 'Microsoft', 'keynote', 'The Future of AI and Human Collaboration', DATE_ADD(NOW(), INTERVAL 15 DAY) + INTERVAL 1 HOUR, 60, '{"twitter": "@jamesmiller", "linkedin": "jamesmiller"}', NOW(), NOW()),

('e3f4a5b6-c7d8-6e7f-1a2b-4c5d6e7f8a9b', 'a3b4c5d6-e7f8-6a7b-1c2d-4e5f6a7b8c9d', 'Dr. Lisa Zhang', 'Dr. Zhang is the creator of several breakthrough NLP models and language processing systems.', '/uploads/speakers/lisa-zhang.jpg', 'AI Research Scientist', 'OpenAI', 'guest', 'Recent Advances in Large Language Models', DATE_ADD(NOW(), INTERVAL 15 DAY) + INTERVAL 3 HOUR, 45, '{"twitter": "@lisazhang", "linkedin": "lisazhang"}', NOW(), NOW()),

-- Digital Marketing Masterclass Speakers
('f4a5b6c7-d8e9-7f8a-2b3c-5d6e7f8a9b0c', 'b4c5d6e7-f8a9-7b8c-2d3e-5f6a7b8c9d0e', 'Mark Anderson', 'Mark has helped over 200 companies improve their SEO rankings and digital presence.', '/uploads/speakers/mark-anderson.jpg', 'SEO Consultant', 'Digital Rankings LLC', 'keynote', 'SEO Strategies That Actually Work in 2023', DATE_ADD(NOW(), INTERVAL 7 DAY) + INTERVAL 1 HOUR, 60, '{"twitter": "@markanderson", "linkedin": "markanderson"}', NOW(), NOW()),

('a5b6c7d8-e9f0-8a9b-3c4d-6e7f8a9b0c1d', 'b4c5d6e7-f8a9-7b8c-2d3e-5f6a7b8c9d0e', 'Emma Davis', 'Emma is a social media strategist who has created viral campaigns for major brands.', '/uploads/speakers/emma-davis.jpg', 'Social Media Director', 'Viral Marketing Agency', 'regular', 'Creating Engaging Social Media Campaigns', DATE_ADD(NOW(), INTERVAL 7 DAY) + INTERVAL 2 HOUR + INTERVAL 30 MINUTE, 45, '{"twitter": "@emmadavis", "linkedin": "emmadavis"}', NOW(), NOW());

-- Insert Ticket Types
INSERT INTO `TicketTypes` (`id`, `eventId`, `name`, `description`, `price`, `quantity`, `availableQuantity`, `type`, `saleStartDate`, `saleEndDate`, `isActive`, `createdAt`, `updatedAt`) VALUES
-- TechConnect Workshop Tickets (Past Event)
('b6c7d8e9-f0a1-9b0c-4d5e-7f8a9b0c1d2e', 'd0e1f2a3-b4c5-3d4e-8f9a-1b2c3d4e5f6a', 'Standard Pass', 'Access to all workshop sessions, materials, and lunch', 99.00, 60, 0, 'general', '2023-01-10 00:00:00', '2023-02-14 23:59:59', TRUE, NOW(), NOW()),
('c7d8e9f0-a1b2-0c1d-5e6f-8a9b0c1d2e3f', 'd0e1f2a3-b4c5-3d4e-8f9a-1b2c3d4e5f6a', 'Premium Pass', 'Standard pass plus priority seating and one-on-one consultation with speakers', 149.00, 20, 0, 'premium', '2023-01-10 00:00:00', '2023-02-10 23:59:59', TRUE, NOW(), NOW()),

-- Business Summit Tickets (Past Event)
('d8e9f0a1-b2c3-1d2e-6f7a-9b0c1d2e3f4a', 'e1f2a3b4-c5d6-4e5f-9a0b-2c3d4e5f6a7b', 'Standard Conference Pass', 'Access to all sessions, keynotes, and networking events', 299.00, 150, 0, 'general', '2023-03-01 00:00:00', '2023-04-19 23:59:59', TRUE, NOW(), NOW()),
('e9f0a1b2-c3d4-2e3f-7a8b-0c1d2e3f4a5b', 'e1f2a3b4-c5d6-4e5f-9a0b-2c3d4e5f6a7b', 'VIP Pass', 'Standard access plus exclusive VIP reception, premium seating, and speaker meet-and-greet', 499.00, 50, 0, 'vip', '2023-03-01 00:00:00', '2023-04-10 23:59:59', TRUE, NOW(), NOW()),
('f0a1b2c3-d4e5-3f4a-8b9c-1d2e3f4a5b6c', 'e1f2a3b4-c5d6-4e5f-9a0b-2c3d4e5f6a7b', 'Workshop Add-on', 'Access to hands-on workshops on day three (requires Standard or VIP pass)', 99.00, 75, 0, 'other', '2023-03-01 00:00:00', '2023-04-15 23:59:59', TRUE, NOW(), NOW()),

-- Summer Splash Music Festival Tickets (Upcoming)
('a1b2c3d4-e5f6-4a5b-9c0d-2e3f4a5b6c7d', 'f2a3b4c5-d6e7-5f6a-0b1c-3d4e5f6a7b8c', 'General Admission', 'Three-day pass with access to all stages and camping area', 199.00, 1500, 1274, 'general', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), TRUE, NOW(), NOW()),
('b2c3d4e5-f6a7-5b6c-0d1e-3f4a5b6c7d8e', 'f2a3b4c5-d6e7-5f6a-0b1c-3d4e5f6a7b8c', 'VIP Experience', 'Premium viewing areas, exclusive lounges, fast-track entry, and complimentary food and drinks', 349.00, 300, 212, 'vip', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 20 DAY), TRUE, NOW(), NOW()),
('c3d4e5f6-a7b8-6c7d-1e2f-4a5b6c7d8e9f', 'f2a3b4c5-d6e7-5f6a-0b1c-3d4e5f6a7b8c', 'Single Day Pass', 'Access to all stages for one day (select day at checkout)', 89.00, 500, 327, 'general', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 28 DAY), TRUE, NOW(), NOW()),

-- AI Revolution Conference Tickets (Upcoming)
('d4e5f6a7-b8c9-7d8e-2f3a-5b6c7d8e9f0a', 'a3b4c5d6-e7f8-6a7b-1c2d-4e5f6a7b8c9d', 'Standard Access', 'Access to all keynotes, panels, and exhibition area', 249.00, 350, 286, 'general', DATE_SUB(NOW(), INTERVAL 45 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY), TRUE, NOW(), NOW()),
('e5f6a7b8-c9d0-8e9f-3a4b-6c7d8e9f0a1b', 'a3b4c5d6-e7f8-6a7b-1c2d-4e5f6a7b8c9d', 'Developer Pass', 'Standard access plus hands-on workshops and developer sessions', 349.00, 100, 67, 'premium', DATE_SUB(NOW(), INTERVAL 45 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), TRUE, NOW(), NOW()),
('f6a7b8c9-d0e1-9f0a-4b5c-7d8e9f0a1b2c', 'a3b4c5d6-e7f8-6a7b-1c2d-4e5f6a7b8c9d', 'Executive Pass', 'Premium access with exclusive networking sessions and executive roundtables', 499.00, 50, 32, 'vip', DATE_SUB(NOW(), INTERVAL 45 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), TRUE, NOW(), NOW()),

-- Digital Marketing Masterclass Tickets (Upcoming)
('a7b8c9d0-e1f2-0a1b-5c6d-8e9f0a1b2c3d', 'b4c5d6e7-f8a9-7b8c-2d3e-5f6a7b8c9d0e', 'Full Access Pass', 'Access to all workshops, materials, and lunch', 149.00, 75, 53, 'general', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_ADD(NOW(), INTERVAL 6 DAY), TRUE, NOW(), NOW()),
('b8c9d0e1-f2a3-1b2c-6d7e-9f0a1b2c3d4e', 'b4c5d6e7-f8a9-7b8c-2d3e-5f6a7b8c9d0e', 'Early Bird Special', 'Full access at a discounted rate (limited availability)', 99.00, 25, 0, 'early_bird', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), FALSE, NOW(), NOW()),

-- Photography Exhibition Tickets (Ongoing)
('c9d0e1f2-a3b4-2c3d-7e8f-0a1b2c3d4e5f', 'c5d6e7f8-a9b0-8c9d-3e4f-6a7b8c9d0e1f', 'General Admission', 'Access to the exhibition during regular hours', 15.00, 800, 428, 'general', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), TRUE, NOW(), NOW()),
('d0e1f2a3-b4c5-3d4e-8f9a-1b2c3d4e5f6a', 'c5d6e7f8-a9b0-8c9d-3e4f-6a7b8c9d0e1f', 'Guided Tour', 'General admission plus a guided tour with a photography expert', 25.00, 150, 98, 'premium', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_ADD(NOW(), INTERVAL 4 DAY), TRUE, NOW(), NOW()),
('e1f2a3b4-c5d6-4e5f-9a0b-2c3d4e5f6a7b', 'c5d6e7f8-a9b0-8c9d-3e4f-6a7b8c9d0e1f', 'Photography Workshop', 'Admission plus a 2-hour photography workshop (select date at checkout)', 45.00, 60, 37, 'other', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_ADD(NOW(), INTERVAL 3 DAY), TRUE, NOW(), NOW());

-- Insert Tickets (for purchased tickets)
INSERT INTO `Tickets` (`id`, `ticketTypeId`, `eventId`, `userId`, `referrerId`, `purchaseDate`, `purchasePrice`, `discountAmount`, `finalPrice`, `status`, `paymentStatus`, `ticketNumber`, `qrCode`, `isCheckedIn`, `checkedInAt`, `attendeePhoto`, `createdAt`, `updatedAt`) VALUES
-- Past event - TechConnect tickets
('f2a3b4c5-d6e7-5f6a-0b1c-3d4e5f6a7b8c', 'b6c7d8e9-f0a1-9b0c-4d5e-7f8a9b0c1d2e', 'd0e1f2a3-b4c5-3d4e-8f9a-1b2c3d4e5f6a', 'e5f6a7b8-c9d0-8e9f-3a4b-6c7d8e9f0a1b', NULL, '2023-01-20 15:30:00', 99.00, 0.00, 99.00, 'used', 'completed', 'TKT-A1B2C3D4', 'data:image/png;base64,iVBORw0KGgoAAA...', TRUE, '2023-02-15 09:15:00', '/uploads/attendees/michael-checkin.jpg', NOW(), NOW()),

('a3b4c5d6-e7f8-6a7b-1c2d-4e5f6a7b8c9d', 'c7d8e9f0-a1b2-0c1d-5e6f-8a9b0c1d2e3f', 'd0e1f2a3-b4c5-3d4e-8f9a-1b2c3d4e5f6a', 'f6a7b8c9-d0e1-9f0a-4b5c-7d8e9f0a1b2c', 'e5f6a7b8-c9d0-8e9f-3a4b-6c7d8e9f0a1b', '2023-01-25 12:45:00', 149.00, 14.90, 134.10, 'used', 'completed', 'TKT-E5F6G7H8', 'data:image/png;base64,iVBORw0KGgoAAA...', TRUE, '2023-02-15 08:55:00', '/uploads/attendees/emma-checkin.jpg', NOW(), NOW()),

-- Current event - Photography Exhibition tickets
('b4c5d6e7-f8a9-7b8c-2d3e-5f6a7b8c9d0e', 'c9d0e1f2-a3b4-2c3d-7e8f-0a1b2c3d4e5f', 'c5d6e7f8-a9b0-8c9d-3e4f-6a7b8c9d0e1f', 'e5f6a7b8-c9d0-8e9f-3a4b-6c7d8e9f0a1b', NULL, DATE_SUB(NOW(), INTERVAL 3 DAY), 15.00, 0.00, 15.00, 'confirmed', 'completed', 'TKT-I9J0K1L2', 'data:image/png;base64,iVBORw0KGgoAAA...', FALSE, NULL, NULL, NOW(), NOW()),

-- Upcoming event - AI Conference tickets
('c5d6e7f8-a9b0-8c9d-3e4f-6a7b8c9d0e1f', 'd4e5f6a7-b8c9-7d8e-2f3a-5b6c7d8e9f0a', 'a3b4c5d6-e7f8-6a7b-1c2d-4e5f6a7b8c9d', 'b8c9d0e1-f2a3-1b2c-6d7e-9f0a1b2c3d4e', NULL, DATE_SUB(NOW(), INTERVAL 5 DAY), 249.00, 0.00, 249.00, 'confirmed', 'completed', 'TKT-M3N4O5P6', 'data:image/png;base64,iVBORw0KGgoAAA...', FALSE, NULL, NULL, NOW(), NOW()),

('d6e7f8a9-b0c1-9d0e-4f5a-7b8c9d0e1f2a', 'f6a7b8c9-d0e1-9f0a-4b5c-7d8e9f0a1b2c', 'a3b4c5d6-e7f8-6a7b-1c2d-4e5f6a7b8c9d', 'a7b8c9d0-e1f2-0a1b-5c6d-8e9f0a1b2c3d', 'b8c9d0e1-f2a3-1b2c-6d7e-9f0a1b2c3d4e', DATE_SUB(NOW(), INTERVAL 2 DAY), 499.00, 49.90, 449.10, 'confirmed', 'completed', 'TKT-Q7R8S9T0', 'data:image/png;base64,iVBORw0KGgoAAA...', FALSE, NULL, NULL, NOW(), NOW());

-- Insert Payments
INSERT INTO `Payments` (`id`, `ticketId`, `userId`, `amount`, `paymentMethod`, `transactionId`, `status`, `paymentDate`, `gatewayResponse`, `refundAmount`, `refundDate`, `refundReason`, `invoiceNumber`, `createdAt`, `updatedAt`) VALUES
-- Past event payments
('e7f8a9b0-c1d2-0e1f-5a6b-8c9d0e1f2a3b', 'f2a3b4c5-d6e7-5f6a-0b1c-3d4e5f6a7b8c', 'e5f6a7b8-c9d0-8e9f-3a4b-6c7d8e9f0a1b', 99.00, 'card', 'TXN-12345678', 'completed', '2023-01-20 15:30:00', '{"status": "success", "card_last4": "4242"}', 0.00, NULL, NULL, 'INV-A1B2C3D4', NOW(), NOW()),

('f8a9b0c1-d2e3-1f2a-6b7c-9d0e1f2a3b4c', 'a3b4c5d6-e7f8-6a7b-1c2d-4e5f6a7b8c9d', 'f6a7b8c9-d0e1-9f0a-4b5c-7d8e9f0a1b2c', 134.10, 'bkash', 'TXN-23456789', 'completed', '2023-01-25 12:45:00', '{"status": "success", "phone": "01*****6789"}', 0.00, NULL, NULL, 'INV-E5F6G7H8', NOW(), NOW()),

-- Current event payments
('a9b0c1d2-e3f4-2a3b-7c8d-0e1f2a3b4c5d', 'b4c5d6e7-f8a9-7b8c-2d3e-5f6a7b8c9d0e', 'e5f6a7b8-c9d0-8e9f-3a4b-6c7d8e9f0a1b', 15.00, 'card', 'TXN-34567890', 'completed', DATE_SUB(NOW(), INTERVAL 3 DAY), '{"status": "success", "card_last4": "1234"}', 0.00, NULL, NULL, 'INV-I9J0K1L2', NOW(), NOW()),

-- Upcoming event payments
('b0c1d2e3-f4a5-3b4c-8d9e-1f2a3b4c5d6e', 'c5d6e7f8-a9b0-8c9d-3e4f-6a7b8c9d0e1f', 'b8c9d0e1-f2a3-1b2c-6d7e-9f0a1b2c3d4e', 249.00, 'nagad', 'TXN-45678901', 'completed', DATE_SUB(NOW(), INTERVAL 5 DAY), '{"status": "success", "phone": "01*****4567"}', 0.00, NULL, NULL, 'INV-M3N4O5P6', NOW(), NOW()),

('c1d2e3f4-a5b6-4c5d-9e0f-2a3b4c5d6e7f', 'd6e7f8a9-b0c1-9d0e-4f5a-7b8c9d0e1f2a', 'a7b8c9d0-e1f2-0a1b-5c6d-8e9f0a1b2c3d', 449.10, 'manual', 'TXN-56789012', 'completed', DATE_SUB(NOW(), INTERVAL 2 DAY), '{"status": "success", "notes": "Bank transfer verified"}', 0.00, NULL, NULL, 'INV-Q7R8S9T0', NOW(), NOW());

-- Insert Coupons
INSERT INTO `Coupons` (`id`, `code`, `discountType`, `discountValue`, `minPurchaseAmount`, `maxDiscountAmount`, `startDate`, `endDate`, `isActive`, `usageLimit`, `usedCount`, `eventId`, `description`, `createdAt`, `updatedAt`) VALUES
('d2e3f4a5-b6c7-5d6e-0f1a-3b4c5d6e7f8a', 'WELCOME10', 'percentage', 10.00, 50.00, 100.00, DATE_SUB(NOW(), INTERVAL 90 DAY), DATE_ADD(NOW(), INTERVAL 90 DAY), TRUE, 100, 12, NULL, 'Welcome discount for new users', NOW(), NOW()),

('e3f4a5b6-c7d8-6e7f-1a2b-4c5d6e7f8a9b', 'TECH25', 'percentage', 25.00, 100.00, 200.00, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), TRUE, 50, 8, 'a3b4c5d6-e7f8-6a7b-1c2d-4e5f6a7b8c9d', 'Special discount for AI Conference', NOW(), NOW()),

('f4a5b6c7-d8e9-7f8a-2b3c-5d6e7f8a9b0c', 'FLASH50', 'fixed', 50.00, 150.00, NULL, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY), TRUE, 20, 6, NULL, 'Flash sale discount for all events', NOW(), NOW());

-- Insert CouponUsages
INSERT INTO `CouponUsages` (`id`, `couponId`, `userId`, `ticketId`, `discountAmount`, `usedAt`, `createdAt`, `updatedAt`) VALUES
('a5b6c7d8-e9f0-8a9b-3c4d-6e7f8a9b0c1d', 'e3f4a5b6-c7d8-6e7f-1a2b-4c5d6e7f8a9b', 'a7b8c9d0-e1f2-0a1b-5c6d-8e9f0a1b2c3d', 'd6e7f8a9-b0c1-9d0e-4f5a-7b8c9d0e1f2a', 49.90, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW(), NOW()),

('b6c7d8e9-f0a1-9b0c-4d5e-7f8a9b0c1d2e', 'd2e3f4a5-b6c7-5d6e-0f1a-3b4c5d6e7f8a', 'f6a7b8c9-d0e1-9f0a-4b5c-7d8e9f0a1b2c', 'a3b4c5d6-e7f8-6a7b-1c2d-4e5f6a7b8c9d', 14.90, '2023-01-25 12:45:00', NOW(), NOW());

-- Insert Referrals
INSERT INTO `Referrals` (`id`, `referrerId`, `referredUserId`, `ticketId`, `status`, `commissionRate`, `commissionAmount`, `completedAt`, `createdAt`, `updatedAt`) VALUES
('c7d8e9f0-a1b2-0c1d-5e6f-8a9b0c1d2e3f', 'e5f6a7b8-c9d0-8e9f-3a4b-6c7d8e9f0a1b', 'f6a7b8c9-d0e1-9f0a-4b5c-7d8e9f0a1b2c', 'a3b4c5d6-e7f8-6a7b-1c2d-4e5f6a7b8c9d', 'completed', 5.00, 6.71, '2023-01-25 12:45:00', NOW(), NOW()),

('d8e9f0a1-b2c3-1d2e-6f7a-9b0c1d2e3f4a', 'b8c9d0e1-f2a3-1b2c-6d7e-9f0a1b2c3d4e', 'a7b8c9d0-e1f2-0a1b-5c6d-8e9f0a1b2c3d', 'd6e7f8a9-b0c1-9d0e-4f5a-7b8c9d0e1f2a', 'completed', 5.00, 22.46, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW(), NOW());

-- Insert CheckIns
INSERT INTO `CheckIns` (`id`, `ticketId`, `eventId`, `attendeeId`, `checkedInBy`, `checkInTime`, `checkInMethod`, `attendeePhoto`, `ipAddress`, `deviceInfo`, `checkInLocation`, `notes`, `createdAt`, `updatedAt`) VALUES
('e9f0a1b2-c3d4-2e3f-7a8b-0c1d2e3f4a5b', 'f2a3b4c5-d6e7-5f6a-0b1c-3d4e5f6a7b8c', 'd0e1f2a3-b4c5-3d4e-8f9a-1b2c3d4e5f6a', 'e5f6a7b8-c9d0-8e9f-3a4b-6c7d8e9f0a1b', 'b2c3d4e5-f6a7-5b6c-0d1e-3f4a5b6c7d8e', '2023-02-15 09:15:00', 'qr_code', '/uploads/attendees/michael-checkin.jpg', '192.168.1.100', 'Scanner Device X100', 'Main Entrance', NULL, NOW(), NOW()),

('f0a1b2c3-d4e5-3f4a-8b9c-1d2e3f4a5b6c', 'a3b4c5d6-e7f8-6a7b-1c2d-4e5f6a7b8c9d', 'd0e1f2a3-b4c5-3d4e-8f9a-1b2c3d4e5f6a', 'f6a7b8c9-d0e1-9f0a-4b5c-7d8e9f0a1b2c', 'b2c3d4e5-f6a7-5b6c-0d1e-3f4a5b6c7d8e', '2023-02-15 08:55:00', 'qr_code', '/uploads/attendees/emma-checkin.jpg', '192.168.1.100', 'Scanner Device X100', 'Main Entrance', NULL, NOW(), NOW());

-- Insert CommissionPayouts
INSERT INTO `CommissionPayouts` (`id`, `userId`, `amount`, `paymentMethod`, `status`, `transactionId`, `requestedAt`, `processedAt`, `notes`, `createdAt`, `updatedAt`) VALUES
('a1b2c3d4-e5f6-4a5b-9c1d-2e3f4a5b6c7d', 'e5f6a7b8-c9d0-8e9f-3a4b-6c7d8e9f0a1b', 100.00, 'bank_transfer', 'processed', 'PAY-12345678', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), 'Bank account: XXXX-XXXX-1234', NOW(), NOW()),

('b2c3d4e5-f6a7-5b6c-0d1e-3f4a5b6c7d8e', 'b8c9d0e1-f2a3-1b2c-6d7e-9f0a1b2c3d4e', 50.00, 'bank_transfer', 'pending', NULL, DATE_SUB(NOW(), INTERVAL 2 DAY), NULL, 'Bank account: XXXX-XXXX-5678', NOW(), NOW());