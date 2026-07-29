// Load all models and define associations
const User               = require('./User');
const Category           = require('./Category');
const Product            = require('./Product');
const ProductPricingTier = require('./ProductPricingTier');
const Inquiry            = require('./Inquiry');
const RFQ                = require('./RFQ');
const RFQQuote           = require('./RFQQuote');
const Order              = require('./Order');
const OrderItem          = require('./OrderItem');
const ChatThread         = require('./ChatThread');
const ChatMessage        = require('./ChatMessage');
const KYCApplication     = require('./KYCApplication');

// ── Product associations ─────────────────────────────────────────
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Product,   { foreignKey: 'category_id', as: 'products' });

Product.belongsTo(User,   { foreignKey: 'seller_id', as: 'seller' });
User.hasMany(Product,     { foreignKey: 'seller_id', as: 'listings' });

Product.hasMany(ProductPricingTier, { foreignKey: 'product_id', as: 'bulkPricingTiers', onDelete: 'CASCADE' });
ProductPricingTier.belongsTo(Product, { foreignKey: 'product_id' });

// ── Inquiry associations ─────────────────────────────────────────
Inquiry.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Inquiry.belongsTo(User,    { foreignKey: 'buyer_id',   as: 'buyer' });
Inquiry.belongsTo(User,    { foreignKey: 'seller_id',  as: 'seller' });

// ── RFQ associations ─────────────────────────────────────────────
RFQ.belongsTo(User,      { foreignKey: 'buyer_id', as: 'buyer' });
RFQ.hasMany(RFQQuote,    { foreignKey: 'rfq_id',   as: 'quotes', onDelete: 'CASCADE' });
RFQQuote.belongsTo(RFQ,  { foreignKey: 'rfq_id' });
RFQQuote.belongsTo(User, { foreignKey: 'seller_id', as: 'seller' });

// ── Order associations ───────────────────────────────────────────
Order.belongsTo(User,         { foreignKey: 'buyer_id', as: 'buyer' });
Order.hasMany(OrderItem,      { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order,    { foreignKey: 'order_id' });
OrderItem.belongsTo(Product,  { foreignKey: 'product_id', as: 'product' });
OrderItem.belongsTo(User,     { foreignKey: 'seller_id',  as: 'seller' });

// ── Chat associations ────────────────────────────────────────────
ChatThread.hasMany(ChatMessage, { foreignKey: 'thread_id', as: 'messages', onDelete: 'CASCADE' });
ChatMessage.belongsTo(ChatThread, { foreignKey: 'thread_id' });
ChatMessage.belongsTo(User, { foreignKey: 'sender_id',   as: 'sender' });
ChatMessage.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

// ── KYC associations ─────────────────────────────────────────────
KYCApplication.belongsTo(User, { foreignKey: 'seller_id',   as: 'seller' });
KYCApplication.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });

module.exports = {
  User,
  Category,
  Product,
  ProductPricingTier,
  Inquiry,
  RFQ,
  RFQQuote,
  Order,
  OrderItem,
  ChatThread,
  ChatMessage,
  KYCApplication,
};
