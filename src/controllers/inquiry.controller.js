const { Inquiry, Product, User } = require('../models/index');
const { sendSuccess, sendError }  = require('../utils/response');

// ── 5.1 POST /inquiries ─────────────────────────────────────────
exports.createInquiry = async (req, res, next) => {
  try {
    const { productId, quantity, message } = req.body;

    const product = await Product.findByPk(productId, { attributes: ['id', 'sellerId'] });
    if (!product) return sendError(res, 404, 'NOT_FOUND', 'Product not found');

    const inquiry = await Inquiry.create({
      productId,
      buyerId:  req.user.id,
      sellerId: product.sellerId,
      quantity,
      message,
    });

    return sendSuccess(res, 201, 'Inquiry sent', { inquiryId: inquiry.id });
  } catch (err) {
    next(err);
  }
};

// ── 5.2 GET /inquiries ──────────────────────────────────────────
exports.getInquiries = async (req, res, next) => {
  try {
    const { type = 'buyer' } = req.query;
    const where = type === 'seller'
      ? { sellerId: req.user.id }
      : { buyerId:  req.user.id };

    const inquiries = await Inquiry.findAll({
      where,
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'images'] },
        { model: User,    as: 'buyer',   attributes: ['id', 'fullName', 'avatar'] },
        { model: User,    as: 'seller',  attributes: ['id', 'fullName', 'companyName'] },
      ],
      order: [['created_at', 'DESC']],
    });

    return sendSuccess(res, 200, 'OK', inquiries);
  } catch (err) {
    next(err);
  }
};
