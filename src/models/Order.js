const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Order = sequelize.define('Order', {
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
  shippingAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'shipping_address',
  },
  paymentMethod: {
    type: DataTypes.ENUM('bank', 'lc', 'card'),
    defaultValue: 'bank',
    field: 'payment_method',
  },
  subtotal: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
  },
  tax: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
  },
  shippingCost: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
    field: 'shipping_cost',
  },
  grandTotal: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
    field: 'grand_total',
  },
  status: {
    type: DataTypes.ENUM('placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'placed',
  },
}, {
  tableName: 'orders',
});

module.exports = Order;
