const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ChatThread = sequelize.define('ChatThread', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  participantA: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'participant_a',
  },
  participantB: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'participant_b',
  },
  lastMessage: {
    type: DataTypes.TEXT,
    field: 'last_message',
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    field: 'last_message_at',
  },
}, {
  tableName: 'chat_threads',
  updatedAt: false,
});

module.exports = ChatThread;
