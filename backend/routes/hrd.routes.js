const express = require('express');
const router = express.Router();
const hrdController = require('../controllers/hrd.controller');
const { verifyToken, isHRD } = require('../middleware/auth.middleware');

// Route untuk mendapatkan daftar perijinan yang sudah disetujui oleh approval
router.get('/pending', verifyToken, isHRD, hrdController.getApprovedByApprovalPermissions);

// Route untuk menyetujui perijinan
router.put('/approve/:id', verifyToken, isHRD, hrdController.approvePermission);

// Route untuk menolak perijinan
router.put('/reject/:id', verifyToken, isHRD, hrdController.rejectPermission);

// Route untuk mendapatkan statistik perijinan
router.get('/stats', verifyToken, isHRD, hrdController.getStats);

module.exports = router;