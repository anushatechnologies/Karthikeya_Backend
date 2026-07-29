const { sequelize }                            = require('../config/db');
const { Order, OrderItem, Product, User }      = require('../models/index');
const { sendSuccess, sendError }               = require('../utils/response');

// ── 6.1 POST /orders ────────────────────────────────────────────
exports.placeOrder = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { items, shippingAddress, paymentMethod, subtotal, tax, shippingCost, grandTotal } = req.body;

    const order = await Order.create({
      buyerId: req.user.id,
      shippingAddress,
      paymentMethod,
      subtotal,
      tax,
      shippingCost,
      grandTotal,
      status: 'placed',
    }, { transaction: t });

    // Build order items with seller lookup
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (!product) {
        await t.rollback();
        return sendError(res, 404, 'NOT_FOUND', `Product ${item.productId} not found`);
      }
      orderItems.push({
        orderId:   order.id,
        productId: item.productId,
        sellerId:  product.sellerId,
        quantity:  item.quantity,
        unitPrice: item.unitPrice,
      });
    }

    await OrderItem.bulkCreate(orderItems, { transaction: t });
    await t.commit();

    return sendSuccess(res, 201, 'Order placed', {
      orderId:   order.id,
      status:    order.status,
      createdAt: order.created_at,
    });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// ── 6.2 GET /orders ─────────────────────────────────────────────
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { buyerId: req.user.id },
      include: [
        {
          model: OrderItem, as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'images'] }],
        },
      ],
      order: [['created_at', 'DESC']],
    });
    return sendSuccess(res, 200, 'OK', orders);
  } catch (err) {
    next(err);
  }
};

// ── 6.3 GET /orders/:id ─────────────────────────────────────────
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, buyerId: req.user.id },
      include: [
        {
          model: OrderItem, as: 'items',
          include: [
            { model: Product, as: 'product', attributes: ['id', 'name', 'images', 'unit'] },
            { model: User,    as: 'seller',  attributes: ['id', 'fullName', 'companyName'] },
          ],
        },
      ],
    });
    if (!order) return sendError(res, 404, 'NOT_FOUND', 'Order not found');
    return sendSuccess(res, 200, 'OK', order);
  } catch (err) {
    next(err);
  }
};
