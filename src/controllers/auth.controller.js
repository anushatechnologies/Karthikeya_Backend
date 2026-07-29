const bcrypt = require('bcryptjs');
const { User, KYCApplication } = require('../models/index');
const { signToken }             = require('../utils/jwt');
const { sendSuccess, sendError, createAppError } = require('../utils/response');

// ── Shared user serializer ──────────────────────────────────────
function serializeUser(user) {
  return {
    id:           user.id,
    email:        user.email,
    fullName:     user.fullName,
    role:         user.role,
    phone:        user.phone,
    companyName:  user.companyName,
    gstNumber:    user.gstNumber,
    businessType: user.businessType,
    isVerified:   user.isVerified,
    avatar:       user.avatar,
  };
}

// ── 2.1 POST /auth/login ────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { identifier, password, role } = req.body;

    // Find by email OR phone
    const user = await User.findOne({
      where: identifier.includes('@')
        ? { email: identifier, role }
        : { phone: identifier, role },
    });

    if (!user) return sendError(res, 401, 'INVALID_CREDENTIALS', 'Invalid credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) return sendError(res, 401, 'INVALID_CREDENTIALS', 'Invalid credentials');

    if (!user.isActive) return sendError(res, 403, 'ACCOUNT_DISABLED', 'Account is disabled');

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return sendSuccess(res, 200, 'Login successful', { token, user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
};

// ── 2.2 POST /auth/signup/buyer ─────────────────────────────────
exports.signupBuyer = async (req, res, next) => {
  try {
    const { fullName, phone, email, password, businessDetails } = req.body;

    const exists = await User.findOne({ where: { email } });
    if (exists) return sendError(res, 409, 'EMAIL_TAKEN', 'Email is already registered');

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({
      fullName,
      phone,
      email,
      password: hashed,
      role:     'buyer',
      businessType: businessDetails,
      isVerified: true,
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return sendSuccess(res, 201, 'Buyer account created', { token, user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
};

// ── 2.3 POST /auth/signup/supplier ──────────────────────────────
exports.signupSupplier = async (req, res, next) => {
  try {
    const { ownerName, companyName, phone, email, password, gstNumber, businessType, address, kycDocUrl } = req.body;

    const exists = await User.findOne({ where: { email } });
    if (exists) return sendError(res, 409, 'EMAIL_TAKEN', 'Email is already registered');

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({
      fullName: ownerName,
      companyName,
      phone,
      email,
      password: hashed,
      role: 'seller',
      gstNumber,
      businessType,
      address,
      isVerified: false,
    });

    // Create KYC application
    await KYCApplication.create({ sellerId: user.id, kycDocUrl });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return sendSuccess(res, 201, 'Supplier application submitted. Account pending KYC approval.', {
      token,
      user: serializeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// ── 2.4 GET /auth/me ────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return sendError(res, 404, 'NOT_FOUND', 'User not found');
    return sendSuccess(res, 200, 'OK', serializeUser(user));
  } catch (err) {
    next(err);
  }
};
