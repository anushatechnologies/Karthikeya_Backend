const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const FlaggedMessage = sequelize.define('FlaggedMessage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  messageId: {
    type: DataTypes.UUID,
    field: 'message_id',
  },
  threadId: {
    type: DataTypes.UUID,
    field: 'thread_id',
  },
  senderId: {
    type: DataTypes.UUID,
    field: 'sender_id',
  },
  senderName: {
    type: DataTypes.STRING(120),
    allowNull: false,
    field: 'sender_name',
  },
  senderRole: {
    type: DataTypes.STRING(40),
    allowNull: false,
    field: 'sender_role',
  },
  recipientName: {
    type: DataTypes.STRING(120),
    allowNull: false,
    field: 'recipient_name',
  },
  messageContent: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'message_content',
  },
  flagReason: {
    type: DataTypes.ENUM('phone_number', 'email_address', 'external_link', 'abusive_language', 'off_platform_payment'),
    allowNull: false,
    field: 'flag_reason',
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium',
  },
  status: {
    type: DataTypes.ENUM('pending', 'resolved', 'banned'),
    defaultValue: 'pending',
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'flagged_messages',
  timestamps: false,
});

module.exports = FlaggedMessage;
