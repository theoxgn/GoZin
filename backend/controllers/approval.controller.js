const { Permission, User } = require('../models');
const { Op } = require('sequelize');
const notificationService = require('../services/notification.service');

/**
 * Controller untuk mendapatkan daftar perijinan yang perlu diapprove
 */
exports.getPendingPermissions = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    
    // Buat kondisi filter
    const whereCondition = { status: 'pending' };
    
    // Filter berdasarkan tipe perijinan
    if (type) {
      whereCondition.type = type;
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
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'department', 'position']
      }],
      order: [['createdAt', 'ASC']]
    });
    
    res.status(200).json({
      message: 'Daftar perijinan yang perlu diapprove berhasil dimuat',
      permissions
    });
  } catch (error) {
    console.error('Error in getPendingPermissions:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk menyetujui perijinan
 */
exports.approvePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const approvalId = req.userId;
    
    const permission = await Permission.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }]
    });
    
    if (!permission) {
      return res.status(404).json({ message: 'Perijinan tidak ditemukan' });
    }
    
    // Cek apakah perijinan masih dalam status pending
    if (permission.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Perijinan ini sudah diproses sebelumnya' 
      });
    }
    
    // Simpan status lama untuk notifikasi
    const oldStatus = permission.status;
    
    // Update status perijinan
    await permission.update({
      status: 'approved_by_approval',
      approvalId,
      approvalDate: new Date(),
      approvalNote: note
    });
    
    // Buat notifikasi untuk user
    try {
      await notificationService.createPermissionStatusNotification(
        permission,
        oldStatus,
        'approved_by_approval',
        req.userId
      );
      console.log('Notification sent for permission approval by Approval');
    } catch (error) {
      console.error('Failed to create notification for permission approval by Approval:', error);
      // Lanjutkan proses meskipun notifikasi gagal
    }
    
    res.status(200).json({
      message: 'Perijinan berhasil disetujui',
      permission
    });
  } catch (error) {
    console.error('Error in approvePermission:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk menolak perijinan
 */
exports.rejectPermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const approvalId = req.userId;
    
    if (!rejectionReason) {
      return res.status(400).json({ 
        message: 'Alasan penolakan harus diisi' 
      });
    }
    
    const permission = await Permission.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }]
    });
    
    if (!permission) {
      return res.status(404).json({ message: 'Perijinan tidak ditemukan' });
    }
    
    // Cek apakah perijinan masih dalam status pending
    if (permission.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Perijinan ini sudah diproses sebelumnya' 
      });
    }
    
    // Simpan status lama untuk notifikasi
    const oldStatus = permission.status;
    
    // Update status perijinan
    await permission.update({
      status: 'rejected',
      approvalId,
      approvalDate: new Date(),
      rejectionReason
    });
    
    // Buat notifikasi untuk user
    await notificationService.createPermissionStatusNotification(
      permission,
      oldStatus,
      'rejected',
      req.userId
    );
    
    res.status(200).json({
      message: 'Perijinan berhasil ditolak',
      permission
    });
  } catch (error) {
    console.error('Error in rejectPermission:', error);
    res.status(500).json({ message: error.message });
  }
};