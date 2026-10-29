const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', auth.register);
router.post('/login', auth.login);
router.get('/me', protect, auth.getMe);
router.put('/profile', protect, upload.single('profile_image'), auth.updateProfile);
router.put('/change-password', protect, auth.changePassword);

module.exports = router;
