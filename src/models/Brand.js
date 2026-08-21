const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Brand = sequelize.define('Brand', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(120),
    unique: true,
    allowNull: false,
  },
  logo: {
    type: DataTypes.TEXT,
  },
  description: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending'),
    defaultValue: 'active',
  },
  productCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'product_count',
  },
}, {
  tableName: 'brands',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Brand;
