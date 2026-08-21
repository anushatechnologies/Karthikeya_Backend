const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PlatformSettings = sequelize.define('PlatformSettings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  platformName: {
    type: DataTypes.STRING(120),
    defaultValue: 'KFPL B2B Marketplace',
    field: 'platform_name',
  },
  supportEmail: {
    type: DataTypes.STRING(120),
    defaultValue: 'support@kfpl.com',
    field: 'support_email',
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'INR',
  },
  timezone: {
    type: DataTypes.STRING(50),
    defaultValue: 'Asia/Kolkata',
  },
  commissionRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 5.00,
    field: 'commission_rate',
  },
  gstTaxSlab: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 18.00,
    field: 'gst_tax_slab',
  },
  maintenanceMode: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'maintenance_mode',
  },
  autoApproveSuppliers: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'auto_approve_suppliers',
  },
  bluedartApiKey: {
    type: DataTypes.STRING(255),
    field: 'bluedart_api_key',
  },
  delhiveryApiKey: {
    type: DataTypes.STRING(255),
    field: 'delhivery_api_key',
  },
}, {
  tableName: 'platform_settings',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at',
});

module.exports = PlatformSettings;
