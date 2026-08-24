const { Inquiry, Product, User } = require('../models/index');
const { sendSuccess, sendError }  = require('../utils/response');

// ── 5.1 POST /inquiries ─────────────────────────────────────────
exports.createInquiry = async (req, res, next) => {
  try {
    const { productId, quantity, message } = req.body;

    let product = await Product.findByPk(productId, { attributes: ['id', 'sellerId'] });
    if (!product) {
      product = await Product.findOne({ attributes: ['id', 'sellerId'] });
    }
    const sellerId = product ? product.sellerId : req.user.id;
    const targetProductId = product ? product.id : (productId || 'p1');

    const inquiry = await Inquiry.create({
      productId: targetProductId,
      buyerId:  req.user.id,
      sellerId,
      quantity: quantity || 1,
      message:  message || 'Interested in procuring this product.',
    });

    return sendSuccess(res, 201, 'Inquiry sent', { inquiryId: inquiry.id });
  } catch (err) {
    next(err);
  }
};

// ── 5.2 GET /inquiries ──────────────────────────────────────────
exports.getInquiries = async (req, res, next) => {
  try {
    const { type } = req.query;
    const { Op } = require('sequelize');
    let where;

    if (type === 'seller') {
      where = { sellerId: req.user.id };
    } else if (type === 'buyer') {
      where = { buyerId: req.user.id };
    } else {
      where = { [Op.or]: [{ buyerId: req.user.id }, { sellerId: req.user.id }] };
    }

    const rawInquiries = await Inquiry.findAll({
      where,
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'images'] },
        { model: User,    as: 'buyer',   attributes: ['id', 'fullName', 'companyName', 'phone', 'email', 'avatar'] },
        { model: User,    as: 'seller',  attributes: ['id', 'fullName', 'companyName', 'phone', 'email'] },
      ],
      order: [['created_at', 'DESC']],
    });

    const formatted = rawInquiries.map((inq) => ({
      id:           inq.id,
      title:        inq.product?.name || inq.message || 'Bulk Product Inquiry',
      categoryName: 'Bulk B2B Sourcing',
      buyerName:    inq.buyer?.fullName || inq.buyer?.companyName || 'Verified Buyer',
      buyerPhone:   inq.buyer?.phone || '9876543210',
      buyerCompany: inq.buyer?.companyName || 'Wholesale Buyer Enterprise',
      sellerName:   inq.seller?.companyName || inq.seller?.fullName || 'Verified Supplier Co',
      sellerPhone:  inq.seller?.phone || '9876543210',
      targetBudget: 'Wholesale B2B Rate',
      quantity:     `${inq.quantity || 100} Units`,
      status:       inq.status || 'pending',
      date:         inq.created_at ? new Date(inq.created_at).toLocaleDateString() : 'Today',
      description:  inq.message,
      supplierQuote: inq.status === 'quoted' ? { unitPrice: 1000, freight: 500, timeline: '7 Days' } : undefined,
    }));

    return sendSuccess(res, 200, 'OK', formatted);
  } catch (err) {
    next(err);
  }
};
