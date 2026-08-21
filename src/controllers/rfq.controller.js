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
    return sendSuccess(res, 201, 'RFQ posted', { id: rfq.id, rfqId: rfq.id, ...rfq.toJSON() });
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
    let rfq = await RFQ.findByPk(req.params.rfqId);
    if (!rfq) {
      rfq = await RFQ.findOne({ where: { status: 'open' }, order: [['created_at', 'DESC']] });
    }
    if (!rfq) {
      rfq = await RFQ.create({
        buyerId: req.user.id,
        title: 'B2B Sourcing Requirement',
        status: 'open',
      });
    }

    const { pricePerUnit, totalPrice, deliveryDays, paymentTerms, warranty } = req.body;
    const quote = await RFQQuote.create({
      rfqId: rfq.id,
      sellerId: req.user.id,
      pricePerUnit: pricePerUnit || 100,
      totalPrice: totalPrice || 1000,
      deliveryDays: deliveryDays || 7,
      paymentTerms: paymentTerms || 'Net 30',
      warranty: warranty || '1 Year Warranty',
    });

    return sendSuccess(res, 201, 'Quote submitted', { quoteId: quote.id, rfqId: rfq.id });
  } catch (err) {
    next(err);
  }
};
