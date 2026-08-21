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
  slug: {
    type: DataTypes.STRING(200),
  },
  description: {
    type: DataTypes.TEXT,
  },
  shortDescription: {
    type: DataTypes.TEXT,
    field: 'short_description',
  },
  sku: {
    type: DataTypes.STRING(80),
    unique: true,
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'category_id',
  },
  brandId: {
    type: DataTypes.UUID,
    field: 'brand_id',
  },
  brandName: {
    type: DataTypes.STRING(120),
    field: 'brand_name',
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
  maxOrderQty: {
    type: DataTypes.INTEGER,
    field: 'max_order_qty',
  },
  unit: {
    type: DataTypes.STRING(30),
    defaultValue: 'Piece',
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  videos: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  inventory: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  specifications: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  variants: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  priceTiers: {
    type: DataTypes.JSON,
    defaultValue: [],
    field: 'price_tiers',
  },
  seo: {
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
  status: {
    type: DataTypes.ENUM('draft', 'pending', 'approved', 'rejected', 'active', 'inactive'),
    defaultValue: 'pending',
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_featured',
  },
  isTrending: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_trending',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Product;
