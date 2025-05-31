const { User, Permission } = require('../models');
const { Op } = require('sequelize');

/**
 * Controller untuk mendapatkan semua user
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      message: 'Daftar user berhasil dimuat',
      users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk mendapatkan detail user berdasarkan ID
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    
    res.status(200).json({
      message: 'Detail user berhasil dimuat',
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk mengupdate data user
 */
exports.updateUser = async (req, res) => {
  try {
    const { name, email, department, position, role, isActive } = req.body;
    
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    
    // Update data user
    await user.update({
      name: name || user.name,
      email: email || user.email,
      department: department !== undefined ? department : user.department,
      position: position !== undefined ? position : user.position,
      role: role || user.role,
      isActive: isActive !== undefined ? isActive : user.isActive
    });
    
    // Hapus password dari response
    const userResponse = { ...user.get() };
    delete userResponse.password;
    
    res.status(200).json({
      message: 'User berhasil diupdate',
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk menghapus user
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    
    await user.destroy();
    
    res.status(200).json({
      message: 'User berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk mendapatkan daftar perijinan milik user yang sedang login
 */
exports.getMyPermissions = async (req, res) => {
  try {
    const { status, type, startDate, endDate, search, page = 1, limit = 10 } = req.query;
    
    // Buat kondisi filter
    const whereCondition = { userId: req.userId };
    
    // Filter berdasarkan status
    if (status) {
      whereCondition.status = status;
    }
    
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

    // Filter berdasarkan pencarian
    if (search) {
      whereCondition[Op.or] = [
        { reason: { [Op.like]: `%${search}%` } },
        { type: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Hitung total data
    const totalCount = await Permission.count({ where: whereCondition });
    
    // Ambil data dengan pagination
    const permissions = await Permission.findAll({
      where: whereCondition,
      include: [
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
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });
    
    res.status(200).json({
      message: 'Daftar perijinan berhasil dimuat',
      permissions,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};