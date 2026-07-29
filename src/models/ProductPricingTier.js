const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ProductPricingTier = sequelize.define('ProductPricingTier', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'product_id',
  },
  minQty: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'min_qty',
  },
  maxQty: {
    type: DataTypes.INTEGER,
    field: 'max_qty',
  },
  price: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
  },
}, {
  tableName: 'product_pricing_tiers',
  timestamps: false,
});

module.exports = ProductPricingTier;
