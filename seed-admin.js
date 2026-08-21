/**
 * seed-admin.js — Seeds a default admin user into the SQLite database.
 * Run: node seed-admin.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('./src/config/db');
const { User } = require('./src/models/index');

const ADMIN_ID    = 'a1b2c3d4-e5f6-7890-abcd-111122223333';
const ADMIN_EMAIL = 'admin@kfpl.com';
const ADMIN_PASS  = 'admin123';

async function seedAdmin() {
  try {
    // Connect and sync DB tables
    await sequelize.authenticate();
    console.log('💾 Database connected');

    await sequelize.sync();
    console.log('✅ All tables synchronized');

    // Check if admin already exists
    const existing = await User.findOne({ where: { email: ADMIN_EMAIL } });
    if (existing) {
      console.log(`ℹ️  Admin user already exists: ${existing.email} (role: ${existing.role})`);
      console.log('   Updating role to super_admin to ensure admin access...');
      existing.role = 'super_admin';
      existing.isVerified = true;
      existing.isActive = true;
      await existing.save();
      console.log('✅ Admin user updated successfully');
    } else {
      const hashedPassword = await bcrypt.hash(ADMIN_PASS, 10);
      await User.create({
        id:         ADMIN_ID,
        fullName:   'KFPL Super Admin',
        email:      ADMIN_EMAIL,
        phone:      '9999999999',
        password:   hashedPassword,
        role:       'super_admin',
        companyName: 'KFPL Admin',
        isVerified: true,
        isActive:   true,
      });
      console.log('✅ Admin user created successfully!');
    }

    console.log('\n📋 Admin Credentials:');
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASS}`);
    console.log(`   Role:     super_admin`);
    console.log(`   ID:       ${ADMIN_ID}`);

    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    console.error(err);
    process.exit(1);
  }
}

seedAdmin();
