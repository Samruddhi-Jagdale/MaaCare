// routes/woman.js
const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getMyRecord } = require('../controllers/womanController');

const router = express.Router();

// Apply authentication and role-based authorization for pregnant women
router.use(protect, authorize('woman'));

router.get('/profile', getMyRecord);

module.exports = router;
