const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, KYCApplication, OTP } = require('../models/index');
const { signToken }             = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/response');

function normalizePhone(raw) {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function serializeUser(user) {
  return {
    id:           user.id,
    email:        user.email,
    fullName:     user.fullName || user.ownerName,
    role:         user.role,
    phone:        user.phone,
    companyName:  user.companyName,
    gstNumber:    user.gstNumber,
    businessType: user.businessType,
    isVerified:   user.isVerified ?? false,
    avatar:       user.avatar,
  };
}

// ── 2.0 Check Phone Registration Status ─────────────────────────
exports.checkPhone = async (req, res, next) => {
  try {
    const { phone: rawPhone } = req.body;
    const phone = normalizePhone(rawPhone);

    if (!phone || phone.length < 10) {
      return sendError(res, 400, 'BAD_REQUEST', 'Valid 10-digit phone number is required');
    }

    const user = await User.findOne({
      where: {
        phone: { [Op.like]: `%${phone}%` },
      },
    });

    return sendSuccess(res, 200, 'Phone status checked', {
      exists: !!user,
      isRegistered: !!user,
      role: user?.role || null,
      fullName: user?.fullName || null,
    });
  } catch (err) {
    next(err);
  }
};

// ── 2.0A POST /auth/send-otp (Phone OTP Sign In / Registration) ───
exports.sendOtp = async (req, res, next) => {
  try {
    const { phone: rawPhone, role = 'buyer' } = req.body;
    const phone = normalizePhone(rawPhone);

    if (!phone || phone.length < 10) {
      return sendError(res, 400, 'INVALID_PHONE', 'Please provide a valid 10-digit mobile number');
    }

    // Generate genuine random 6-digit numeric OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // Invalidate prior active OTPs for this phone
    await OTP.update({ verified: true }, { where: { phone, verified: false } });

    // Store new OTP in database
    await OTP.create({
      phone,
      otp: generatedOtp,
      role,
      expiresAt,
      verified: false,
    });

    console.log(`📱 [Real-Time SMS Gateway] OTP generated for +91 ${phone}: ${generatedOtp} (Expires in 5m)`);

    // Optional: Real SMS Gateway Dispatch (Fast2SMS / 2Factor / MSG91) if configured in .env
    const fast2smsKey = process.env.FAST2SMS_API_KEY;
    if (fast2smsKey) {
      try {
        const axios = require('axios');
        await axios.post('https://www.fast2sms.com/dev/bulkV2', {
          route: 'otp',
          variables_values: generatedOtp,
          numbers: phone,
        }, {
          headers: { 'authorization': fast2smsKey },
          timeout: 5000,
        });
        console.log(`📡 [Fast2SMS] SMS sent to +91 ${phone}`);
      } catch (smsErr) {
        console.warn('⚠️ Fast2SMS delivery warning:', smsErr.message);
      }
    }

    return sendSuccess(res, 200, `OTP sent successfully to +91 ${phone}`, {
      phone,
      expiresInSeconds: 300,
    });
  } catch (err) {
    next(err);
  }
};

// ── 2.0B POST /auth/verify-otp (Verify Phone OTP & Sign In) ──────
exports.verifyOtp = async (req, res, next) => {
  try {
    const { phone: rawPhone, otp, role = 'buyer' } = req.body;
    const phone = normalizePhone(rawPhone);

    if (!phone || !otp) {
      return sendError(res, 400, 'BAD_REQUEST', 'Phone number and 6-digit OTP are required');
    }

    // Find valid OTP record
    const otpRecord = await OTP.findOne({
      where: {
        phone,
        otp: otp.toString().trim(),
        verified: false,
      },
      order: [['created_at', 'DESC']],
    });

    if (!otpRecord) {
      return sendError(res, 400, 'INVALID_OTP', 'Incorrect OTP. Please enter the 6-digit code sent to your phone.');
    }

    if (new Date() > new Date(otpRecord.expiresAt)) {
      return sendError(res, 400, 'OTP_EXPIRED', 'This OTP has expired. Please request a new code.');
    }

    // Mark OTP as verified
    await otpRecord.update({ verified: true });

    // Lookup user by phone
    let user = await User.findOne({
      where: {
        phone: { [Op.like]: `%${phone}%` },
      },
    });

    if (!user) {
      // Auto-create user account with this verified phone number
      const dummyEmail = `user_${phone}@kfpcl.trade`;
      const defaultName = role === 'seller' ? `Supplier ${phone.slice(-4)}` : `Buyer ${phone.slice(-4)}`;
      const randomPassword = await bcrypt.hash(`KFPCL@${phone}`, 10);

      user = await User.create({
        fullName: defaultName,
        phone,
        email: dummyEmail,
        password: randomPassword,
        role: role || 'buyer',
        companyName: role === 'seller' ? `KFPCL Enterprise (${phone.slice(-4)})` : 'KFPCL Buyer',
        isVerified: true,
      });
      console.log(`✅ New user auto-registered via OTP: ${user.phone} (${user.role})`);
    } else {
      if (user.isActive === false) {
        return sendError(res, 403, 'ACCOUNT_DISABLED', 'Account is disabled');
      }
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return sendSuccess(res, 200, 'Login successful', {
      token,
      user: serializeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// ── 2.0C POST /auth/firebase-login (Sign In with verified Firebase phone) ──
exports.firebaseLogin = async (req, res, next) => {
  try {
    const { phone: rawPhone, role = 'buyer', idToken } = req.body;
    const phone = normalizePhone(rawPhone);

    if (!phone || phone.length < 10) {
      return sendError(res, 400, 'BAD_REQUEST', 'Valid phone number is required');
    }

    // Find existing user or auto-create account
    let user = await User.findOne({
      where: {
        phone: { [Op.like]: `%${phone}%` },
      },
    });

    if (!user) {
      return sendError(res, 404, 'USER_NOT_REGISTERED', 'No account found for this mobile number. Please register first.');
    }

    if (user.isActive === false) {
      return sendError(res, 403, 'ACCOUNT_DISABLED', 'Account is disabled');
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return sendSuccess(res, 200, 'Firebase login successful', {
      token,
      user: serializeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// ── 2.1 POST /auth/login ────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { identifier, password, role } = req.body;

    const user = await User.findOne({
      where: identifier?.includes('@')
        ? { email: identifier }
        : { phone: identifier },
    });

    if (!user) {
      return sendError(res, 401, 'INVALID_CREDENTIALS', 'No account found with this email or phone number');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return sendError(res, 401, 'INVALID_CREDENTIALS', 'Invalid credentials');
    if (user.isActive === false) return sendError(res, 403, 'ACCOUNT_DISABLED', 'Account is disabled');

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return sendSuccess(res, 200, 'Login successful', { token, user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
};

// ── 2.2 POST /auth/signup/buyer ─────────────────────────────────
exports.signupBuyer = async (req, res, next) => {
  try {
    const { fullName, phone: rawPhone, email, password, businessDetails } = req.body;
    const phone = normalizePhone(rawPhone);

    if (email && email.trim()) {
      const emailExists = await User.findOne({ where: { email: email.trim() } });
      if (emailExists) return sendError(res, 409, 'EMAIL_TAKEN', 'Email is already registered. Please sign in or use a different email.');
    }

    if (phone) {
      const phoneExists = await User.findOne({ where: { phone } });
      if (phoneExists) {
        // If phone already registered via OTP, update profile
        const effectiveEmail = email?.trim() || phoneExists.email || `buyer_${phone}@kfpcl.trade`;
        await phoneExists.update({
          fullName: fullName || phoneExists.fullName,
          email: effectiveEmail,
          businessType: businessDetails || phoneExists.businessType,
          role: 'buyer',
          isVerified: true,
        });
        const token = signToken({ id: phoneExists.id, email: phoneExists.email, role: phoneExists.role });
        return sendSuccess(res, 200, 'Buyer profile updated', { token, user: serializeUser(phoneExists) });
      }
    }

    const effectivePassword = password || `KFPCL@${phone}`;
    const hashed = await bcrypt.hash(effectivePassword, 10);
    const effectiveEmail = (email && email.trim()) ? email.trim() : `buyer_${phone}@kfpcl.trade`;

    const user = await User.create({
      fullName,
      phone,
      email: effectiveEmail,
      password: hashed,
      role: 'buyer',
      businessType: businessDetails,
      isVerified: true,
    });

    console.log(`✅ Buyer registered in DB: ${user.phone} / ${user.email} (ID: ${user.id})`);
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return sendSuccess(res, 201, 'Buyer account created', { token, user: serializeUser(user) });
  } catch (err) {
    console.error('❌ Buyer signup DB error:', err.message);
    next(err);
  }
};

// ── 2.3 POST /auth/signup/supplier ──────────────────────────────
exports.signupSupplier = async (req, res, next) => {
  try {
    const { ownerName, companyName, phone: rawPhone, email, password, gstNumber, panNumber, panDocUrl, businessType, address, kycDocUrl } = req.body;
    const phone = normalizePhone(rawPhone);

    if (email && email.trim()) {
      const emailExists = await User.findOne({ where: { email: email.trim() } });
      if (emailExists) return sendError(res, 409, 'EMAIL_TAKEN', 'Email is already registered. Please sign in or use a different email.');
    }

    if (phone) {
      const phoneExists = await User.findOne({ where: { phone } });
      if (phoneExists) {
        const effectiveEmail = email?.trim() || phoneExists.email || `supplier_${phone}@kfpcl.trade`;
        await phoneExists.update({
          fullName: ownerName || phoneExists.fullName,
          companyName: companyName || phoneExists.companyName,
          email: effectiveEmail,
          role: 'seller',
          gstNumber: gstNumber || phoneExists.gstNumber,
          panNumber: panNumber || phoneExists.panNumber,
          businessType: businessType || phoneExists.businessType,
          address: address || phoneExists.address,
        });

        const token = signToken({ id: phoneExists.id, email: phoneExists.email, role: phoneExists.role });
        return sendSuccess(res, 200, 'Supplier profile updated', { token, user: serializeUser(phoneExists) });
      }
    }

    const effectivePassword = password || `KFPCL@${phone}`;
    const hashed = await bcrypt.hash(effectivePassword, 10);
    const effectiveEmail = (email && email.trim()) ? email.trim() : `supplier_${phone}@kfpcl.trade`;

    const user = await User.create({
      fullName: ownerName,
      companyName,
      phone,
      email: effectiveEmail,
      password: hashed,
      role: 'seller',
      gstNumber,
      panNumber,
      businessType,
      address,
      isVerified: false,
    });

    // Create KYC application
    try {
      await KYCApplication.create({
        sellerId: user.id,
        gstNumber,
        panNumber,
        kycDocUrl: kycDocUrl || '',
        documents: [
          ...(kycDocUrl ? [{ type: 'gst_pdf', url: kycDocUrl }] : []),
          ...(panDocUrl ? [{ type: 'pan_doc', url: panDocUrl }] : []),
        ],
      });
    } catch (kycErr) {
      console.warn('⚠️ KYC application creation failed (non-fatal):', kycErr.message);
    }

    console.log(`✅ Supplier registered in DB: ${user.phone} / ${user.email} (ID: ${user.id})`);
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return sendSuccess(res, 201, 'Supplier application submitted', { token, user: serializeUser(user) });
  } catch (err) {
    console.error('❌ Supplier signup DB error:', err.message);
    next(err);
  }
};

// ── 2.4 GET /auth/me ────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) {
      return sendError(res, 404, 'NOT_FOUND', 'User not found');
    }
    return sendSuccess(res, 200, 'OK', serializeUser(user));
  } catch (err) {
    next(err);
  }
};

// ── 2.5 PUT /auth/profile ────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return sendError(res, 404, 'NOT_FOUND', 'User not found');

    const { fullName, companyName, phone, address, avatar, businessType, gstNumber } = req.body;

    await user.update({
      ...(fullName && { fullName }),
      ...(companyName && { companyName }),
      ...(phone && { phone }),
      ...(address && { address }),
      ...(avatar && { avatar }),
      ...(businessType && { businessType }),
      ...(gstNumber && { gstNumber }),
    });

    return sendSuccess(res, 200, 'Profile updated successfully', serializeUser(user));
  } catch (err) {
    next(err);
  }
};

// ── 2.6 POST /auth/change-password ───────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return sendError(res, 400, 'BAD_REQUEST', 'Both current and new password are required');
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return sendError(res, 404, 'NOT_FOUND', 'User not found');

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return sendError(res, 401, 'INVALID_PASSWORD', 'Current password does not match');

    const hashed = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashed });

    return sendSuccess(res, 200, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
};

// ── 2.7 DELETE /auth/account ─────────────────────────────────────
exports.deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return sendError(res, 404, 'NOT_FOUND', 'User not found');

    await user.update({ isActive: false });
    return sendSuccess(res, 200, 'Account deactivated successfully');
  } catch (err) {
    next(err);
  }
};
