const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  fullName: {
    type: DataTypes.STRING(120),
    allowNull: false,
    field: 'full_name',
  },
  email: {
    type: DataTypes.STRING(120),
    unique: true,
    allowNull: true,
    validate: { isEmail: true },
  },
  phone: {
    type: DataTypes.STRING(15),
    unique: true,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('buyer', 'seller', 'admin'),
    defaultValue: 'buyer',
  },
  companyName: {
    type: DataTypes.STRING(120),
    field: 'company_name',
  },
  gstNumber: {
    type: DataTypes.STRING(20),
    field: 'gst_number',
  },
  businessType: {
    type: DataTypes.STRING(60),
    field: 'business_type',
  },
  address: {
    type: DataTypes.TEXT,
  },
  avatar: {
    type: DataTypes.TEXT,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_verified',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
}, {
  tableName: 'users',
});

module.exports = User;
