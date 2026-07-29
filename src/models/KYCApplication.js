const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const KYCApplication = sequelize.define('KYCApplication', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  sellerId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    field: 'seller_id',
  },
  kycDocUrl: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'kyc_doc_url',
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  reason: {
    type: DataTypes.TEXT,
  },
  reviewedBy: {
    type: DataTypes.UUID,
    field: 'reviewed_by',
  },
  reviewedAt: {
    type: DataTypes.DATE,
    field: 'reviewed_at',
  },
}, {
  tableName: 'kyc_applications',
});

module.exports = KYCApplication;
