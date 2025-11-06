const express = require('express');
const { register, login, logout } = require('../controller/authController.js');
const authMiddleware = require('./middleware/auth.Middleware.js');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);

module.exports = router;