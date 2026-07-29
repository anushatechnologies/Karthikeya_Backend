const { KYCApplication, User }   = require('../models/index');
const { sendSuccess, sendError } = require('../utils/response');

// ── 9.1 GET /admin/kyc-applications ─────────────────────────────
exports.getKYCApplications = async (req, res, next) => {
  try {
    const applications = await KYCApplication.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: User, as: 'seller',
          attributes: ['id', 'fullName', 'companyName', 'email', 'phone', 'gstNumber', 'businessType'],
        },
      ],
      order: [['created_at', 'ASC']],
    });
    return sendSuccess(res, 200, 'OK', applications);
  } catch (err) {
    next(err);
  }
};

// ── 9.2 POST /admin/kyc-applications/:id/verify ─────────────────
exports.verifyKYC = async (req, res, next) => {
  try {
    const { action, reason } = req.body;

    const kyc = await KYCApplication.findByPk(req.params.id);
    if (!kyc) return sendError(res, 404, 'NOT_FOUND', 'KYC application not found');
    if (kyc.status !== 'pending') {
      return sendError(res, 400, 'ALREADY_PROCESSED', 'This application has already been processed');
    }

    kyc.status     = action === 'approve' ? 'approved' : 'rejected';
    kyc.reason     = reason || null;
    kyc.reviewedBy = req.user.id;
    kyc.reviewedAt = new Date();
    await kyc.save();

    // If approved, mark seller as verified
    if (action === 'approve') {
      await User.update({ isVerified: true }, { where: { id: kyc.sellerId } });
    }

    return sendSuccess(res, 200, `KYC ${kyc.status}`, { id: kyc.id, status: kyc.status });
  } catch (err) {
    next(err);
  }
};
