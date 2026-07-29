const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const path         = require('path');

const errorHandler  = require('./middleware/errorHandler');
const { initChatSocket } = require('./socket/chat.socket');

// ── Routes ────────────────────────────────────────────────────────
const authRoutes     = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes  = require('./routes/product.routes');
const supplierRoutes = require('./routes/supplier.routes');
const sellerRoutes   = require('./routes/seller.routes');
const inquiryRoutes  = require('./routes/inquiry.routes');
const rfqRoutes      = require('./routes/rfq.routes');
const orderRoutes    = require('./routes/order.routes');
const chatRoutes     = require('./routes/chat.routes');
const uploadRoutes   = require('./routes/upload.routes');
const adminRoutes    = require('./routes/admin.routes');

const app = express();

// ── Security & logging ────────────────────────────────────────────
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── CORS ──────────────────────────────────────────────────────────
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:19006', 'http://localhost:8081'];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ── Body parsing ──────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Static file serving (uploads) ────────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads')));

// ── Health check ─────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── API Routes ────────────────────────────────────────────────────
const BASE = '/api/v1';

app.use(`${BASE}/auth`,        authRoutes);
app.use(`${BASE}/categories`,  categoryRoutes);
app.use(`${BASE}/products`,    productRoutes);
app.use(`${BASE}/suppliers`,   supplierRoutes);
app.use(`${BASE}/seller`,      sellerRoutes);
app.use(`${BASE}/inquiries`,   inquiryRoutes);
app.use(`${BASE}/rfq`,         rfqRoutes);
app.use(`${BASE}/orders`,      orderRoutes);
app.use(`${BASE}/chats`,       chatRoutes);
app.use(`${BASE}/upload`,      uploadRoutes);
app.use(`${BASE}/admin`,       adminRoutes);

// ── 404 handler ───────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found', details: [] } });
});

// ── Global error handler ──────────────────────────────────────────
app.use(errorHandler);

module.exports = { app, initSocket: initChatSocket };
