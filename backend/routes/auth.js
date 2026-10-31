// routes/auth.js
const express = require('express');
const { registerUser, authUser } = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimitMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');

const router = express.Router();

router.post('/register', authLimiter, validateRegister, registerUser);
router.post('/login', authLimiter, validateLogin, authUser);

module.exports = router;
