const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderNumber: {
    type: DataTypes.STRING(40),
    allowNull: false,
    unique: true,
    field: 'order_number',
  },
  buyerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'buyer_id',
  },
  supplierId: {
    type: DataTypes.UUID,
    field: 'supplier_id',
  },
  shippingAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'shipping_address',
  },
  paymentMethod: {
    type: DataTypes.STRING(40),
    defaultValue: 'bank',
    field: 'payment_method',
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'reversed'),
    defaultValue: 'pending',
    field: 'payment_status',
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
  discount: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
  },
  grandTotal: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
    field: 'grand_total',
  },
  status: {
    type: DataTypes.ENUM('placed', 'pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded'),
    defaultValue: 'pending',
  },
  courierName: {
    type: DataTypes.STRING(100),
    field: 'courier_name',
  },
  trackingNumber: {
    type: DataTypes.STRING(100),
    field: 'tracking_number',
  },
  timeline: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  deliveredAt: {
    type: DataTypes.DATE,
    field: 'delivered_at',
  },
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Order;
