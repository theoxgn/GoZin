const { Payroll, User, Attendance, sequelize } = require('../models');
const { Op } = require('sequelize');
const notificationService = require('../services/notification.service');

/**
 * Controller untuk menghitung gaji karyawan
 */
exports.calculatePayroll = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { userId, month, year, basicSalary, allowances } = req.body;
    
    // Validasi input
    if (!userId || !month || !year || !basicSalary) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }
    
    // Cek apakah user ada
    const user = await User.findByPk(userId);
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    
    // Cek apakah sudah ada payroll untuk bulan dan tahun tersebut
    const existingPayroll = await Payroll.findOne({
      where: {
        userId,
        month: parseInt(month),
        year: parseInt(year)
      }
    });
    
    if (existingPayroll) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Payroll untuk periode ini sudah ada' });
    }
    
    // Dapatkan data absensi untuk bulan dan tahun tersebut
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const attendances = await Attendance.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [startDate, endDate]
        }
      }
    });
    
    // Hitung jumlah hari kerja, keterlambatan, dan absen
    const workingDays = attendances.length;
    const lateCount = attendances.filter(a => a.status === 'late').length;
    const absentCount = attendances.filter(a => a.status === 'absent').length;
    const halfDayCount = attendances.filter(a => a.status === 'half_day').length;
    
    // Hitung potongan berdasarkan keterlambatan dan absen
    const lateDeduction = lateCount * (basicSalary * 0.005); // 0.5% per keterlambatan
    const absentDeduction = absentCount * (basicSalary * 0.05); // 5% per absen
    const halfDayDeduction = halfDayCount * (basicSalary * 0.025); // 2.5% per setengah hari
    
    // Hitung BPJS
    const bpjsKesehatan = basicSalary * 0.01; // 1% dari gaji pokok
    const bpjsKetenagakerjaan = basicSalary * 0.02; // 2% dari gaji pokok
    
    // Hitung PPh 21 (simulasi sederhana)
    const annualIncome = basicSalary * 12;
    let pph21 = 0;
    
    if (annualIncome <= 50000000) {
      pph21 = (basicSalary * 0.05) / 12; // 5% untuk penghasilan tahunan sampai 50 juta
    } else if (annualIncome <= 250000000) {
      pph21 = (basicSalary * 0.15) / 12; // 15% untuk penghasilan tahunan 50-250 juta
    } else if (annualIncome <= 500000000) {
      pph21 = (basicSalary * 0.25) / 12; // 25% untuk penghasilan tahunan 250-500 juta
    } else {
      pph21 = (basicSalary * 0.30) / 12; // 30% untuk penghasilan tahunan di atas 500 juta
    }
    
    // Hitung total pendapatan dan potongan
    const totalDeductions = lateDeduction + absentDeduction + halfDayDeduction + bpjsKesehatan + bpjsKetenagakerjaan + pph21;
    const totalEarnings = parseFloat(basicSalary) + (allowances ? parseFloat(allowances) : 0);
    const netSalary = totalEarnings - totalDeductions;
    
    // Buat payroll baru
    const payroll = await Payroll.create({
      userId,
      month: parseInt(month),
      year: parseInt(year),
      basicSalary: parseFloat(basicSalary),
      allowances: allowances ? parseFloat(allowances) : 0,
      overtime: 0, // Belum ada perhitungan lembur
      deductions: lateDeduction + absentDeduction + halfDayDeduction,
      bpjsKesehatan,
      bpjsKetenagakerjaan,
      pph21,
      totalEarnings,
      totalDeductions,
      netSalary,
      status: 'draft',
      notes: `Keterlambatan: ${lateCount}, Absen: ${absentCount}, Setengah hari: ${halfDayCount}`
    }, { transaction });
    
    await transaction.commit();
    
    res.status(201).json({
      message: 'Perhitungan gaji berhasil',
      payroll
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk memproses payroll (mengubah status dari draft ke processed)
 */
exports.processPayroll = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    const payroll = await Payroll.findByPk(id);
    
    if (!payroll) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Payroll tidak ditemukan' });
    }
    
    if (payroll.status !== 'draft') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Payroll sudah diproses sebelumnya' });
    }
    
    await payroll.update({
      status: 'processed',
      updatedAt: new Date()
    }, { transaction });
    
    // Kirim notifikasi ke user
    await notificationService.createNotification({
      userId: payroll.userId,
      title: 'Slip Gaji',
      message: `Slip gaji Anda untuk periode ${payroll.month}/${payroll.year} telah diproses`,
      type: 'payroll',
      isRead: false
    }, transaction);
    
    await transaction.commit();
    
    res.status(200).json({
      message: 'Payroll berhasil diproses',
      payroll
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk menandai payroll sebagai dibayar
 */
exports.markAsPaid = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { paymentDate } = req.body;
    
    const payroll = await Payroll.findByPk(id);
    
    if (!payroll) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Payroll tidak ditemukan' });
    }
    
    if (payroll.status !== 'processed') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Payroll belum diproses' });
    }
    
    await payroll.update({
      status: 'paid',
      paymentDate: paymentDate || new Date(),
      updatedAt: new Date()
    }, { transaction });
    
    // Kirim notifikasi ke user
    await notificationService.createNotification({
      userId: payroll.userId,
      title: 'Pembayaran Gaji',
      message: `Gaji Anda untuk periode ${payroll.month}/${payroll.year} telah dibayarkan`,
      type: 'payroll',
      isRead: false
    }, transaction);
    
    await transaction.commit();
    
    res.status(200).json({
      message: 'Payroll berhasil ditandai sebagai dibayar',
      payroll
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk mendapatkan daftar payroll (untuk HRD)
 */
exports.getAllPayrolls = async (req, res) => {
  try {
    const { month, year, status, userId, department, limit = 30, page = 1 } = req.query;
    
    // Buat kondisi filter
    const whereCondition = {};
    const userWhereCondition = {};
    
    // Filter berdasarkan bulan dan tahun
    if (month) {
      whereCondition.month = parseInt(month);
    }
    
    if (year) {
      whereCondition.year = parseInt(year);
    }
    
    // Filter berdasarkan status
    if (status) {
      whereCondition.status = status;
    }
    
    // Filter berdasarkan user
    if (userId) {
      whereCondition.userId = userId;
    }
    
    // Filter berdasarkan department
    if (department) {
      userWhereCondition.department = department;
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows: payrolls } = await Payroll.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'department', 'position'],
          where: userWhereCondition
        }
      ],
      order: [['year', 'DESC'], ['month', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });
    
    res.status(200).json({
      message: 'Daftar payroll berhasil dimuat',
      payrolls,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk mendapatkan detail payroll
 */
exports.getPayrollById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const payroll = await Payroll.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'department', 'position']
        }
      ]
    });
    
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll tidak ditemukan' });
    }
    
    res.status(200).json({
      message: 'Detail payroll berhasil dimuat',
      payroll
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk mendapatkan riwayat payroll user
 */
exports.getUserPayrollHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 12, page = 1 } = req.query;
    
    const offset = (page - 1) * limit;
    
    const { count, rows: payrolls } = await Payroll.findAndCountAll({
      where: { userId },
      order: [['year', 'DESC'], ['month', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });
    
    res.status(200).json({
      message: 'Riwayat payroll berhasil dimuat',
      payrolls,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk mendapatkan slip gaji
 */
exports.getPayslip = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const payroll = await Payroll.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'department', 'position']
        }
      ]
    });
    
    if (!payroll) {
      return res.status(404).json({ message: 'Slip gaji tidak ditemukan' });
    }
    
    // Cek apakah user yang request adalah pemilik slip gaji atau HRD/admin
    if (payroll.userId !== userId && req.userRole !== 'hrd' && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Anda tidak memiliki akses ke slip gaji ini' });
    }
    
    res.status(200).json({
      message: 'Slip gaji berhasil dimuat',
      payslip: {
        id: payroll.id,
        employeeName: payroll.user.name,
        employeeId: payroll.userId,
        department: payroll.user.department,
        position: payroll.user.position,
        month: payroll.month,
        year: payroll.year,
        payPeriod: `${payroll.month}/${payroll.year}`,
        earnings: {
          basicSalary: payroll.basicSalary,
          allowances: payroll.allowances,
          overtime: payroll.overtime,
          totalEarnings: payroll.totalEarnings
        },
        deductions: {
          lateAndAbsent: payroll.deductions,
          bpjsKesehatan: payroll.bpjsKesehatan,
          bpjsKetenagakerjaan: payroll.bpjsKetenagakerjaan,
          pph21: payroll.pph21,
          totalDeductions: payroll.totalDeductions
        },
        netSalary: payroll.netSalary,
        status: payroll.status,
        paymentDate: payroll.paymentDate,
        notes: payroll.notes
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk mendapatkan statistik payroll
 */
exports.getPayrollStats = async (req, res) => {
  try {
    const { year, month, department } = req.query;
    
    // Buat kondisi filter
    const whereCondition = {};
    const userWhereCondition = {};
    
    // Filter berdasarkan tahun
    if (year) {
      whereCondition.year = parseInt(year);
    } else {
      whereCondition.year = new Date().getFullYear();
    }
    
    // Filter berdasarkan bulan
    if (month) {
      whereCondition.month = parseInt(month);
    }
    
    // Filter berdasarkan department
    if (department) {
      userWhereCondition.department = department;
    }
    
    // Hitung total gaji yang dibayarkan
    const totalPaid = await Payroll.sum('netSalary', {
      where: { ...whereCondition, status: 'paid' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: [],
          where: userWhereCondition
        }
      ]
    });
    
    // Hitung total potongan
    const totalDeductions = await Payroll.sum('totalDeductions', {
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
    
    // Hitung jumlah payroll berdasarkan status
    const draftCount = await Payroll.count({
      where: { ...whereCondition, status: 'draft' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: [],
          where: userWhereCondition
        }
      ]
    });
    
    const processedCount = await Payroll.count({
      where: { ...whereCondition, status: 'processed' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: [],
          where: userWhereCondition
        }
      ]
    });
    
    const paidCount = await Payroll.count({
      where: { ...whereCondition, status: 'paid' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: [],
          where: userWhereCondition
        }
      ]
    });
    
    // Hitung total payroll
    const totalPayrolls = draftCount + processedCount + paidCount;
    
    res.status(200).json({
      message: 'Statistik payroll berhasil dimuat',
      stats: {
        totalPaid: totalPaid || 0,
        totalDeductions: totalDeductions || 0,
        draftCount,
        processedCount,
        paidCount,
        totalPayrolls,
        draftPercentage: totalPayrolls > 0 ? (draftCount / totalPayrolls) * 100 : 0,
        processedPercentage: totalPayrolls > 0 ? (processedCount / totalPayrolls) * 100 : 0,
        paidPercentage: totalPayrolls > 0 ? (paidCount / totalPayrolls) * 100 : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};