const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Route untuk mendapatkan statistik dashboard
router.get('/dashboard', verifyToken, isAdmin, adminController.getDashboardStats);

// Route untuk mendapatkan daftar user dengan pagination
router.get('/users', verifyToken, adminController.getAllUsers);

// Route untuk mendapatkan semua konfigurasi perijinan
router.get('/permission-configs', verifyToken, adminController.getAllPermissionConfigs);

// Route untuk mendapatkan konfigurasi perijinan berdasarkan tipe
router.get('/permission-configs/:type', verifyToken, isAdmin, adminController.getPermissionConfigByType);

// Route untuk mengupdate konfigurasi perijinan
router.put('/permission-configs/:type', verifyToken, isAdmin, adminController.updatePermissionConfig);

// Route untuk membuat konfigurasi perijinan baru
router.post('/permission-configs', verifyToken, isAdmin, adminController.createPermissionConfig);

module.exports = router;