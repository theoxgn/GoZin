const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Route untuk mendapatkan notifikasi user yang sedang login
router.get('/', verifyToken, notificationController.getMyNotifications);

// Route untuk menandai notifikasi sebagai telah dibaca
router.put('/:id/read', verifyToken, notificationController.markAsRead);

// Route untuk menandai semua notifikasi user sebagai telah dibaca
router.put('/read-all', verifyToken, notificationController.markAllAsRead);

// Route untuk menghapus notifikasi
router.delete('/:id', verifyToken, notificationController.deleteNotification);

module.exports = router;