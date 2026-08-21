const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const RFQ = sequelize.define('RFQ', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  rfqNumber: {
    type: DataTypes.STRING(40),
    unique: true,
    field: 'rfq_number',
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
  categoryId: {
    type: DataTypes.UUID,
    field: 'category_id',
  },
  categoryName: {
    type: DataTypes.STRING(100),
    field: 'category_name',
  },
  quantity: {
    type: DataTypes.STRING(60),
  },
  unit: {
    type: DataTypes.STRING(30),
    defaultValue: 'Piece',
  },
  budget: {
    type: DataTypes.DECIMAL(14, 2),
  },
  targetPrice: {
    type: DataTypes.STRING(60),
    field: 'target_price',
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
  },
  deadline: {
    type: DataTypes.DATE,
  },
  specifications: {
    type: DataTypes.TEXT,
  },
  attachments: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  status: {
    type: DataTypes.ENUM('open', 'assigned', 'quoted', 'closed', 'expired', 'cancelled'),
    defaultValue: 'open',
  },
}, {
  tableName: 'rfqs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = RFQ;
