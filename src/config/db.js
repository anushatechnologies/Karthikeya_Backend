const { Sequelize } = require('sequelize');

// Aiven Cloud (and other managed DBs) require SSL
const useSSL = process.env.DB_SSL === 'true';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'tradehub_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host:    process.env.DB_HOST || 'localhost',
    port:    parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max:     5,    // reduced for serverless
      min:     0,
      acquire: 3000,  // 3s (fail fast on Vercel to prevent 504/500 errors)
      idle:    5000,
    },
    define: {
      underscored: true,
      timestamps:  true,
      createdAt:   'created_at',
      updatedAt:   'updated_at',
    },
    ...(useSSL && {
      dialectOptions: {
        ssl: {
          rejectUnauthorized: true,
        },
      },
    }),
  }
);

// Export BEFORE requiring models to prevent circular dependency issues
module.exports = { sequelize, connectDB };

// Load all models (registers them with sequelize)
require('../models/index');

async function connectDB() {
  // Authenticate (test the connection)
  await sequelize.authenticate();
  console.log('✅  MySQL connected successfully');

  // ── IMPORTANT ──────────────────────────────────────────────────
  // In PRODUCTION (Vercel): NEVER run sync() — use schema.sql instead.
  // sync() can take 30-60s and will cause Vercel 502 timeout.
  // In DEVELOPMENT: sync({ alter: true }) is fine for local work.
  // ───────────────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    await sequelize.sync({ alter: true });
    console.log('✅  Database models synchronized (dev only)');
  } else {
    console.log('✅  Production mode — skipping sync (using schema.sql)');
  }
}


