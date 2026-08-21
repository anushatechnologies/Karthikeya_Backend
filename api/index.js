// ── Load environment variables BEFORE anything else ─────────────────
// Vercel does NOT auto-load .env files; we must call dotenv explicitly.
// If vars are set in Vercel Dashboard they take precedence (dotenv won't overwrite).
require('dotenv').config();

let app;
try {
  app = require('../src/app').app;
} catch (err) {
  // If a top-level require fails, catch it and return the error as JSON
  // instead of crashing the Vercel Serverless Function completely.
  console.error("Vercel Startup Crash:", err);
  app = (req, res) => {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      success: false,
      error: 'CRASH_ON_STARTUP', 
      details: err.message,
      envCheck: {
        DB_HOST:  !!process.env.DB_HOST,
        DB_USER:  !!process.env.DB_USER,
        DB_NAME:  !!process.env.DB_NAME,
        JWT_SECRET: !!process.env.JWT_SECRET,
      },
    }));
  };
}
module.exports = app;
