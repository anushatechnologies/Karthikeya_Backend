const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    field: 'user_id',
  },
  userName: {
    type: DataTypes.STRING(120),
    allowNull: false,
    field: 'user_name',
  },
  action: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  module: {
    type: DataTypes.STRING(60),
    allowNull: false,
  },
  details: {
    type: DataTypes.TEXT,
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    field: 'ip_address',
  },
  userAgent: {
    type: DataTypes.STRING(255),
    field: 'user_agent',
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'activity_logs',
  timestamps: false,
});

module.exports = ActivityLog;
