const { Op }                                  = require('sequelize');
const { sequelize }                            = require('../config/db');
const { Product, ProductPricingTier, Category, User, Order, OrderItem } = require('../models/index');
const { sendSuccess, sendError }               = require('../utils/response');

// ── 4.0 GET /seller/products ────────────────────────────────────
exports.getSellerProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      where: { sellerId: req.user.id, isActive: true },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: ProductPricingTier, as: 'bulkPricingTiers', attributes: ['minQty', 'maxQty', 'price'] },
      ],
      order: [['created_at', 'DESC']],
    });
    return sendSuccess(res, 200, 'OK', products);
  } catch (err) {
    next(err);
  }
};

// ── 4.1 POST /seller/products ───────────────────────────────────
exports.createProduct = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const {
      name, description, images, categoryId, categoryName,
      price, priceType, minOrderQty, unit,
      specifications, tags, location, bulkPricingTiers,
    } = req.body;

    let category = null;
    if (categoryId) {
      category = await Category.findByPk(categoryId, { transaction: t });
    }
    if (!category && categoryName) {
      category = await Category.findOne({
        where: { name: { [Op.like]: `%${categoryName}%` } },
        transaction: t
      });
    }
    if (!category) {
      category = await Category.findOne({ transaction: t });
    }

    const catId = category ? category.id : 'c5ffe077-b562-47f8-8f4a-ff2d07357028';

    const product = await Product.create({
      name,
      description: description || 'High quality B2B verified industrial product.',
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600'],
      categoryId: catId,
      sellerId: req.user.id,
      price: price || 0,
      priceType: priceType || 'fixed',
      minOrderQty: minOrderQty || 1,
      unit: unit || 'Piece',
      specifications: specifications || {},
      tags: tags || [],
      location: location || req.user?.address || 'India',
      status: req.user?.role === 'admin' ? 'approved' : 'pending',
      isActive: req.user?.role === 'admin' ? true : false,
    }, { transaction: t });

    if (bulkPricingTiers && bulkPricingTiers.length > 0) {
      const tiers = bulkPricingTiers.map(tier => ({
        ...tier, productId: product.id,
      }));
      await ProductPricingTier.bulkCreate(tiers, { transaction: t });
    }

    // Increment category product count
    if (category) {
      await category.increment('productCount', { by: 1, transaction: t });
    }

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

// ── 6.5 GET /seller/orders ─────────────────────────────────────
exports.getSellerOrders = async (req, res, next) => {
  try {
    const items = await OrderItem.findAll({
      where: { sellerId: req.user.id },
      include: [
        {
          model: Order, as: 'order',
          include: [{ model: User, as: 'buyer', attributes: ['id', 'fullName', 'companyName', 'avatar'] }],
        },
        { model: Product, as: 'product', attributes: ['id', 'name', 'images', 'unit'] },
      ],
      order: [[{ model: Order, as: 'order' }, 'created_at', 'DESC']],
    });

    const ordersMap = {};
    items.forEach((item) => {
      const o = item.order;
      if (!o) return;
      if (!ordersMap[o.id]) {
        ordersMap[o.id] = {
          id:              o.id,
          orderNumber:     o.orderNumber,
          buyerName:       o.buyer?.fullName || o.buyer?.companyName || 'Buyer',
          buyerAvatar:     o.buyer?.avatar,
          shippingAddress: o.shippingAddress,
          address:         o.shippingAddress,
          paymentMethod:   o.paymentMethod,
          grandTotal:      parseFloat(o.grandTotal),
          totalPrice:      parseFloat(o.grandTotal),
          status:          o.status,
          courierName:     o.courierName,
          shippingCarrier: o.courierName,
          trackingNumber:  o.trackingNumber,
          trackingNo:      o.trackingNumber,
          date:            o.created_at,
          items:           [],
        };
      }
      ordersMap[o.id].items.push({
        id:           item.id,
        productId:    item.productId,
        productName:  item.product?.name || 'Product',
        productImage: item.product?.images?.[0] || '',
        quantity:     item.quantity,
        unitPrice:    parseFloat(item.unitPrice),
      });
      // Top item preview convenience fields
      if (!ordersMap[o.id].productName) {
        ordersMap[o.id].productName  = item.product?.name || 'Product';
        ordersMap[o.id].productImage = item.product?.images?.[0] || '';
        ordersMap[o.id].quantity     = item.quantity;
        ordersMap[o.id].unitPrice    = parseFloat(item.unitPrice);
      }
    });

    return sendSuccess(res, 200, 'OK', Object.values(ordersMap));
  } catch (err) {
    next(err);
  }
};

// ── 6.4 PUT /seller/orders/:id/status ───────────────────────────
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNo, trackingNumber, shippingCarrier, courierName } = req.body;
    const VALID = ['new', 'placed', 'confirmed', 'processing', 'packed', 'ready_to_dispatch', 'shipped', 'delivered', 'cancelled', 'rejected'];
    if (status && !VALID.includes(status)) {
      return sendError(res, 422, 'INVALID_STATUS', `Status must be one of: ${VALID.join(', ')}`);
    }

    // Verify this seller has items in this order
    const item = await OrderItem.findOne({
      where: { orderId: req.params.id, sellerId: req.user.id },
    });
    if (!item) return sendError(res, 404, 'NOT_FOUND', 'Order not found');

    const updateFields = {};
    if (status) updateFields.status = status;
    if (courierName || shippingCarrier) updateFields.courierName = courierName || shippingCarrier;
    if (trackingNumber || trackingNo) updateFields.trackingNumber = trackingNumber || trackingNo;
    if (status === 'delivered') updateFields.deliveredAt = new Date();

    await Order.update(updateFields, { where: { id: req.params.id } });
    return sendSuccess(res, 200, 'Order status updated', { id: req.params.id, ...updateFields });
  } catch (err) {
    next(err);
  }
};
