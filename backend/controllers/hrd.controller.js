const { Permission, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Controller untuk mendapatkan daftar perijinan yang sudah disetujui oleh approval
 */
exports.getApprovedByApprovalPermissions = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    
    // Buat kondisi filter
    const whereCondition = { status: 'approved_by_approval' };
    
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
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'department', 'position']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['approvalDate', 'ASC']]
    });
    
    res.status(200).json({
      message: 'Daftar perijinan yang perlu disetujui HRD berhasil dimuat',
      permissions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk menyetujui perijinan oleh HRD
 */
exports.approvePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const hrdId = req.userId;
    
    const permission = await Permission.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    if (!permission) {
      return res.status(404).json({ message: 'Perijinan tidak ditemukan' });
    }
    
    // Cek apakah perijinan dalam status approved_by_approval
    if (permission.status !== 'approved_by_approval') {
      return res.status(400).json({ 
        message: 'Perijinan ini belum disetujui oleh approval atau sudah diproses oleh HRD' 
      });
    }
    
    // Update status perijinan
    await permission.update({
      status: 'approved',
      hrdId,
      hrdDate: new Date(),
      hrdNote: note
    });
    
    res.status(200).json({
      message: 'Perijinan berhasil disetujui oleh HRD',
      permission
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk menolak perijinan oleh HRD
 */
exports.rejectPermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const hrdId = req.userId;
    
    if (!rejectionReason) {
      return res.status(400).json({ 
        message: 'Alasan penolakan harus diisi' 
      });
    }
    
    const permission = await Permission.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    if (!permission) {
      return res.status(404).json({ message: 'Perijinan tidak ditemukan' });
    }
    
    // Cek apakah perijinan dalam status approved_by_approval
    if (permission.status !== 'approved_by_approval') {
      return res.status(400).json({ 
        message: 'Perijinan ini belum disetujui oleh approval atau sudah diproses oleh HRD' 
      });
    }
    
    // Update status perijinan
    await permission.update({
      status: 'rejected',
      hrdId,
      hrdDate: new Date(),
      rejectionReason
    });
    
    res.status(200).json({
      message: 'Perijinan berhasil ditolak oleh HRD',
      permission
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};