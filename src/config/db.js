const { Sequelize } = require('sequelize');
const path = require('path');

const dbPath = path.join(__dirname, '../../database/tradehub.sqlite');

const isProdMySQL = Boolean(process.env.DB_HOST || process.env.VERCEL === '1');

const sequelize = isProdMySQL
  ? new Sequelize(
      process.env.DB_NAME || 'defaultdb',
      process.env.DB_USER || 'avnadmin',
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '13222'),
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
          ssl: { rejectUnauthorized: false },
          connectTimeout: 30000,   // 30s timeout for Aiven cold connects
        },
        pool: {
          max:     5,              // serverless: keep pool small
          min:     0,
          acquire: 30000,          // wait up to 30s for a connection
          idle:    10000,
          evict:   15000,          // clean up idle connections faster
        },
        retry: {
          max: 3,                  // retry failed queries up to 3 times
        },
        define: {
          underscored: true,
          timestamps:  true,
          createdAt:   'created_at',
          updatedAt:   'updated_at',
        },
      }
    )
  : new Sequelize({
      dialect: 'sqlite',
      storage: dbPath,
      logging: false,
      define: {
        underscored: true,
        timestamps:  true,
        createdAt:   'created_at',
        updatedAt:   'updated_at',
      },
    });

module.exports = { sequelize, connectDB };

require('../models/index');

let connectionAttempts = 0;
const MAX_RETRIES = 3;

async function connectDB() {
  while (connectionAttempts < MAX_RETRIES) {
    try {
      connectionAttempts++;
      console.log(`💾 DB connection attempt ${connectionAttempts}/${MAX_RETRIES} → ${isProdMySQL ? 'MySQL (Aiven)' : 'SQLite'}...`);

      await sequelize.authenticate();
      console.log(`✅ Database authenticated successfully`);

      await sequelize.sync();
      console.log('✅ All database tables synchronized & active!');
      return; // success — exit the retry loop
    } catch (err) {
      console.error(`❌ DB connection attempt ${connectionAttempts} failed:`, err.message);
      if (connectionAttempts >= MAX_RETRIES) {
        console.error('❌ All DB connection attempts exhausted. Env check:', {
          DB_HOST: process.env.DB_HOST ? '✓ set' : '✗ MISSING',
          DB_PORT: process.env.DB_PORT ? '✓ set' : '✗ MISSING',
          DB_NAME: process.env.DB_NAME ? '✓ set' : '✗ MISSING',
          DB_USER: process.env.DB_USER ? '✓ set' : '✗ MISSING',
          DB_PASSWORD: process.env.DB_PASSWORD ? '✓ set' : '✗ MISSING',
          NODE_ENV: process.env.NODE_ENV || 'not set',
          VERCEL: process.env.VERCEL || 'not set',
        });
        throw err;
      }
      // wait 2 seconds before retry
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

