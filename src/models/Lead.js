const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Lead = sequelize.define('Lead', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  leadNumber: {
    type: DataTypes.STRING(40),
    allowNull: false,
    unique: true,
    field: 'lead_number',
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  buyerName: {
    type: DataTypes.STRING(120),
    allowNull: false,
    field: 'buyer_name',
  },
  buyerCompany: {
    type: DataTypes.STRING(120),
    allowNull: false,
    field: 'buyer_company',
  },
  buyerPhone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'buyer_phone',
  },
  buyerEmail: {
    type: DataTypes.STRING(120),
    allowNull: false,
    field: 'buyer_email',
  },
  city: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'category_id',
  },
  categoryName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'category_name',
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  unit: {
    type: DataTypes.STRING(30),
    defaultValue: 'Piece',
  },
  estimatedValue: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
    field: 'estimated_value',
  },
  status: {
    type: DataTypes.ENUM('open', 'hot', 'claimed', 'closed'),
    defaultValue: 'open',
  },
  claimedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'claimed_count',
  },
  maxClaims: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    field: 'max_claims',
  },
  leadPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 150.00,
    field: 'lead_price',
  },
  isFreeEligible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_free_eligible',
  },
}, {
  tableName: 'leads',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Lead;
