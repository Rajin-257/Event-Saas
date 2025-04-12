const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

// Event routes
router.get('/', auth, eventController.getAllEvents);
router.get('/create', auth, roleCheck(['SuperAdmin', 'Admin']), eventController.getCreateEvent);
router.post('/create', auth, roleCheck(['SuperAdmin', 'Admin']), upload.single('featuredImage'), eventController.postCreateEvent);
router.get('/:id', auth, eventController.getEvent);
router.get('/:id/edit', auth, roleCheck(['SuperAdmin', 'Admin']), eventController.getEditEvent);
router.post('/:id/update', auth, roleCheck(['SuperAdmin', 'Admin']), upload.single('featuredImage'), eventController.postUpdateEvent);
router.post('/:id/delete', auth, roleCheck(['SuperAdmin', 'Admin']), eventController.deleteEvent);

// Event category routes
router.get('/categories', auth, roleCheck(['SuperAdmin', 'Admin']), eventController.getEventCategories);
router.post('/categories/create', auth, roleCheck(['SuperAdmin', 'Admin']), upload.single('icon'), eventController.postCreateCategory);
router.post('/categories/:id/update', auth, roleCheck(['SuperAdmin', 'Admin']), upload.single('icon'), eventController.postUpdateCategory);
router.post('/categories/:id/delete', auth, roleCheck(['SuperAdmin', 'Admin']), eventController.deleteCategory);

// Sponsor routes
router.get('/:id/sponsors', auth, roleCheck(['SuperAdmin', 'Admin']), eventController.getEventSponsors);
router.post('/:id/sponsors/add', auth, roleCheck(['SuperAdmin', 'Admin']), upload.single('logo'), eventController.postAddSponsor);
router.post('/:id/sponsors/:sponsorId/update', auth, roleCheck(['SuperAdmin', 'Admin']), upload.single('logo'), eventController.postUpdateSponsor);
router.post('/:id/sponsors/:sponsorId/delete', auth, roleCheck(['SuperAdmin', 'Admin']), eventController.deleteSponsor);

module.exports = router;