const { Permission, PermissionConfig } = require('../models');
const { Op, Sequelize } = require('sequelize');

/**
 * Controller untuk mendapatkan sisa kuota perizinan user
 */
exports.getRemainingQuota = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Dapatkan semua konfigurasi perizinan yang aktif
    const permissionConfigs = await PermissionConfig.findAll({
      where: { isActive: true },
      attributes: ['permissionType', 'label', 'maxPerMonth', 'maxDurationDays', 'description']
    });
    
    // Dapatkan bulan dan tahun saat ini
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Januari = 0
    const currentYear = currentDate.getFullYear();
    
    // Tentukan tanggal awal dan akhir bulan ini
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0);
    
    // Inisialisasi array untuk menyimpan hasil kuota
    const quotaResults = [];
    
    // Proses setiap tipe perizinan
    for (const config of permissionConfigs) {
      // Hitung jumlah perizinan yang sudah digunakan bulan ini
      const usedCount = await Permission.count({
        where: {
          userId,
          type: config.permissionType,
          startDate: {
            [Op.between]: [startOfMonth, endOfMonth]
          },
          status: {
            [Op.or]: ['pending', 'approved_by_approval', 'approved']
          }
        }
      });
      
      // Hitung sisa kuota
      const remainingQuota = config.maxPerMonth - usedCount;
      
      // Tambahkan ke hasil
      quotaResults.push({
        type: config.permissionType,
        label: config.label,
        maxPerMonth: config.maxPerMonth,
        used: usedCount,
        remaining: remainingQuota,
        maxDurationDays: config.maxDurationDays,
        description: config.description
      });
    }
    
    res.status(200).json({
      message: 'Sisa kuota perizinan berhasil dimuat',
      quotas: quotaResults,
      month: currentMonth,
      year: currentYear
    });
  } catch (error) {
    console.error('Error in getRemainingQuota:', error);
    res.status(500).json({ message: error.message });
  }
};