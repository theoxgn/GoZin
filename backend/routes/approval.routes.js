const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approval.controller');
const { verifyToken, isApproval } = require('../middleware/auth.middleware');

// Route untuk mendapatkan daftar perijinan yang perlu diapprove
router.get('/pending', verifyToken, approvalController.getPendingPermissions);

// Route untuk menyetujui perijinan
router.put('/approve/:id', verifyToken, isApproval, approvalController.approvePermission);

// Route untuk menolak perijinan
router.put('/reject/:id', verifyToken, isApproval, approvalController.rejectPermission);

module.exports = router;