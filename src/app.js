const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const path         = require('path');

const errorHandler  = require('./middleware/errorHandler');
const { initChatSocket } = require('./socket/chat.socket');
const { connectDB } = require('./config/db');

let dbReady = false;

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
app.use(helmet({ crossOriginResourcePolicy: false, contentSecurityPolicy: false }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── CORS (Universal Web & Mobile Support) ────────────────────────
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// ── Vercel DB Connection Middleware ───────────────────────────────
// In serverless, ensureDB runs on the first request of a cold start
app.use(async (req, res, next) => {
  if (!dbReady) {
    try {
      await connectDB();
      dbReady = true;
    } catch (err) {
      console.error('⚠️ Lazy DB connection error:', err.message);
      // Don't block health check even if DB is down
      if (req.path === '/health') return next();
      return res.status(503).json({
        success: false,
        error: {
          code: 'DB_CONNECTION_FAILED',
          message: 'Database is temporarily unavailable. Please try again shortly.',
          debug: process.env.NODE_ENV !== 'production' ? err.message : undefined,
        }
      });
    }
  }
  next();
});

// ── Body parsing ──────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Static file serving (uploads) ────────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads')));

// ── Health & Status check ─────────────────────────────────────────
app.get('/', (_req, res) => res.json({ success: true, message: 'KFPCL B2B API Server is active', status: 'online' }));
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/api/v1', (_req, res) => res.json({ success: true, message: 'KFPCL B2B API v1 is active and healthy', status: 'online' }));

// ── API Routes (Universal prefix support for Vercel Serverless) ────
const mountRoutes = (prefix) => {
  app.use(`${prefix}/auth`,        authRoutes);
  app.use(`${prefix}/categories`,  categoryRoutes);
  app.use(`${prefix}/products`,    productRoutes);
  app.use(`${prefix}/suppliers`,   supplierRoutes);
  app.use(`${prefix}/seller`,      sellerRoutes);
  app.use(`${prefix}/inquiries`,   inquiryRoutes);
  app.use(`${prefix}/rfq`,         rfqRoutes);
  app.use(`${prefix}/rfqs`,        rfqRoutes);
  app.use(`${prefix}/orders`,      orderRoutes);
  app.use(`${prefix}/chats`,       chatRoutes);
  app.use(`${prefix}/upload`,      uploadRoutes);
  app.use(`${prefix}/admin`,       adminRoutes);
};

mountRoutes('/api/v1');
mountRoutes('/v1');
mountRoutes('/api');
mountRoutes('');

// ── 404 handler ───────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found', details: [] } });
});

// ── Global error handler ──────────────────────────────────────────
app.use(errorHandler);

module.exports = { app, initSocket: initChatSocket };
