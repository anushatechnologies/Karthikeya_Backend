const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  fullName: {
    type: DataTypes.STRING(120),
    allowNull: false,
    field: 'full_name',
  },
  email: {
    type: DataTypes.STRING(120),
    unique: true,
    allowNull: true,
    validate: { isEmail: true },
  },
  phone: {
    type: DataTypes.STRING(15),
    unique: true,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM(
      'super_admin', 'platform_admin', 'support_admin', 'finance_admin',
      'moderator', 'operations_admin', 'marketing_admin', 'readonly_admin',
      'buyer', 'seller', 'admin'
    ),
    defaultValue: 'buyer',
  },
  permissions: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  companyName: {
    type: DataTypes.STRING(120),
    field: 'company_name',
  },
  storeName: {
    type: DataTypes.STRING(120),
    field: 'store_name',
  },
  gstNumber: {
    type: DataTypes.STRING(20),
    field: 'gst_number',
  },
  panNumber: {
    type: DataTypes.STRING(20),
    field: 'pan_number',
  },
  businessType: {
    type: DataTypes.STRING(60),
    field: 'business_type',
  },
  address: {
    type: DataTypes.TEXT,
  },
  avatar: {
    type: DataTypes.TEXT,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_verified',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
  kycStatus: {
    type: DataTypes.ENUM('not_submitted', 'pending', 'approved', 'rejected', 'expired'),
    defaultValue: 'not_submitted',
    field: 'kyc_status',
  },
  riskScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'risk_score',
  },
  totalOrders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_orders',
  },
  totalSpent: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
    field: 'total_spent',
  },
  totalProducts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_products',
  },
  totalRevenue: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
    field: 'total_revenue',
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
  },
  subscription: {
    type: DataTypes.ENUM('free', 'basic', 'premium', 'enterprise'),
    defaultValue: 'free',
  },
  freeLeadsUsed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'free_leads_used',
  },
  paidLeadsBalance: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'paid_leads_balance',
  },
  walletBalance: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
    field: 'wallet_balance',
  },
  bankName: {
    type: DataTypes.STRING(100),
    field: 'bank_name',
  },
  accountNumber: {
    type: DataTypes.STRING(50),
    field: 'account_number',
  },
  ifscCode: {
    type: DataTypes.STRING(20),
    field: 'ifsc_code',
  },
  accountHolderName: {
    type: DataTypes.STRING(120),
    field: 'account_holder_name',
  },
  bankIsVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'bank_is_verified',
  },
  documents: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  lastLogin: {
    type: DataTypes.DATE,
    field: 'last_login',
  },
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = User;
