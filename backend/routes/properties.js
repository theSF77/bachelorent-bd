const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', ctrl.getProperties);
router.get('/saved', protect, ctrl.getSavedProperties);
router.get('/my', protect, authorize('provider', 'admin'), ctrl.getMyProperties);
router.get('/:id', ctrl.getPropertyById);
router.post('/', protect, authorize('provider', 'admin'), upload.array('images', 10), ctrl.createProperty);
router.put('/:id', protect, authorize('provider', 'admin'), ctrl.updateProperty);
router.delete('/:id', protect, authorize('provider', 'admin'), ctrl.deleteProperty);
router.post('/:id/inquire', protect, authorize('tenant'), ctrl.sendInquiry);
router.post('/:id/save', protect, authorize('tenant'), ctrl.saveProperty);

module.exports = router;
