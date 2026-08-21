const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const OTP = sequelize.define('OTP', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  otp: {
    type: DataTypes.STRING(6),
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING(20),
    defaultValue: 'buyer',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at',
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'otps',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = OTP;
