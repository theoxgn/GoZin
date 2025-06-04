const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { verifyToken, isHRD, isAdmin } = require('../middleware/auth.middleware');

// Route untuk user melakukan clock-in
router.post('/clock-in', verifyToken, attendanceController.clockIn);

// Route untuk user melakukan clock-out
router.post('/clock-out', verifyToken, attendanceController.clockOut);

// Route untuk user melihat absensi hari ini
router.get('/today', verifyToken, attendanceController.getTodayAttendance);

// Route untuk user melihat riwayat absensi
router.get('/history', verifyToken, attendanceController.getUserAttendanceHistory);

// Route untuk HRD melihat laporan absensi
router.get('/report', verifyToken, isHRD, attendanceController.getAttendanceReport);

// Route untuk HRD melihat statistik absensi
router.get('/stats', verifyToken, isHRD, attendanceController.getAttendanceStats);

module.exports = router;