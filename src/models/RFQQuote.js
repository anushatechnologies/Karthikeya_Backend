const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const RFQQuote = sequelize.define('RFQQuote', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  rfqId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'rfq_id',
  },
  sellerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'seller_id',
  },
  pricePerUnit: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    field: 'price_per_unit',
  },
  totalPrice: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    field: 'total_price',
  },
  deliveryDays: {
    type: DataTypes.INTEGER,
    field: 'delivery_days',
  },
  paymentTerms: {
    type: DataTypes.STRING(200),
    field: 'payment_terms',
  },
  warranty: {
    type: DataTypes.STRING(200),
  },
}, {
  tableName: 'rfq_quotes',
  updatedAt: false,
});

module.exports = RFQQuote;
