const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  icon: {
    type: DataTypes.STRING(80),
  },
  slug: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
  },
  productCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'product_count',
  },
}, {
  tableName: 'categories',
});

module.exports = Category;
