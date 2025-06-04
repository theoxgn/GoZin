const { AttendanceConfig, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Controller untuk mendapatkan semua konfigurasi absensi
 */
exports.getAllConfigs = async (req, res) => {
  try {
    const configs = await AttendanceConfig.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      message: 'Daftar konfigurasi absensi berhasil dimuat',
      configs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk mendapatkan konfigurasi absensi berdasarkan ID
 */
exports.getConfigById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const config = await AttendanceConfig.findByPk(id);
    
    if (!config) {
      return res.status(404).json({ message: 'Konfigurasi absensi tidak ditemukan' });
    }
    
    res.status(200).json({
      message: 'Konfigurasi absensi berhasil dimuat',
      config
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk membuat konfigurasi absensi baru
 */
exports.createConfig = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      workStartTime,
      workEndTime,
      lateThreshold,
      locationRequired,
      photoRequired,
      officeLocations,
      maxDistanceMeters,
      workingDays,
      departmentId
    } = req.body;
    
    // Validasi input
    if (!workStartTime || !workEndTime) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Jam kerja harus diisi' });
    }
    
    // Cek apakah sudah ada konfigurasi untuk departemen yang sama
    if (departmentId) {
      const existingConfig = await AttendanceConfig.findOne({
        where: { departmentId, isActive: true }
      });
      
      if (existingConfig) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Konfigurasi untuk departemen ini sudah ada' });
      }
    }
    
    // Buat konfigurasi baru
    const config = await AttendanceConfig.create({
      workStartTime,
      workEndTime,
      lateThreshold: lateThreshold || 15,
      locationRequired: locationRequired !== undefined ? locationRequired : true,
      photoRequired: photoRequired !== undefined ? photoRequired : true,
      officeLocations: officeLocations || [],
      maxDistanceMeters: maxDistanceMeters || 100,
      workingDays: workingDays || [1, 2, 3, 4, 5],
      departmentId,
      isActive: true
    }, { transaction });
    
    await transaction.commit();
    
    res.status(201).json({
      message: 'Konfigurasi absensi berhasil dibuat',
      config
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk mengupdate konfigurasi absensi
 */
exports.updateConfig = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const {
      workStartTime,
      workEndTime,
      lateThreshold,
      locationRequired,
      photoRequired,
      officeLocations,
      maxDistanceMeters,
      workingDays,
      departmentId,
      isActive
    } = req.body;
    
    const config = await AttendanceConfig.findByPk(id);
    
    if (!config) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Konfigurasi absensi tidak ditemukan' });
    }
    
    // Update konfigurasi
    await config.update({
      workStartTime: workStartTime || config.workStartTime,
      workEndTime: workEndTime || config.workEndTime,
      lateThreshold: lateThreshold !== undefined ? lateThreshold : config.lateThreshold,
      locationRequired: locationRequired !== undefined ? locationRequired : config.locationRequired,
      photoRequired: photoRequired !== undefined ? photoRequired : config.photoRequired,
      officeLocations: officeLocations || config.officeLocations,
      maxDistanceMeters: maxDistanceMeters !== undefined ? maxDistanceMeters : config.maxDistanceMeters,
      workingDays: workingDays || config.workingDays,
      departmentId: departmentId !== undefined ? departmentId : config.departmentId,
      isActive: isActive !== undefined ? isActive : config.isActive
    }, { transaction });
    
    await transaction.commit();
    
    res.status(200).json({
      message: 'Konfigurasi absensi berhasil diupdate',
      config
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk menghapus konfigurasi absensi
 */
exports.deleteConfig = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    const config = await AttendanceConfig.findByPk(id);
    
    if (!config) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Konfigurasi absensi tidak ditemukan' });
    }
    
    await config.destroy({ transaction });
    
    await transaction.commit();
    
    res.status(200).json({
      message: 'Konfigurasi absensi berhasil dihapus'
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk mendapatkan konfigurasi absensi aktif untuk departemen tertentu
 */
exports.getActiveConfigForDepartment = async (req, res) => {
  try {
    // Ambil departmentId dari params atau query
    const departmentId = req.params.departmentId || req.query.departmentId;
    
    const config = await AttendanceConfig.findOne({
      where: {
        [Op.or]: [
          { departmentId },
          { departmentId: null }
        ],
        isActive: true
      },
      order: [
        ['departmentId', 'DESC'] // Prioritaskan konfigurasi departemen spesifik
      ]
    });
    
    if (!config) {
      return res.status(404).json({ message: 'Konfigurasi absensi tidak ditemukan' });
    }
    
    res.status(200).json({
      message: 'Konfigurasi absensi berhasil dimuat',
      config
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};