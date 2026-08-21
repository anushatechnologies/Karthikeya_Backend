const { sequelize }                            = require('../config/db');
const { Order, OrderItem, Product, User }      = require('../models/index');
const { sendSuccess, sendError }               = require('../utils/response');

// ── 6.1 POST /orders ────────────────────────────────────────────
exports.placeOrder = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { items, shippingAddress, paymentMethod, subtotal, tax, shippingCost, grandTotal } = req.body;

    const order = await Order.create({
      orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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
      const sellerId = product ? product.sellerId : req.user.id;
      orderItems.push({
        orderId:   order.id,
        productId: product ? product.id : (item.productId || 'p1'),
        sellerId,
        quantity:  item.quantity || 1,
        unitPrice: item.unitPrice || 0,
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
    const { Op } = require('sequelize');
    const where = req.user.role === 'seller'
      ? { [Op.or]: [{ buyerId: req.user.id }, { supplierId: req.user.id }] }
      : { buyerId: req.user.id };

    const rawOrders = await Order.findAll({
      where,
      include: [
        {
          model: OrderItem, as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'images'] }],
        },
        { model: User, as: 'buyer', attributes: ['id', 'fullName', 'companyName', 'avatar'] },
      ],
      order: [['created_at', 'DESC']],
    });

    const formatted = rawOrders.map((o) => {
      const firstItem = o.items?.[0];
      const prod = firstItem?.product;
      return {
        id:              o.id,
        orderNumber:     o.orderNumber,
        buyerName:       o.buyer?.fullName || o.buyer?.companyName || 'Buyer',
        buyerAvatar:     o.buyer?.avatar,
        productName:     prod?.name || 'B2B Product Order',
        productImage:    prod?.images?.[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600',
        quantity:        firstItem?.quantity || 1,
        unitPrice:       parseFloat(firstItem?.unitPrice || o.grandTotal),
        totalPrice:      parseFloat(o.grandTotal),
        status:          o.status,
        date:            o.created_at ? new Date(o.created_at).toLocaleDateString() : 'Today',
        address:         o.shippingAddress,
        paymentMethod:   o.paymentMethod,
        shippingCarrier: o.courierName,
        trackingNo:      o.trackingNumber,
        items:           o.items,
      };
    });

    return sendSuccess(res, 200, 'OK', formatted);
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
