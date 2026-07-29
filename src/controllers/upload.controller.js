const { sendSuccess, sendError } = require('../utils/response');

// ── 8.1 POST /upload ────────────────────────────────────────────────
// Cloudinary via multer-storage-cloudinary attaches full metadata to req.file
exports.uploadFile = (req, res) => {
  if (!req.file) return sendError(res, 400, 'NO_FILE', 'No file uploaded');

  // multer-storage-cloudinary exposes these fields on req.file
  const {
    path: url,           // Cloudinary secure HTTPS URL
    filename,            // public_id (folder/filename)
    mimetype,
    size,
  } = req.file;

  // Determine resource type from mimetype
  const resourceType = mimetype.startsWith('video/')
    ? 'video'
    : mimetype === 'application/pdf'
      ? 'document'
      : 'image';

  return sendSuccess(res, 200, 'File uploaded successfully', {
    url,
    publicId:     filename,
    resourceType,
    mimetype,
    sizeBytes:    size,
  });
};

// ── POST /upload/multiple (upload up to 10 files at once) ──────────
exports.uploadMultiple = (req, res) => {
  if (!req.files || req.files.length === 0) {
    return sendError(res, 400, 'NO_FILES', 'No files uploaded');
  }

  const files = req.files.map(f => ({
    url:          f.path,
    publicId:     f.filename,
    resourceType: f.mimetype.startsWith('video/')
      ? 'video'
      : f.mimetype === 'application/pdf' ? 'document' : 'image',
    mimetype:     f.mimetype,
    sizeBytes:    f.size,
  }));

  return sendSuccess(res, 200, `${files.length} file(s) uploaded successfully`, { files });
};
