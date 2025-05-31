const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Controller untuk mendaftarkan user baru
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department, position } = req.body;
    
    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }
    
    // Validasi role
    const validRoles = ['user', 'approval', 'hrd', 'admin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: 'Role tidak valid' });
    }
    
    // Buat user baru
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      department,
      position
    });
    
    // Hapus password dari response
    const userResponse = { ...user.get() };
    delete userResponse.password;
    
    res.status(201).json({
      message: 'User berhasil didaftarkan',
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk login user
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Cek apakah user ada
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    
    // Cek apakah user aktif
    if (!user.isActive) {
      return res.status(403).json({ message: 'Akun anda tidak aktif' });
    }
    
    // Cek password
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Password salah' });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    // Hapus password dari response
    const userResponse = { ...user.get() };
    delete userResponse.password;
    
    res.status(200).json({
      message: 'Login berhasil',
      user: userResponse,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk mendapatkan data user yang sedang login
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    
    res.status(200).json({
      message: 'Profil berhasil dimuat',
      user: user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller untuk mengubah password
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Cek apakah user ada
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    
    // Cek password lama
    const isPasswordValid = await user.checkPassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Password saat ini salah' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      message: 'Password berhasil diubah'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};