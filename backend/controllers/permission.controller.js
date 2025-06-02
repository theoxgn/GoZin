const { Permission, User, PermissionConfig, sequelize } = require('../models');
const { Op } = require('sequelize');
const notificationService = require('../services/notification.service');

/**
 * Controller untuk membuat perijinan baru
 */
exports.createPermission = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { type, startDate, endDate, reason } = req.body;
    const userId = req.userId;
    
    // Validasi tipe perijinan
    const validTypes = ['short_leave', 'cuti', 'visit', 'dinas'];
    if (!validTypes.includes(type)) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Tipe perijinan tidak valid' });
    }
    
    // Validasi tanggal
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Tanggal mulai tidak boleh lebih besar dari tanggal selesai' 
      });
    }
    
    // Cek konfigurasi perijinan
    const config = await PermissionConfig.findOne({ 
      where: { permissionType: type } 
    });
    
    if (!config) {
      await transaction.rollback();
      return res.status(404).json({ 
        message: 'Konfigurasi perijinan tidak ditemukan' 
      });
    }
    
    // Hitung durasi perijinan dalam hari
    const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    // Validasi durasi maksimal
    if (durationDays > config.maxDurationDays) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: `Durasi perijinan melebihi batas maksimal ${config.maxDurationDays} hari` 
      });
    }
    
    // Cek jumlah perijinan dalam bulan ini
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0);
    
    const permissionCount = await Permission.count({
      where: {
        userId,
        type,
        startDate: {
          [Op.between]: [startOfMonth, endOfMonth]
        },
        status: {
          [Op.or]: ['pending', 'approved_by_approval', 'approved']
        }
      }
    });
    
    if (permissionCount >= config.maxPerMonth) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: `Anda telah mencapai batas maksimal ${config.maxPerMonth} perijinan ${type} dalam bulan ini` 
      });
    }
    
    // Buat perijinan baru
    const permission = await Permission.create({
      userId,
      type,
      startDate,
      endDate,
      reason,
      status: 'pending'
    }, { transaction });
    
    await transaction.commit();
    
    // Buat notifikasi untuk user
    try {
      await notificationService.createNewPermissionNotification(permission);
      console.log('Notification sent for new permission creation');
    } catch (error) {
      console.error('Failed to create notification for new permission:', error);
      // Lanjutkan proses meskipun notifikasi gagal
    }
    
    res.status(201).json({
      message: 'Perijinan berhasil dibuat',
      permission
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk mendapatkan semua perijinan
 */
exports.getAllPermissions = async (req, res) => {
  try {
    const { status, type, userId, startDate, endDate } = req.query;
    
    // Buat kondisi filter
    const whereCondition = {};
    
    // Filter berdasarkan status
    if (status) {
      whereCondition.status = status;
    }
    
    // Filter berdasarkan tipe perijinan
    if (type) {
      whereCondition.type = type;
    }
    
    // Filter berdasarkan user
    if (userId) {
      whereCondition.userId = userId;
    }
    
    // Filter berdasarkan tanggal
    if (startDate && endDate) {
      whereCondition.startDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereCondition.startDate = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereCondition.startDate = {
        [Op.lte]: new Date(endDate)
      };
    }
    
    const permissions = await Permission.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'department', 'position']
        },
        {
          model: User,
          as: 'approval',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'hrd',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      message: 'Daftar perijinan berhasil dimuat',
      permissions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk mendapatkan detail perijinan berdasarkan ID
 */
exports.getPermissionById = async (req, res) => {
  try {
    const permission = await Permission.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'department', 'position']
        },
        {
          model: User,
          as: 'approval',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'hrd',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    if (!permission) {
      return res.status(404).json({ message: 'Perijinan tidak ditemukan' });
    }
    console.log('hehe',req.userRole);
    // Cek apakah user yang mengakses adalah pemilik perijinan atau memiliki role yang sesuai
    if (
      permission.userId !== req.userId && 
      !['approval', 'hrd', 'admin'].includes(req.userRole)
    ) {
      return res.status(403).json({ 
        message: 'Anda tidak memiliki akses untuk melihat perijinan ini' 
      });
    }
    
    res.status(200).json({
      message: 'Detail perijinan berhasil dimuat',
      permission
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk mengupdate perijinan
 */
exports.updatePermission = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { type, startDate, endDate, reason } = req.body;
    
    const permission = await Permission.findByPk(req.params.id);
    
    if (!permission) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Perijinan tidak ditemukan' });
    }
    
    // Cek apakah user yang mengupdate adalah pemilik perijinan
    if (permission.userId !== req.userId) {
      await transaction.rollback();
      return res.status(403).json({ 
        message: 'Anda tidak memiliki akses untuk mengupdate perijinan ini' 
      });
    }
    
    // Cek apakah perijinan masih dalam status pending
    if (permission.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Perijinan yang sudah diproses tidak dapat diupdate' 
      });
    }
    
    // Validasi tanggal jika ada
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: 'Tanggal mulai tidak boleh lebih besar dari tanggal selesai' 
        });
      }
    }
    
    // Update perijinan
    await permission.update({
      type: type || permission.type,
      startDate: startDate || permission.startDate,
      endDate: endDate || permission.endDate,
      reason: reason || permission.reason
    }, { transaction });
    
    await transaction.commit();
    
    res.status(200).json({
      message: 'Perijinan berhasil diupdate',
      permission
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk menghapus perijinan
 */
exports.deletePermission = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const permission = await Permission.findByPk(req.params.id);
    
    if (!permission) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Perijinan tidak ditemukan' });
    }
    
    // Cek apakah user yang menghapus adalah pemilik perijinan atau admin
    if (permission.userId !== req.userId && req.userRole !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({ 
        message: 'Anda tidak memiliki akses untuk menghapus perijinan ini' 
      });
    }
    
    // Cek apakah perijinan masih dalam status pending
    if (permission.status !== 'pending' && req.userRole !== 'admin') {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Perijinan yang sudah diproses tidak dapat dihapus' 
      });
    }
    
    await permission.destroy({ transaction });
    
    await transaction.commit();
    
    res.status(200).json({
      message: 'Perijinan berhasil dihapus'
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk membatalkan perijinan oleh user
 */
exports.cancelPermission = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { cancelReason } = req.body;
    
    if (!cancelReason || !cancelReason.trim()) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Alasan pembatalan harus diisi' });
    }
    
    const permission = await Permission.findByPk(req.params.id);
    
    if (!permission) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Perijinan tidak ditemukan' });
    }
    
    // Cek apakah user yang membatalkan adalah pemilik perijinan
    if (permission.userId !== req.userId) {
      await transaction.rollback();
      return res.status(403).json({ 
        message: 'Anda tidak memiliki akses untuk membatalkan perijinan ini' 
      });
    }
    
    // Cek apakah perijinan sudah dalam status final (approved atau rejected)
    if (['canceled', 'rejected'].includes(permission.status)) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Perijinan yang sudah dibatalkan atau ditolak tidak dapat dibatalkan lagi' 
      });
    }
    
    // Simpan status lama untuk notifikasi
    const oldStatus = permission.status;
    
    // Update status perijinan menjadi canceled
    await permission.update({
      status: 'canceled',
      cancelReason,
      canceledAt: new Date(),
      canceledBy: req.userId
    }, { transaction });
    
    await transaction.commit();
    
    // Buat notifikasi untuk user
    try {
      await notificationService.createPermissionStatusNotification(
        permission,
        oldStatus,
        'canceled',
        req.userId
      );
      console.log('Notification sent for permission cancellation');
    } catch (error) {
      console.error('Failed to create notification for permission cancellation:', error);
      // Lanjutkan proses meskipun notifikasi gagal
    }
    
    res.status(200).json({
      message: 'Perijinan berhasil dibatalkan',
      permission
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};