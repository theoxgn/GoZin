const express = require('express');
const router = express.Router();
const quotaController = require('../controllers/quota.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Route untuk mendapatkan sisa kuota perizinan user
router.get('/', verifyToken, quotaController.getRemainingQuota);

module.exports = router;