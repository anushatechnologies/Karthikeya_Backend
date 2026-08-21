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
  gstNumber: {
    type: DataTypes.STRING(20),
    field: 'gst_number',
  },
  panNumber: {
    type: DataTypes.STRING(20),
    field: 'pan_number',
  },
  kycDocUrl: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'kyc_doc_url',
  },
  documents: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  ocrData: {
    type: DataTypes.JSON,
    defaultValue: {},
    field: 'ocr_data',
  },
  matchConfidence: {
    type: DataTypes.INTEGER,
    defaultValue: 95,
    field: 'match_confidence',
  },
  status: {
    type: DataTypes.ENUM('not_submitted', 'pending', 'approved', 'rejected', 'expired'),
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
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = KYCApplication;
