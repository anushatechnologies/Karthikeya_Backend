const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LeadSettings = sequelize.define('LeadSettings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  freeLeadLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    field: 'free_lead_limit',
  },
  defaultPricePerLead: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 150.00,
    field: 'default_price_per_lead',
  },
  maxSuppliersPerLead: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    field: 'max_suppliers_per_lead',
  },
  autoAssignHotLeads: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'auto_assign_hot_leads',
  },
}, {
  tableName: 'lead_settings',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at',
});

module.exports = LeadSettings;
