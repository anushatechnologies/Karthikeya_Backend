// Load all models and define associations
const User                  = require('./User');
const Category              = require('./Category');
const Brand                 = require('./Brand');
const Product               = require('./Product');
const ProductPricingTier    = require('./ProductPricingTier');
const Inquiry               = require('./Inquiry');
const RFQ                   = require('./RFQ');
const RFQQuote              = require('./RFQQuote');
const Order                 = require('./Order');
const OrderItem             = require('./OrderItem');
const Transaction           = require('./Transaction');
const Lead                  = require('./Lead');
const LeadPackage           = require('./LeadPackage');
const LeadSettings          = require('./LeadSettings');
const ChatThread            = require('./ChatThread');
const ChatMessage           = require('./ChatMessage');
const FlaggedMessage        = require('./FlaggedMessage');
const KYCApplication        = require('./KYCApplication');
const NotificationCampaign   = require('./NotificationCampaign');
const SupportTicket         = require('./SupportTicket');
const CMSBanner             = require('./CMSBanner');
const CMSFaq                = require('./CMSFaq');
const ActivityLog           = require('./ActivityLog');
const PlatformSettings      = require('./PlatformSettings');
const Address               = require('./Address');
const OTP                   = require('./OTP');

// ── User Associations ─────────────────────────────────────────────
User.hasMany(Address, { foreignKey: 'user_id', as: 'addresses', onDelete: 'CASCADE' });
Address.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ── Category & Brand Associations ────────────────────────────────
Category.hasMany(Category, { foreignKey: 'parent_id', as: 'children' });
Category.belongsTo(Category, { foreignKey: 'parent_id', as: 'parent' });

Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Product,   { foreignKey: 'category_id', as: 'products' });

Product.belongsTo(Brand,    { foreignKey: 'brand_id', as: 'brand' });
Brand.hasMany(Product,      { foreignKey: 'brand_id', as: 'products' });

Product.belongsTo(User,     { foreignKey: 'seller_id', as: 'seller' });
User.hasMany(Product,       { foreignKey: 'seller_id', as: 'listings' });

Product.hasMany(ProductPricingTier, { foreignKey: 'product_id', as: 'bulkPricingTiers', onDelete: 'CASCADE' });
ProductPricingTier.belongsTo(Product, { foreignKey: 'product_id' });

// ── Lead Associations ────────────────────────────────────────────
Lead.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// ── Inquiry Associations ──────────────────────────────────────────
Inquiry.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Inquiry.belongsTo(User,    { foreignKey: 'buyer_id',   as: 'buyer' });
Inquiry.belongsTo(User,    { foreignKey: 'seller_id',  as: 'seller' });

// ── RFQ Associations ──────────────────────────────────────────────
RFQ.belongsTo(User,      { foreignKey: 'buyer_id', as: 'buyer' });
RFQ.belongsTo(Category,  { foreignKey: 'category_id', as: 'category' });
RFQ.hasMany(RFQQuote,    { foreignKey: 'rfq_id',   as: 'quotes', onDelete: 'CASCADE' });
RFQQuote.belongsTo(RFQ,  { foreignKey: 'rfq_id' });
RFQQuote.belongsTo(User, { foreignKey: 'seller_id', as: 'seller' });

// ── Order Associations ────────────────────────────────────────────
Order.belongsTo(User,         { foreignKey: 'buyer_id', as: 'buyer' });
Order.belongsTo(User,         { foreignKey: 'supplier_id', as: 'supplier' });
Order.hasMany(OrderItem,      { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order,    { foreignKey: 'order_id', as: 'order' });
OrderItem.belongsTo(Product,  { foreignKey: 'product_id', as: 'product' });
OrderItem.belongsTo(User,     { foreignKey: 'seller_id',  as: 'seller' });

// ── Transaction Associations ─────────────────────────────────────
Transaction.belongsTo(Order,  { foreignKey: 'order_id', as: 'order' });
Transaction.belongsTo(User,   { foreignKey: 'buyer_id', as: 'buyer' });
Transaction.belongsTo(User,   { foreignKey: 'supplier_id', as: 'supplier' });

// ── Chat Associations ─────────────────────────────────────────────
ChatThread.hasMany(ChatMessage, { foreignKey: 'thread_id', as: 'messages', onDelete: 'CASCADE' });
ChatMessage.belongsTo(ChatThread, { foreignKey: 'thread_id' });
ChatMessage.belongsTo(User, { foreignKey: 'sender_id',   as: 'sender' });
ChatMessage.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

// ── KYC Associations ──────────────────────────────────────────────
KYCApplication.belongsTo(User, { foreignKey: 'seller_id',   as: 'seller' });
KYCApplication.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });

module.exports = {
  User,
  Address,
  Category,
  Brand,
  Product,
  ProductPricingTier,
  Lead,
  LeadPackage,
  LeadSettings,
  Inquiry,
  RFQ,
  RFQQuote,
  Order,
  OrderItem,
  Transaction,
  ChatThread,
  ChatMessage,
  FlaggedMessage,
  KYCApplication,
  NotificationCampaign,
  SupportTicket,
  CMSBanner,
  CMSFaq,
  ActivityLog,
  PlatformSettings,
  OTP,
};
