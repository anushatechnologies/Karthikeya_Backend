require('dotenv').config();
const http = require('http');
const { app, initSocket } = require('./src/app');
const { connectDB }       = require('./src/config/db');

const PORT = process.env.PORT || 8080;

// ── Vercel serverless handler ───────────────────────────────────────
// Export the Express app directly. Vercel automatically wraps it.
// (DB connection is handled lazily inside app.js middleware on Vercel)
module.exports = app;

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
