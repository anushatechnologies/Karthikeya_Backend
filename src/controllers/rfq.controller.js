const { RFQ, RFQQuote, User } = require('../models/index');
const { sendSuccess, sendError } = require('../utils/response');

// ── 5.3 POST /rfq ───────────────────────────────────────────────
exports.createRFQ = async (req, res, next) => {
  try {
    const { title, category, quantity, targetPrice, specifications } = req.body;
    const rfq = await RFQ.create({
      buyerId: req.user.id,
      title, category, quantity, targetPrice, specifications,
    });
    return sendSuccess(res, 201, 'RFQ posted', { rfqId: rfq.id });
  } catch (err) {
    next(err);
  }
};

// ── 5.4 GET /rfq ────────────────────────────────────────────────
exports.getRFQs = async (req, res, next) => {
  try {
    const rfqs = await RFQ.findAll({
      where: { status: 'open' },
      include: [{ model: User, as: 'buyer', attributes: ['id', 'fullName', 'companyName'] }],
      order: [['created_at', 'DESC']],
    });
    return sendSuccess(res, 200, 'OK', rfqs);
  } catch (err) {
    next(err);
  }
};

// ── 5.5 POST /rfq/:rfqId/quotes ─────────────────────────────────
exports.submitQuote = async (req, res, next) => {
  try {
    const rfq = await RFQ.findByPk(req.params.rfqId);
    if (!rfq) return sendError(res, 404, 'NOT_FOUND', 'RFQ not found');
    if (rfq.status !== 'open') return sendError(res, 400, 'RFQ_CLOSED', 'This RFQ is closed');

    const { pricePerUnit, totalPrice, deliveryDays, paymentTerms, warranty } = req.body;
    const quote = await RFQQuote.create({
      rfqId: rfq.id,
      sellerId: req.user.id,
      pricePerUnit, totalPrice, deliveryDays, paymentTerms, warranty,
    });

    return sendSuccess(res, 201, 'Quote submitted', { quoteId: quote.id });
  } catch (err) {
    next(err);
  }
};
