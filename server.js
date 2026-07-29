require('dotenv').config();
const http = require('http');
const { app, initSocket } = require('./src/app');
const { connectDB }       = require('./src/config/db');

const PORT = process.env.PORT || 8080;

// ── DB connection (cached across serverless invocations) ────────────
let dbReady = false;

async function ensureDB() {
  if (dbReady) return;
  try {
    await connectDB();
    dbReady = true;
  } catch (err) {
    // Log but don't crash — individual routes will return 503 if DB unavailable
    console.error('⚠️  DB connection error:', err.message);
  }
}

// ── Vercel serverless handler ───────────────────────────────────────
// Vercel imports this file and calls module.exports as the HTTP handler
const handler = async (req, res) => {
  await ensureDB();
  return app(req, res);
};

module.exports = handler;

// ── Local development server ────────────────────────────────────────
// Only start HTTP listener when NOT on Vercel
if (process.env.VERCEL !== '1') {
  (async () => {
    try {
      await connectDB();
      const server = http.createServer(app);
      initSocket(server);
      server.listen(PORT, () => {
        console.log(`\n🚀  TradeHub B2B API → http://localhost:${PORT}/api/v1`);
        console.log(`📡  WebSocket        → ws://localhost:${PORT}/ws`);
        console.log(`☁️   Cloudinary       → yeju4wof\n`);
      });
    } catch (err) {
      console.error('❌  Failed to start server:', err.message);
      process.exit(1);
    }
  })();
}
