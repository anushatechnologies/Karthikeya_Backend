const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SupportTicket = sequelize.define('SupportTicket', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  ticketNumber: {
    type: DataTypes.STRING(40),
    allowNull: false,
    unique: true,
    field: 'ticket_number',
  },
  subject: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
    defaultValue: 'open',
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
  },
  category: {
    type: DataTypes.STRING(60),
    defaultValue: 'General',
  },
  createdBy: {
    type: DataTypes.STRING(120),
    allowNull: false,
    field: 'created_by',
  },
  assignedTo: {
    type: DataTypes.STRING(120),
    field: 'assigned_to',
  },
}, {
  tableName: 'support_tickets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = SupportTicket;
