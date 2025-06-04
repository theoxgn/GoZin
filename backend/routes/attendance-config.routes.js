const express = require('express');
const router = express.Router();
const attendanceConfigController = require('../controllers/attendance-config.controller');
const { verifyToken, isHRD, isAdmin } = require('../middleware/auth.middleware');

// Route untuk mendapatkan semua konfigurasi absensi
router.get('/', verifyToken, isHRD, attendanceConfigController.getAllConfigs);

// Route untuk mendapatkan konfigurasi absensi berdasarkan ID
router.get('/:id', verifyToken, isHRD, attendanceConfigController.getConfigById);

// Route untuk membuat konfigurasi absensi baru
router.post('/', verifyToken, isHRD, attendanceConfigController.createConfig);

// Route untuk mengupdate konfigurasi absensi
router.put('/:id', verifyToken, isHRD, attendanceConfigController.updateConfig);

// Route untuk menghapus konfigurasi absensi
router.delete('/:id', verifyToken, isHRD, attendanceConfigController.deleteConfig);

// Route untuk mendapatkan konfigurasi absensi aktif untuk departemen tertentu
router.get('/department/:departmentId', verifyToken, attendanceConfigController.getActiveConfigForDepartment);

// Route untuk mendapatkan konfigurasi absensi aktif berdasarkan departmentId dari query params
router.get('/active', verifyToken, attendanceConfigController.getActiveConfigForDepartment);

module.exports = router;