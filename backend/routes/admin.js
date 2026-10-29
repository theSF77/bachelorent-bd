const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/dashboard', ctrl.getDashboardStats);
router.get('/users', ctrl.getAllUsers);
router.put('/users/:id/verify', ctrl.verifyUser);
router.put('/users/:id/toggle', ctrl.toggleUserStatus);
router.get('/listings/pending', ctrl.getPendingListings);
router.put('/properties/:id/status', ctrl.updatePropertyStatus);
router.put('/jobs/:id/status', ctrl.updateJobStatus);
router.delete('/content/:type/:id', ctrl.deleteContent);
router.get('/inquiries', ctrl.getAllInquiries);

module.exports = router;
