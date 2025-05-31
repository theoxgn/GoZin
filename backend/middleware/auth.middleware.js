const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware untuk memverifikasi token JWT
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token tidak disediakan' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token tidak valid atau kadaluarsa' });
  }
};

/**
 * Middleware untuk memeriksa role user
 */
const checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findByPk(req.userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }
      
      if (!roles.includes(user.role)) {
        return res.status(403).json({ 
          message: 'Anda tidak memiliki akses untuk melakukan tindakan ini' 
        });
      }
      
      req.userRole = user.role;
      req.user = user;
      next();
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
};

/**
 * Middleware untuk role user biasa
 */
const isUser = checkRole(['user']);

/**
 * Middleware untuk role approval
 */
const isApproval = checkRole(['approval']);

/**
 * Middleware untuk role HRD
 */
const isHRD = checkRole(['hrd']);

/**
 * Middleware untuk role admin
 */
const isAdmin = checkRole(['admin']);

/**
 * Middleware untuk role approval atau HRD
 */
const isApprovalOrHRD = checkRole(['approval', 'hrd','admin']);

/**
 * Middleware untuk role admin atau HRD
 */
const isAdminOrHRD = checkRole(['admin', 'hrd']);

module.exports = {
  verifyToken,
  isUser,
  isApproval,
  isHRD,
  isAdmin,
  isApprovalOrHRD,
  isAdminOrHRD
};