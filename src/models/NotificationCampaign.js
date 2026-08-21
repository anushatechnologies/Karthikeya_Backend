const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const NotificationCampaign = sequelize.define('NotificationCampaign', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  channel: {
    type: DataTypes.ENUM('push', 'email', 'sms', 'in_app'),
    defaultValue: 'push',
  },
  targetAudience: {
    type: DataTypes.STRING(100),
    defaultValue: 'All Buyers',
    field: 'target_audience',
  },
  recipientCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'recipient_count',
  },
  status: {
    type: DataTypes.ENUM('draft', 'scheduled', 'sent', 'failed'),
    defaultValue: 'sent',
  },
}, {
  tableName: 'notification_campaigns',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = NotificationCampaign;
