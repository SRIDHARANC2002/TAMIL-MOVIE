const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Registration Route
router.post('/register', register);

// Login Route
router.post('/login', login);

module.exports = router;
