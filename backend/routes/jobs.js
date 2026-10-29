const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', ctrl.getJobs);
router.get('/my', protect, authorize('employer', 'admin'), ctrl.getMyJobs);
router.get('/applications', protect, authorize('tenant'), ctrl.getMyApplications);
router.get('/:id', ctrl.getJobById);
router.post('/', protect, authorize('employer', 'admin'), ctrl.createJob);
router.get('/:id/applications', protect, authorize('employer', 'admin'), ctrl.getJobApplications);
router.post('/:id/apply', protect, authorize('tenant'), upload.single('resume'), ctrl.applyForJob);
router.put('/:id/applications/:appId/status', protect, authorize('employer', 'admin'), ctrl.updateApplicationStatus);

module.exports = router;
