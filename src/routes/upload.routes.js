const router = require('express').Router();
const ctrl   = require('../controllers/upload.controller');
const upload = require('../middleware/upload');

// Optional auth helper: decodes JWT if present, doesn't block if absent
const optionalAuth = (req, res, next) => {
  const jwt = require('jsonwebtoken');
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // ignore invalid token for uploads (e.g., signup flow)
    }
  }
  next();
};

// Single file — images, videos, PDFs (Used in signup for KYC/PAN as well as dashboard)
// Field name: "file"
router.post('/', optionalAuth, upload.single('file'), ctrl.uploadFile);

// Multiple files (max 10) — same field name "files"
router.post('/multiple', optionalAuth, upload.array('files', 10), ctrl.uploadMultiple);

module.exports = router;

