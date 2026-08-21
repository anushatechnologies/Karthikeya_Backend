require('dotenv').config({ path: '.env.production' });
const fs = require('fs');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function initDB() {
  console.log('Connecting to database...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
    multipleStatements: true,
  });

  console.log('Connected! Reading schema.sql...');
  const schema = fs.readFileSync('database/schema.sql', 'utf8');

  console.log('Executing schema...');
  await connection.query(schema);

  console.log('Seeding default admin & platform initializers...');
  const adminHash = await bcrypt.hash('admin123', 10);
  const adminId = 'a1b2c3d4-e5f6-7890-abcd-111122223333';

  // Seed default super admin
  await connection.query(`
    INSERT IGNORE INTO users (id, full_name, email, password, role, is_verified, is_active)
    VALUES ('${adminId}', 'KFPL Super Admin', 'admin@kfpl.com', '${adminHash}', 'super_admin', 1, 1);
  `);

  // Seed lead packages
  await connection.query(`
    INSERT IGNORE INTO lead_packages (id, name, lead_count, price, bonus_leads, validity_days, is_active, is_popular) VALUES
    (UUID(), 'Starter Pack', 50, 2500.00, 5, 60, 1, 0),
    (UUID(), 'Growth Pack', 150, 6500.00, 25, 90, 1, 1),
    (UUID(), 'Enterprise Power Pack', 500, 18000.00, 100, 180, 1, 0);
  `);

  // Seed default lead settings
  await connection.query(`
    INSERT IGNORE INTO lead_settings (id, free_lead_limit, default_price_per_lead, max_suppliers_per_lead, auto_assign_hot_leads)
    VALUES ('lead-set-01', 10, 150.00, 5, 1);
  `);

  // Seed platform settings
  await connection.query(`
    INSERT IGNORE INTO platform_settings (id, platform_name, support_email, currency, timezone, commission_rate, gst_tax_slab, maintenance_mode, auto_approve_suppliers)
    VALUES ('plat-set-01', 'KFPL B2B Marketplace', 'support@kfpl.com', 'INR', 'Asia/Kolkata', 5.00, 18.00, 0, 0);
  `);

  // Seed brands
  await connection.query(`
    INSERT IGNORE INTO brands (id, name, slug, status, product_count) VALUES
    (UUID(), 'Tata Steel', 'tata-steel', 'active', 24),
    (UUID(), 'Bosch Tools', 'bosch-tools', 'active', 18),
    (UUID(), 'Havells', 'havells', 'active', 15),
    (UUID(), 'Supreme Plastics', 'supreme-plastics', 'active', 12),
    (UUID(), 'Asian Paints', 'asian-paints', 'active', 10),
    (UUID(), 'Kirloskar Brothers', 'kirloskar-brothers', 'active', 8),
    (UUID(), 'Finolex Cables', 'finolex-cables', 'active', 7);
  `);

  console.log('Database initialized successfully with default KFPL Admin data!');
  await connection.end();
}

initDB().catch(console.error);
