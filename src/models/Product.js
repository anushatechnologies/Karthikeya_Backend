const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'category_id',
  },
  sellerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'seller_id',
  },
  price: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
  },
  priceType: {
    type: DataTypes.ENUM('fixed', 'negotiable', 'rfq'),
    defaultValue: 'fixed',
    field: 'price_type',
  },
  currency: {
    type: DataTypes.STRING(5),
    defaultValue: 'INR',
  },
  minOrderQty: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'min_order_qty',
  },
  unit: {
    type: DataTypes.STRING(30),
    defaultValue: 'Piece',
  },
  specifications: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  location: {
    type: DataTypes.STRING(120),
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'review_count',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
}, {
  tableName: 'products',
});

module.exports = Product;
