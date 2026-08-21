const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Address = sequelize.define('Address', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
  },
  label: {
    type: DataTypes.STRING(60),
    allowNull: false,
  },
  line1: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  line2: {
    type: DataTypes.STRING(255),
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  pincode: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING(60),
    defaultValue: 'India',
    allowNull: false,
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_default',
  },
}, {
  tableName: 'addresses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Address;
