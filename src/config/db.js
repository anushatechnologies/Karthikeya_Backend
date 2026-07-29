const { Sequelize } = require('sequelize');

// Aiven Cloud (and other managed DBs) require SSL
const useSSL = process.env.DB_SSL === 'true';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'tradehub_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      underscored: true,      // snake_case columns
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    ...(useSSL && {
      dialectOptions: {
        ssl: {
          rejectUnauthorized: true,   // Aiven uses valid CA-signed certs
        },
      },
    }),
  }
);

async function connectDB() {
  await sequelize.authenticate();
  console.log('✅  MySQL connected successfully');

  // Load all models & sync
  require('../models/index');
  await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
  console.log('✅  Database models synchronized');
}

module.exports = { sequelize, connectDB };
