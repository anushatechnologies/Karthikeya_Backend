const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LeadPackage = sequelize.define('LeadPackage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  leadCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'lead_count',
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  bonusLeads: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'bonus_leads',
  },
  validityDays: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    field: 'validity_days',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
  isPopular: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_popular',
  },
}, {
  tableName: 'lead_packages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = LeadPackage;
