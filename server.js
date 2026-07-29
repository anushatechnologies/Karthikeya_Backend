require('dotenv').config();
const http = require('http');
const { app, initSocket } = require('./src/app');
const { connectDB }       = require('./src/config/db');

const PORT = process.env.PORT || 8080;

// ── Vercel serverless export ────────────────────────────────────────
// When running on Vercel, it imports this module and calls the handler.
// We still connect to DB on first invocation (connection is cached).
let dbConnected = false;

async function ensureDB() {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
}

// Wrap app to ensure DB is ready before handling requests
const handler = async (req, res) => {
  await ensureDB();
  return app(req, res);
};

// Export for Vercel
module.exports = handler;

// ── Local dev server ────────────────────────────────────────────────
// Only start the HTTP server when NOT running inside Vercel
if (process.env.VERCEL !== '1') {
  (async () => {
    try {
      await connectDB();
      const server = http.createServer(app);
      initSocket(server);
      server.listen(PORT, () => {
        console.log(`\n🚀  TradeHub B2B API running on http://localhost:${PORT}/api/v1`);
        console.log(`📡  WebSocket gateway on ws://localhost:${PORT}/ws`);
        console.log(`📁  Uploads → Cloudinary (yeju4wof)\n`);
      });
    } catch (err) {
      console.error('❌  Failed to start server:', err.message);
      process.exit(1);
    }
  })();
}
