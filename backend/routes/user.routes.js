const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isAdmin, isUser } = require('../middleware/auth.middleware');

// Route untuk mendapatkan semua user (hanya admin)
router.get('/', verifyToken, isAdmin, userController.getAllUsers);

// Route untuk mendapatkan detail user berdasarkan ID (hanya admin)
router.get('/:id', verifyToken, isAdmin, userController.getUserById);

// Route untuk mengupdate data user (hanya admin)
router.put('/:id', verifyToken, isAdmin, userController.updateUser);

// Route untuk menghapus user (hanya admin)
router.delete('/:id', verifyToken, isAdmin, userController.deleteUser);

// Route untuk mendapatkan daftar perijinan milik user yang sedang login
router.get('/permissions/me', verifyToken, userController.getMyPermissions);

module.exports = router;