const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  transactionId: {
    type: DataTypes.STRING(60),
    allowNull: false,
    unique: true,
    field: 'transaction_id',
  },
  orderId: {
    type: DataTypes.UUID,
    field: 'order_id',
  },
  orderNumber: {
    type: DataTypes.STRING(40),
    field: 'order_number',
  },
  buyerId: {
    type: DataTypes.UUID,
    field: 'buyer_id',
  },
  buyerName: {
    type: DataTypes.STRING(120),
    field: 'buyer_name',
  },
  supplierId: {
    type: DataTypes.UUID,
    field: 'supplier_id',
  },
  supplierName: {
    type: DataTypes.STRING(120),
    field: 'supplier_name',
  },
  amount: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
  },
  commission: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
  },
  netAmount: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
    field: 'net_amount',
  },
  type: {
    type: DataTypes.ENUM('payment', 'refund', 'settlement', 'commission'),
    defaultValue: 'payment',
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'reversed'),
    defaultValue: 'completed',
  },
  gateway: {
    type: DataTypes.STRING(60),
    defaultValue: 'Razorpay',
  },
  method: {
    type: DataTypes.STRING(60),
    defaultValue: 'UPI',
  },
}, {
  tableName: 'transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Transaction;
