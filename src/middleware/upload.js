const multer  = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path       = require('path');

// ── Allowed file types ─────────────────────────────────────────────
const IMAGE_TYPES = /jpeg|jpg|png|gif|webp/;
const VIDEO_TYPES = /mp4|mov|avi|mkv|webm/;
const DOC_TYPES   = /pdf/;

function getResourceType(mimetype, ext) {
  if (VIDEO_TYPES.test(ext) || mimetype.startsWith('video/')) return 'video';
  if (IMAGE_TYPES.test(ext) || mimetype.startsWith('image/')) return 'image';
  return 'raw'; // PDFs / docs
}

function getFolder(mimetype, ext) {
  const base = process.env.CLOUDINARY_FOLDER || 'tradehub';
  if (VIDEO_TYPES.test(ext) || mimetype.startsWith('video/')) return `${base}/videos`;
  if (DOC_TYPES.test(ext)   || mimetype === 'application/pdf') return `${base}/documents`;
  return `${base}/images`;
}

// ── Cloudinary storage engine ──────────────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    const ext          = path.extname(file.originalname).toLowerCase().replace('.', '');
    const resourceType = getResourceType(file.mimetype, ext);
    const folder       = getFolder(file.mimetype, ext);
    return {
      folder,
      resource_type: resourceType,
      // Sanitised filename + timestamp for uniqueness
      public_id: `${Date.now()}-${file.originalname
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/\.[^/.]+$/, '')}`,
      // Auto quality + format for images
      ...(resourceType === 'image' && {
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      }),
    };
  },
});

// ── File filter ────────────────────────────────────────────────────
const ALLOWED = new RegExp(
  `${IMAGE_TYPES.source}|${VIDEO_TYPES.source}|${DOC_TYPES.source}`
);

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  if (ALLOWED.test(ext)) return cb(null, true);
  cb(new Error(`File type .${ext} not allowed. Accepted: images, videos, PDF`));
};

// ── Multer instance ────────────────────────────────────────────────
const maxSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB || '50');

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSizeMB * 1024 * 1024 },
});

module.exports = upload;
