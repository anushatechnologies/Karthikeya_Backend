const router = require('express').Router();
const ctrl   = require('../controllers/upload.controller');
const auth   = require('../middleware/auth');
const upload = require('../middleware/upload');

// Single file — images, videos, PDFs
// Field name: "file"
router.post('/', auth, upload.single('file'), ctrl.uploadFile);

// Multiple files (max 10) — same field name "files"
router.post('/multiple', auth, upload.array('files', 10), ctrl.uploadMultiple);

module.exports = router;
