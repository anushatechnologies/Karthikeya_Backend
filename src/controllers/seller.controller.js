const { sequelize }                            = require('../config/db');
const { Product, ProductPricingTier, Category, User, Order, OrderItem } = require('../models/index');
const { sendSuccess, sendError }               = require('../utils/response');

// ── 4.1 POST /seller/products ───────────────────────────────────
exports.createProduct = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const {
      name, description, images, categoryId,
      price, priceType, minOrderQty, unit,
      specifications, tags, location, bulkPricingTiers,
    } = req.body;

    const category = await Category.findByPk(categoryId, { transaction: t });
    if (!category) {
      await t.rollback();
      return sendError(res, 404, 'NOT_FOUND', 'Category not found');
    }

    const product = await Product.create({
      name, description, images, categoryId,
      sellerId: req.user.id,
      price, priceType, minOrderQty, unit,
      specifications, tags, location,
    }, { transaction: t });

    if (bulkPricingTiers && bulkPricingTiers.length > 0) {
      const tiers = bulkPricingTiers.map(tier => ({
        ...tier, productId: product.id,
      }));
      await ProductPricingTier.bulkCreate(tiers, { transaction: t });
    }

    // Increment category product count
    await category.increment('productCount', { by: 1, transaction: t });

    await t.commit();
    return sendSuccess(res, 201, 'Product created', { id: product.id });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// ── 4.2 PUT /seller/products/:id ────────────────────────────────
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, sellerId: req.user.id },
    });
    if (!product) return sendError(res, 404, 'NOT_FOUND', 'Product not found');

    const { bulkPricingTiers, ...fields } = req.body;

    await product.update(fields);

    if (bulkPricingTiers) {
      await ProductPricingTier.destroy({ where: { productId: product.id } });
      if (bulkPricingTiers.length > 0) {
        await ProductPricingTier.bulkCreate(
          bulkPricingTiers.map(t => ({ ...t, productId: product.id }))
        );
      }
    }

    return sendSuccess(res, 200, 'Product updated', { id: product.id });
  } catch (err) {
    next(err);
  }
};

// ── 4.3 DELETE /seller/products/:id ─────────────────────────────
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, sellerId: req.user.id },
    });
    if (!product) return sendError(res, 404, 'NOT_FOUND', 'Product not found');

    await product.update({ isActive: false });
    return sendSuccess(res, 200, 'Product deactivated');
  } catch (err) {
    next(err);
  }
};

// ── 6.4 PUT /seller/orders/:id/status ───────────────────────────
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const VALID = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!VALID.includes(status)) {
      return sendError(res, 422, 'INVALID_STATUS', `Status must be one of: ${VALID.join(', ')}`);
    }

    // Verify this seller has items in this order
    const item = await OrderItem.findOne({
      where: { orderId: req.params.id, sellerId: req.user.id },
    });
    if (!item) return sendError(res, 404, 'NOT_FOUND', 'Order not found');

    await Order.update({ status }, { where: { id: req.params.id } });
    return sendSuccess(res, 200, 'Order status updated', { status });
  } catch (err) {
    next(err);
  }
};
