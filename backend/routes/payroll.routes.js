const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payroll.controller');
const { verifyToken, isHRD, isAdmin } = require('../middleware/auth.middleware');

// Route untuk HRD menghitung gaji karyawan
router.post('/calculate', verifyToken, isHRD, payrollController.calculatePayroll);

// Route untuk HRD memproses payroll
router.put('/process/:id', verifyToken, isHRD, payrollController.processPayroll);

// Route untuk HRD menandai payroll sebagai dibayar
router.put('/pay/:id', verifyToken, isHRD, payrollController.markAsPaid);

// Route untuk HRD melihat daftar payroll
router.get('/', verifyToken, isHRD, payrollController.getAllPayrolls);

// Route untuk HRD melihat detail payroll
router.get('/detail/:id', verifyToken, isHRD, payrollController.getPayrollById);

// Route untuk user melihat riwayat payroll
router.get('/history', verifyToken, payrollController.getUserPayrollHistory);

// Route untuk user melihat slip gaji
router.get('/slip/:id', verifyToken, payrollController.getPayslip);

// Route untuk HRD melihat statistik payroll
router.get('/stats', verifyToken, isHRD, payrollController.getPayrollStats);

module.exports = router;