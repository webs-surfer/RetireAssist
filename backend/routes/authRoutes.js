const express = require('express');
const router = express.Router();
const { signup, login, googleAuth, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate, signupSchema, loginSchema } = require('../utils/validators');

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);

module.exports = router;
