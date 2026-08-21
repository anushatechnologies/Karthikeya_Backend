const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CMSBanner = sequelize.define('CMSBanner', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  subtitle: {
    type: DataTypes.STRING(200),
  },
  imageUrl: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'image_url',
  },
  linkUrl: {
    type: DataTypes.TEXT,
    field: 'link_url',
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sort_order',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
}, {
  tableName: 'cms_banners',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = CMSBanner;
