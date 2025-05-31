const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permission.controller');
const { verifyToken, isUser, isAdmin, isApprovalOrHRD } = require('../middleware/auth.middleware');

// Route untuk membuat perijinan baru (semua user yang terautentikasi)
router.post('/', verifyToken, permissionController.createPermission);

// Route untuk mendapatkan semua perijinan (admin, approval, hrd)
router.get('/', verifyToken, isApprovalOrHRD, permissionController.getAllPermissions);

// Route untuk mendapatkan detail perijinan berdasarkan ID
router.get('/:id', verifyToken, permissionController.getPermissionById);

// Route untuk mengupdate perijinan (user)
router.put('/:id', verifyToken, permissionController.updatePermission);

// Route untuk menghapus perijinan (user atau admin)
router.delete('/:id', verifyToken, permissionController.deletePermission);

module.exports = router;