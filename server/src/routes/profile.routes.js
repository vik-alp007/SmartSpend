const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword } = require('../controllers/profileController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getProfile);
router.patch('/', updateProfile);
router.post('/change-password', changePassword);

module.exports = router;
