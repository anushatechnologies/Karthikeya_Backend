const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const RFQ = sequelize.define('RFQ', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  buyerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'buyer_id',
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING(100),
  },
  quantity: {
    type: DataTypes.STRING(60),
  },
  targetPrice: {
    type: DataTypes.STRING(60),
    field: 'target_price',
  },
  specifications: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM('open', 'closed'),
    defaultValue: 'open',
  },
}, {
  tableName: 'rfqs',
});

module.exports = RFQ;
