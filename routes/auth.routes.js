const express = require('express');
const { login, register, getMe } = require('../controllers/auth.controller.js');
const { authMiddleware, roleCheck } = require('../middleware/auth.js');
const router = express.Router();

router.post('/login', login);
router.post('/register', authMiddleware, roleCheck(['admin']), register);
router.get('/me', authMiddleware, getMe);

module.exports = router;