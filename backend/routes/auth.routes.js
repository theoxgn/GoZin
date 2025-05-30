const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Route untuk register
router.post('/register', authController.register);

// Route untuk login
router.post('/login', authController.login);

// Route untuk mendapatkan profil user yang sedang login
router.get('/profile', verifyToken, authController.getProfile);

// Route untuk mengubah password
router.post('/change-password', verifyToken, authController.changePassword);

module.exports = router;