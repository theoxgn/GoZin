const { Attendance, User, AttendanceConfig, sequelize } = require('../models');
const { Op } = require('sequelize');
const notificationService = require('../services/notification.service');
const notificationController = require('../controllers/notification.controller');

/**
 * Controller untuk melakukan clock-in
 */
exports.clockIn = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const userId = req.userId;
    const { latitude, longitude, photo } = req.body;
    
    // Dapatkan konfigurasi absensi
    const user = await User.findByPk(userId);
    const config = await AttendanceConfig.findOne({
      where: {
        [Op.or]: [
          { departmentId: user.department }
        ],
        isActive: true
      }
    });
    
    if (!config) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Konfigurasi absensi tidak ditemukan' });
    }
    
    // Validasi input lokasi jika diperlukan
    if (config.locationRequired && (!latitude || !longitude)) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Data lokasi diperlukan' });
    }
    
    // Cek apakah sudah ada absensi hari ini
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingAttendance = await Attendance.findOne({
      where: {
        userId,
        date: today
      }
    });
    
    if (existingAttendance && existingAttendance.clockInTime) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Anda sudah melakukan clock-in hari ini' });
    }
    
    // Konfigurasi absensi sudah didapatkan di awal fungsi
    
    // Validasi hari kerja
    const dayOfWeek = today.getDay(); // 0 = Minggu, 1 = Senin, dst
    if (!config.workingDays.includes(dayOfWeek)) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Hari ini bukan hari kerja' });
    }
    
    // Validasi lokasi jika diperlukan
    if (config.locationRequired && latitude && longitude) {
      let isValidLocation = false;
      
      // Cek apakah lokasi dalam radius yang diizinkan
      for (const officeLocation of config.officeLocations) {
        const distance = calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          officeLocation.latitude,
          officeLocation.longitude
        );
        
        if (distance <= config.maxDistanceMeters) {
          isValidLocation = true;
          break;
        }
      }
      
      if (!isValidLocation) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Anda berada di luar area kantor' });
      }
    }
    
    // Validasi foto jika diperlukan
    if (config.photoRequired && !photo) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Foto selfie diperlukan' });
    }
    
    // Tentukan status absensi
    const now = new Date();
    const workStartTime = new Date(today);
    const [hours, minutes, seconds] = config.workStartTime.split(':');
    workStartTime.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));
    
    const lateThresholdTime = new Date(workStartTime.getTime() + (config.lateThreshold * 60 * 1000));
    
    let status = 'present';
    if (now > lateThresholdTime) {
      status = 'late';
    }
    
    // Buat atau update data absensi
    let attendance;
    if (existingAttendance) {
      attendance = await existingAttendance.update({
        clockInTime: now,
        clockInLatitude: latitude ? parseFloat(latitude) : null,
        clockInLongitude: longitude ? parseFloat(longitude) : null,
        clockInPhoto: photo,
        status,
        isValid: true
      }, { transaction });
    } else {
      attendance = await Attendance.create({
        userId,
        clockInTime: now,
        clockInLatitude: latitude ? parseFloat(latitude) : null,
        clockInLongitude: longitude ? parseFloat(longitude) : null,
        clockInPhoto: photo,
        status,
        date: today,
        isValid: true
      }, { transaction });
    }
    
    // Kirim notifikasi jika terlambat
    if (status === 'late') {
      await notificationController.createNotification({
        userId,
        title: 'Keterlambatan',
        message: `Anda terlambat masuk pada ${now.toLocaleString()}`,
        type: 'warning'
      });
    }
    
    await transaction.commit();
    
    res.status(200).json({
      message: 'Clock-in berhasil',
      attendance
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk melakukan clock-out
 */
exports.clockOut = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const userId = req.userId;
    const { latitude, longitude, photo } = req.body;
    
    // Dapatkan konfigurasi absensi
    const user = await User.findByPk(userId);
    const config = await AttendanceConfig.findOne({
      where: {
        [Op.or]: [
          { departmentId: user.department },
          { departmentId: null }
        ],
        isActive: true
      }
    });
    
    if (!config) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Konfigurasi absensi tidak ditemukan' });
    }
    
    // Validasi input lokasi jika diperlukan
    if (config.locationRequired && (!latitude || !longitude)) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Data lokasi diperlukan' });
    }
    
    // Cek apakah sudah ada absensi hari ini
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendance = await Attendance.findOne({
      where: {
        userId,
        date: today
      }
    });
    
    if (!attendance) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Anda belum melakukan clock-in hari ini' });
    }
    
    if (attendance.clockOutTime) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Anda sudah melakukan clock-out hari ini' });
    }
    
    // Konfigurasi absensi sudah didapatkan di awal fungsi
    
    // Validasi lokasi jika diperlukan
    if (config.locationRequired && latitude && longitude) {
      let isValidLocation = false;
      
      // Cek apakah lokasi dalam radius yang diizinkan
      for (const officeLocation of config.officeLocations) {
        const distance = calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          officeLocation.latitude,
          officeLocation.longitude
        );
        
        if (distance <= config.maxDistanceMeters) {
          isValidLocation = true;
          break;
        }
      }
      
      if (!isValidLocation) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Anda berada di luar area kantor' });
      }
    }
    
    // Validasi foto jika diperlukan
    if (config.photoRequired && !photo) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Foto selfie diperlukan' });
    }
    
    // Update data absensi
    const now = new Date();
    await attendance.update({
      clockOutTime: now,
      clockOutLatitude: latitude ? parseFloat(latitude) : null,
      clockOutLongitude: longitude ? parseFloat(longitude) : null,
      clockOutPhoto: photo
    }, { transaction });
    
    // Cek apakah pulang lebih awal
    const workEndTime = new Date(today);
    const [hours, minutes, seconds] = config.workEndTime.split(':');
    workEndTime.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));
    
    if (now < workEndTime) {
      await notificationService.createNotification({
        userId,
        title: 'Pulang Lebih Awal',
        message: `Anda pulang lebih awal pada ${now.toLocaleString()}`,
        type: 'attendance',
        isRead: false
      }, transaction);
    }
    
    await transaction.commit();
    
    res.status(200).json({
      message: 'Clock-out berhasil',
      attendance
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk mendapatkan riwayat absensi user
 */
exports.getUserAttendanceHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { startDate, endDate, limit = 30, page = 1 } = req.query;
    
    // Buat kondisi filter
    const whereCondition = { userId };
    
    // Filter berdasarkan tanggal
    if (startDate && endDate) {
      whereCondition.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereCondition.date = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereCondition.date = {
        [Op.lte]: new Date(endDate)
      };
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows: attendances } = await Attendance.findAndCountAll({
      where: whereCondition,
      order: [['date', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });
    
    res.status(200).json({
      message: 'Riwayat absensi berhasil dimuat',
      attendances,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk mendapatkan absensi hari ini
 */
exports.getTodayAttendance = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Dapatkan tanggal hari ini
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendance = await Attendance.findOne({
      where: {
        userId,
        date: today
      }
    });
    
    if (!attendance) {
      return res.status(200).json({
        message: 'Belum ada absensi hari ini',
        attendance: null
      });
    }
    
    res.status(200).json({
      message: 'Absensi hari ini berhasil dimuat',
      attendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk HRD mendapatkan laporan absensi
 */
exports.getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, userId, department, status, limit = 30, page = 1 } = req.query;
    
    // Buat kondisi filter
    const whereCondition = {};
    const userWhereCondition = {};
    
    // Filter berdasarkan tanggal
    if (startDate && endDate) {
      whereCondition.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereCondition.date = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereCondition.date = {
        [Op.lte]: new Date(endDate)
      };
    }
    
    // Filter berdasarkan user
    if (userId) {
      whereCondition.userId = userId;
    }
    
    // Filter berdasarkan department
    if (department) {
      userWhereCondition.department = department;
    }
    
    // Filter berdasarkan status
    if (status) {
      whereCondition.status = status;
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows: attendances } = await Attendance.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'department', 'position'],
          where: userWhereCondition
        }
      ],
      order: [['date', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });
    
    res.status(200).json({
      message: 'Laporan absensi berhasil dimuat',
      attendances,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk mendapatkan statistik absensi
 */
exports.getAttendanceStats = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    
    // Buat kondisi filter
    const whereCondition = {};
    const userWhereCondition = {};
    
    // Filter berdasarkan tanggal
    if (startDate && endDate) {
      whereCondition.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereCondition.date = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereCondition.date = {
        [Op.lte]: new Date(endDate)
      };
    } else {
      // Default: bulan ini
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      
      whereCondition.date = {
        [Op.gte]: firstDayOfMonth
      };
    }
    
    // Filter berdasarkan department
    if (department) {
      userWhereCondition.department = department;
    }
    
    // Hitung statistik
    const totalAttendances = await Attendance.count({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'user',
          attributes: [],
          where: userWhereCondition
        }
      ]
    });
    
    const presentCount = await Attendance.count({
      where: { ...whereCondition, status: 'present' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: [],
          where: userWhereCondition
        }
      ]
    });
    
    const lateCount = await Attendance.count({
      where: { ...whereCondition, status: 'late' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: [],
          where: userWhereCondition
        }
      ]
    });
    
    const absentCount = await Attendance.count({
      where: { ...whereCondition, status: 'absent' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: [],
          where: userWhereCondition
        }
      ]
    });
    
    const halfDayCount = await Attendance.count({
      where: { ...whereCondition, status: 'half_day' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: [],
          where: userWhereCondition
        }
      ]
    });
    
    const leaveCount = await Attendance.count({
      where: { ...whereCondition, status: 'leave' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: [],
          where: userWhereCondition
        }
      ]
    });
    
    res.status(200).json({
      message: 'Statistik absensi berhasil dimuat',
      stats: {
        totalAttendances,
        presentCount,
        lateCount,
        absentCount,
        halfDayCount,
        leaveCount,
        presentPercentage: totalAttendances > 0 ? (presentCount / totalAttendances) * 100 : 0,
        latePercentage: totalAttendances > 0 ? (lateCount / totalAttendances) * 100 : 0,
        absentPercentage: totalAttendances > 0 ? (absentCount / totalAttendances) * 100 : 0,
        halfDayPercentage: totalAttendances > 0 ? (halfDayCount / totalAttendances) * 100 : 0,
        leavePercentage: totalAttendances > 0 ? (leaveCount / totalAttendances) * 100 : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Fungsi untuk menghitung jarak antara dua titik koordinat (dalam meter)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // radius bumi dalam meter
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // jarak dalam meter
}