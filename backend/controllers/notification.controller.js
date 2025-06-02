const { Notification, User, Permission } = require('../models');
const { Op } = require('sequelize');

/**
 * Controller untuk membuat notifikasi baru
 */
exports.createNotification = async (data) => {
  try {
    const { userId, permissionId, title, message, type = 'info' } = data;
    
    if (!userId) {
      console.error('Error creating notification: userId is required');
      return null;
    }
    
    if (!title || !message) {
      console.error('Error creating notification: title and message are required');
      return null;
    }
    
    const notification = await Notification.create({
      userId,
      permissionId,
      title,
      message,
      type
    });
    
    console.log('Notification created successfully:', notification.id);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null; // Return null instead of throwing error to prevent cascading failures
  }
};

/**
 * Controller untuk mendapatkan notifikasi user yang sedang login
 */
exports.getMyNotifications = async (req, res) => {
  try {
    const { isRead, limit = 10, page = 1 } = req.query;
    
    // Buat kondisi filter
    const whereCondition = { userId: req.userId };
    
    // Filter berdasarkan status baca
    if (isRead !== undefined) {
      whereCondition.isRead = isRead === 'true';
    }
    
    // Hitung total data
    const totalCount = await Notification.count({ where: whereCondition });
    
    // Ambil data dengan pagination
    const notifications = await Notification.findAll({
      where: whereCondition,
      include: [
        {
          model: Permission,
          as: 'permission',
          attributes: ['id', 'type', 'startDate', 'endDate', 'status']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });
    
    res.status(200).json({
      message: 'Daftar notifikasi berhasil dimuat',
      notifications,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      unreadCount: await Notification.count({ 
        where: { 
          userId: req.userId,
          isRead: false 
        } 
      })
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk menandai notifikasi sebagai telah dibaca
 */
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notifikasi tidak ditemukan' });
    }
    
    // Cek apakah notifikasi milik user yang sedang login
    if (notification.userId !== req.userId) {
      return res.status(403).json({ 
        message: 'Anda tidak memiliki akses untuk mengubah notifikasi ini' 
      });
    }
    
    await notification.update({ isRead: true });
    
    res.status(200).json({
      message: 'Notifikasi berhasil ditandai sebagai telah dibaca',
      notification
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk menandai semua notifikasi user sebagai telah dibaca
 */
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.userId, isRead: false } }
    );
    
    res.status(200).json({
      message: 'Semua notifikasi berhasil ditandai sebagai telah dibaca'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk menghapus notifikasi
 */
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notifikasi tidak ditemukan' });
    }
    
    // Cek apakah notifikasi milik user yang sedang login
    if (notification.userId !== req.userId) {
      return res.status(403).json({ 
        message: 'Anda tidak memiliki akses untuk menghapus notifikasi ini' 
      });
    }
    
    await notification.destroy();
    
    res.status(200).json({
      message: 'Notifikasi berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};