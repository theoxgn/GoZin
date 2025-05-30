const { User, Permission, PermissionConfig, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Controller untuk mendapatkan statistik dashboard
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Mendapatkan total user berdasarkan role
    const userStats = await User.findAll({
      attributes: [
        'role',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['role']
    });
    
    // Mendapatkan total perijinan berdasarkan status
    const permissionStats = await Permission.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });
    
    // Mendapatkan total perijinan berdasarkan tipe
    const permissionTypeStats = await Permission.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['type']
    });
    
    // Mendapatkan total perijinan bulan ini
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0);
    
    const permissionThisMonth = await Permission.count({
      where: {
        createdAt: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      }
    });
    
    // Mendapatkan total perijinan yang disetujui bulan ini
    const approvedThisMonth = await Permission.count({
      where: {
        status: 'approved',
        createdAt: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      }
    });
    
    // Mendapatkan total perijinan yang ditolak bulan ini
    const rejectedThisMonth = await Permission.count({
      where: {
        status: 'rejected',
        createdAt: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      }
    });
    
    res.status(200).json({
      message: 'Statistik dashboard berhasil dimuat',
      stats: {
        users: {
          total: await User.count(),
          byRole: userStats
        },
        permissions: {
          total: await Permission.count(),
          byStatus: permissionStats,
          byType: permissionTypeStats,
          thisMonth: {
            total: permissionThisMonth,
            approved: approvedThisMonth,
            rejected: rejectedThisMonth,
            pending: permissionThisMonth - (approvedThisMonth + rejectedThisMonth)
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk mendapatkan semua konfigurasi perijinan
 */
exports.getAllPermissionConfigs = async (req, res) => {
  try {
    const configs = await PermissionConfig.findAll();
    
    res.status(200).json({
      message: 'Daftar konfigurasi perijinan berhasil dimuat',
      configs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk mendapatkan konfigurasi perijinan berdasarkan tipe
 */
exports.getPermissionConfigByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    const config = await PermissionConfig.findOne({
      where: { permissionType: type }
    });
    
    if (!config) {
      return res.status(404).json({ 
        message: 'Konfigurasi perijinan tidak ditemukan' 
      });
    }
    
    res.status(200).json({
      message: 'Konfigurasi perijinan berhasil dimuat',
      config
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk mengupdate konfigurasi perijinan
 */
exports.updatePermissionConfig = async (req, res) => {
  try {
    const { type } = req.params;
    const { maxPerMonth, maxDurationDays, description } = req.body;
    
    const config = await PermissionConfig.findOne({
      where: { permissionType: type }
    });
    
    if (!config) {
      return res.status(404).json({ 
        message: 'Konfigurasi perijinan tidak ditemukan' 
      });
    }
    
    // Validasi input
    if (maxPerMonth && maxPerMonth < 1) {
      return res.status(400).json({ 
        message: 'Jumlah maksimal perijinan per bulan minimal 1' 
      });
    }
    
    if (maxDurationDays && maxDurationDays < 1) {
      return res.status(400).json({ 
        message: 'Durasi maksimal perijinan minimal 1 hari' 
      });
    }
    
    // Update konfigurasi
    await config.update({
      maxPerMonth: maxPerMonth || config.maxPerMonth,
      maxDurationDays: maxDurationDays || config.maxDurationDays,
      description: description !== undefined ? description : config.description
    });
    
    res.status(200).json({
      message: 'Konfigurasi perijinan berhasil diupdate',
      config
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk membuat konfigurasi perijinan baru
 */
exports.createPermissionConfig = async (req, res) => {
  try {
    const { permissionType, maxPerMonth, maxDurationDays, description } = req.body;
    
    // Validasi tipe perijinan
    const validTypes = ['short_leave', 'cuti', 'visit', 'dinas'];
    if (!validTypes.includes(permissionType)) {
      return res.status(400).json({ message: 'Tipe perijinan tidak valid' });
    }
    
    // Cek apakah konfigurasi sudah ada
    const existingConfig = await PermissionConfig.findOne({
      where: { permissionType }
    });
    
    if (existingConfig) {
      return res.status(400).json({ 
        message: 'Konfigurasi untuk tipe perijinan ini sudah ada' 
      });
    }
    
    // Validasi input
    if (maxPerMonth && maxPerMonth < 1) {
      return res.status(400).json({ 
        message: 'Jumlah maksimal perijinan per bulan minimal 1' 
      });
    }
    
    if (maxDurationDays && maxDurationDays < 1) {
      return res.status(400).json({ 
        message: 'Durasi maksimal perijinan minimal 1 hari' 
      });
    }
    
    // Buat konfigurasi baru
    const config = await PermissionConfig.create({
      permissionType,
      maxPerMonth: maxPerMonth || 2,
      maxDurationDays: maxDurationDays || 12,
      description
    });
    
    res.status(201).json({
      message: 'Konfigurasi perijinan berhasil dibuat',
      config
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};