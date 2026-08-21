const {
  User, Address, Category, Brand, Product, Order, RFQ, Transaction,
  Lead, LeadPackage, LeadSettings, KYCApplication, FlaggedMessage,
  NotificationCampaign, SupportTicket, CMSBanner, CMSFaq, ActivityLog, PlatformSettings
} = require('../models/index');
const { sendSuccess, sendError } = require('../utils/response');
const { Op } = require('sequelize');

// Helper for pagination & search filters
const buildTableFilters = (query) => {
  const page = parseInt(query.page) || 1;
  const pageSize = parseInt(query.pageSize) || 20;
  const limit = pageSize;
  const offset = (page - 1) * pageSize;
  const sortBy = query.sortBy || 'created_at';
  const sortOrder = (query.sortOrder || 'desc').toUpperCase();

  return { page, pageSize, limit, offset, sortBy, sortOrder };
};

// ── 1. BUYERS ──────────────────────────────────────────────────
exports.getBuyers = async (req, res, next) => {
  try {
    const { page, pageSize, limit, offset, sortBy, sortOrder } = buildTableFilters(req.query);
    const where = { role: { [Op.in]: ['buyer', 'user'] } };

    if (req.query.search) {
      where[Op.or] = [
        { fullName: { [Op.like]: `%${req.query.search}%` } },
        { email: { [Op.like]: `%${req.query.search}%` } },
        { companyName: { [Op.like]: `%${req.query.search}%` } },
        { phone: { [Op.like]: `%${req.query.search}%` } },
      ];
    }
    if (req.query.status && req.query.status !== 'all') {
      where.isActive = req.query.status === 'active';
    }

    const { rows: data, count: total } = await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['password'] }
    });

    return sendSuccess(res, 200, 'OK', {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    });
  } catch (err) {
    next(err);
  }
};

exports.getBuyerById = async (req, res, next) => {
  try {
    const buyer = await User.findByPk(req.params.id, {
      include: [{ model: Address, as: 'addresses' }],
      attributes: { exclude: ['password'] }
    });
    if (!buyer) return sendError(res, 404, 'NOT_FOUND', 'Buyer not found');
    return sendSuccess(res, 200, 'OK', buyer);
  } catch (err) {
    next(err);
  }
};

exports.updateBuyerStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const buyer = await User.findByPk(req.params.id);
    if (!buyer) return sendError(res, 404, 'NOT_FOUND', 'Buyer not found');

    if (status === 'suspended') {
      buyer.isActive = false;
    } else if (status === 'active') {
      buyer.isActive = true;
    }
    await buyer.save();
    return sendSuccess(res, 200, 'Buyer status updated', buyer);
  } catch (err) {
    next(err);
  }
};

exports.deleteBuyer = async (req, res, next) => {
  try {
    const buyer = await User.findByPk(req.params.id);
    if (!buyer) return sendError(res, 404, 'NOT_FOUND', 'Buyer not found');
    await buyer.destroy();
    return sendSuccess(res, 200, 'Buyer deleted successfully');
  } catch (err) {
    next(err);
  }
};

// ── 2. SUPPLIERS ───────────────────────────────────────────────
exports.getSuppliers = async (req, res, next) => {
  try {
    const { page, pageSize, limit, offset } = buildTableFilters(req.query);
    const where = { role: { [Op.in]: ['seller', 'supplier'] } };

    if (req.query.search) {
      where[Op.or] = [
        { fullName: { [Op.like]: `%${req.query.search}%` } },
        { companyName: { [Op.like]: `%${req.query.search}%` } },
        { storeName: { [Op.like]: `%${req.query.search}%` } },
        { gstNumber: { [Op.like]: `%${req.query.search}%` } },
        { email: { [Op.like]: `%${req.query.search}%` } },
        { phone: { [Op.like]: `%${req.query.search}%` } },
      ];
    }
    if (req.query.status && req.query.status !== 'all') {
      if (req.query.status === 'pending') {
        where[Op.or] = [
          { kycStatus: 'pending' },
          { kycStatus: 'not_submitted' },
          { isVerified: false }
        ];
      } else if (req.query.status === 'approved') {
        where[Op.or] = [
          { kycStatus: 'approved' },
          { isVerified: true }
        ];
      } else {
        where.kycStatus = req.query.status;
      }
    }

    const { rows: data, count: total } = await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['password'] }
    });

    return sendSuccess(res, 200, 'OK', {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    });
  } catch (err) {
    next(err);
  }
};

exports.getSupplierById = async (req, res, next) => {
  try {
    const supplier = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    if (!supplier) return sendError(res, 404, 'NOT_FOUND', 'Supplier not found');
    return sendSuccess(res, 200, 'OK', supplier);
  } catch (err) {
    next(err);
  }
};

exports.approveSupplier = async (req, res, next) => {
  try {
    const supplier = await User.findByPk(req.params.id);
    if (!supplier) return sendError(res, 404, 'NOT_FOUND', 'Supplier not found');

    supplier.kycStatus = 'approved';
    supplier.isVerified = true;
    supplier.isActive = true;
    await supplier.save();
    return sendSuccess(res, 200, 'Supplier approved', supplier);
  } catch (err) {
    next(err);
  }
};

exports.rejectSupplier = async (req, res, next) => {
  try {
    const supplier = await User.findByPk(req.params.id);
    if (!supplier) return sendError(res, 404, 'NOT_FOUND', 'Supplier not found');

    supplier.kycStatus = 'rejected';
    supplier.isVerified = false;
    await supplier.save();
    return sendSuccess(res, 200, 'Supplier rejected', supplier);
  } catch (err) {
    next(err);
  }
};

exports.suspendSupplier = async (req, res, next) => {
  try {
    const supplier = await User.findByPk(req.params.id);
    if (!supplier) return sendError(res, 404, 'NOT_FOUND', 'Supplier not found');

    supplier.isActive = false;
    await supplier.save();
    return sendSuccess(res, 200, 'Supplier suspended', supplier);
  } catch (err) {
    next(err);
  }
};

// ── 3. KYC VERIFICATION ────────────────────────────────────────
exports.getKYCApplications = async (req, res, next) => {
  try {
    const applications = await KYCApplication.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: User, as: 'seller',
          attributes: ['id', 'fullName', 'companyName', 'email', 'phone', 'gstNumber', 'panNumber', 'businessType'],
        },
      ],
      order: [['created_at', 'ASC']],
    });
    return sendSuccess(res, 200, 'OK', applications);
  } catch (err) {
    next(err);
  }
};

exports.verifyKYC = async (req, res, next) => {
  try {
    const { action, reason } = req.body;

    const kyc = await KYCApplication.findByPk(req.params.id);
    if (!kyc) return sendError(res, 404, 'NOT_FOUND', 'KYC application not found');

    kyc.status     = action === 'approve' ? 'approved' : 'rejected';
    kyc.reason     = reason || null;
    kyc.reviewedBy = req.user ? req.user.id : null;
    kyc.reviewedAt = new Date();
    await kyc.save();

    if (action === 'approve') {
      await User.update({ isVerified: true, kycStatus: 'approved' }, { where: { id: kyc.sellerId } });
    } else {
      await User.update({ kycStatus: 'rejected' }, { where: { id: kyc.sellerId } });
    }

    return sendSuccess(res, 200, `KYC ${kyc.status}`, { id: kyc.id, status: kyc.status });
  } catch (err) {
    next(err);
  }
};

// ── 4. PRODUCTS ────────────────────────────────────────────────
exports.getProducts = async (req, res, next) => {
  try {
    const { page, pageSize, limit, offset, sortBy, sortOrder } = buildTableFilters(req.query);
    const where = {};

    if (req.query.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${req.query.search}%` } },
        { sku: { [Op.like]: `%${req.query.search}%` } },
      ];
    }
    if (req.query.status && req.query.status !== 'all') {
      where.status = req.query.status;
    }
    if (req.query.categoryId) {
      where.categoryId = req.query.categoryId;
    }

    const { rows: data, count: total } = await Product.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, sortOrder]],
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: User, as: 'seller', attributes: ['id', 'fullName', 'companyName'] }
      ]
    });

    return sendSuccess(res, 200, 'OK', {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Brand, as: 'brand' },
        { model: User, as: 'seller', attributes: ['id', 'fullName', 'companyName'] }
      ]
    });
    if (!product) return sendError(res, 404, 'NOT_FOUND', 'Product not found');
    return sendSuccess(res, 200, 'OK', product);
  } catch (err) {
    next(err);
  }
};

exports.approveProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return sendError(res, 404, 'NOT_FOUND', 'Product not found');
    product.status = 'approved';
    await product.save();
    return sendSuccess(res, 200, 'Product approved', product);
  } catch (err) {
    next(err);
  }
};

exports.rejectProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return sendError(res, 404, 'NOT_FOUND', 'Product not found');
    product.status = 'rejected';
    await product.save();
    return sendSuccess(res, 200, 'Product rejected', product);
  } catch (err) {
    next(err);
  }
};

exports.toggleFeatured = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return sendError(res, 404, 'NOT_FOUND', 'Product not found');
    product.isFeatured = !product.isFeatured;
    await product.save();
    return sendSuccess(res, 200, 'Featured toggle updated', product);
  } catch (err) {
    next(err);
  }
};

exports.toggleTrending = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return sendError(res, 404, 'NOT_FOUND', 'Product not found');
    product.isTrending = !product.isTrending;
    await product.save();
    return sendSuccess(res, 200, 'Trending toggle updated', product);
  } catch (err) {
    next(err);
  }
};

exports.bulkApproveProducts = async (req, res, next) => {
  try {
    const { ids } = req.body;
    const [count] = await Product.update({ status: 'approved' }, { where: { id: { [Op.in]: ids } } });
    return sendSuccess(res, 200, `${count} products approved`, { count });
  } catch (err) {
    next(err);
  }
};

exports.bulkRejectProducts = async (req, res, next) => {
  try {
    const { ids } = req.body;
    const [count] = await Product.update({ status: 'rejected' }, { where: { id: { [Op.in]: ids } } });
    return sendSuccess(res, 200, `${count} products rejected`, { count });
  } catch (err) {
    next(err);
  }
};

exports.bulkDeleteProducts = async (req, res, next) => {
  try {
    const { ids } = req.body;
    const count = await Product.destroy({ where: { id: { [Op.in]: ids } } });
    return sendSuccess(res, 200, `${count} products deleted`, { count });
  } catch (err) {
    next(err);
  }
};

// ── 5. CATEGORIES & BRANDS ────────────────────────────────────
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      order: [['sort_order', 'ASC']],
      include: [{ model: Category, as: 'children' }]
    });
    return sendSuccess(res, 200, 'OK', categories);
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    return sendSuccess(res, 201, 'Category created', category);
  } catch (err) {
    next(err);
  }
};

exports.getBrands = async (req, res, next) => {
  try {
    const brands = await Brand.findAll({ order: [['name', 'ASC']] });
    return sendSuccess(res, 200, 'OK', brands);
  } catch (err) {
    next(err);
  }
};

exports.approveBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return sendError(res, 404, 'NOT_FOUND', 'Brand not found');
    brand.status = 'active';
    await brand.save();
    return sendSuccess(res, 200, 'Brand approved', brand);
  } catch (err) {
    next(err);
  }
};

// ── 6. ORDERS ──────────────────────────────────────────────────
exports.getOrders = async (req, res, next) => {
  try {
    const { page, pageSize, limit, offset, sortBy, sortOrder } = buildTableFilters(req.query);
    const where = {};

    if (req.query.search) {
      where.orderNumber = { [Op.like]: `%${req.query.search}%` };
    }
    if (req.query.status && req.query.status !== 'all') {
      where.status = req.query.status;
    }

    const { rows: data, count: total } = await Order.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, sortOrder]],
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'fullName', 'email'] },
        { model: User, as: 'supplier', attributes: ['id', 'fullName', 'companyName'] }
      ]
    });

    return sendSuccess(res, 200, 'OK', {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    next(err);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'fullName', 'email', 'phone'] },
        { model: User, as: 'supplier', attributes: ['id', 'fullName', 'companyName'] }
      ]
    });
    if (!order) return sendError(res, 404, 'NOT_FOUND', 'Order not found');
    return sendSuccess(res, 200, 'OK', order);
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return sendError(res, 404, 'NOT_FOUND', 'Order not found');

    order.status = status;
    const currentTimeline = order.timeline || [];
    currentTimeline.push({
      status,
      timestamp: new Date().toISOString(),
      description: `Order status updated to ${status}`,
      actor: req.user ? req.user.fullName : 'Admin',
    });
    order.timeline = currentTimeline;

    await order.save();
    return sendSuccess(res, 200, 'Order status updated', order);
  } catch (err) {
    next(err);
  }
};

exports.addTracking = async (req, res, next) => {
  try {
    const { trackingNumber, courierName } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return sendError(res, 404, 'NOT_FOUND', 'Order not found');

    order.trackingNumber = trackingNumber;
    order.courierName = courierName;
    order.status = 'shipped';
    const currentTimeline = order.timeline || [];
    currentTimeline.push({
      status: 'shipped',
      timestamp: new Date().toISOString(),
      description: `Dispatched via ${courierName} (AWB: ${trackingNumber})`,
      actor: req.user ? req.user.fullName : 'Admin',
    });
    order.timeline = currentTimeline;

    await order.save();
    return sendSuccess(res, 200, 'Dispatch tracking updated', order);
  } catch (err) {
    next(err);
  }
};

// ── 7. LEADS & MONETIZATION ────────────────────────────────────
exports.getLeads = async (req, res, next) => {
  try {
    const { page, pageSize, limit, offset, sortBy, sortOrder } = buildTableFilters(req.query);
    const where = {};

    if (req.query.search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${req.query.search}%` } },
        { buyerName: { [Op.like]: `%${req.query.search}%` } },
        { buyerCompany: { [Op.like]: `%${req.query.search}%` } },
      ];
    }
    if (req.query.status && req.query.status !== 'all') {
      where.status = req.query.status;
    }

    const { rows: data, count: total } = await Lead.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, sortOrder]],
    });

    return sendSuccess(res, 200, 'OK', {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    next(err);
  }
};

exports.createLead = async (req, res, next) => {
  try {
    const leadNumber = `LED-${Math.floor(100 + Math.random() * 900)}`;
    const lead = await Lead.create({ ...req.body, leadNumber });
    return sendSuccess(res, 201, 'Lead created', lead);
  } catch (err) {
    next(err);
  }
};

exports.getLeadPackages = async (req, res, next) => {
  try {
    const packages = await LeadPackage.findAll({ order: [['price', 'ASC']] });
    return sendSuccess(res, 200, 'OK', packages);
  } catch (err) {
    next(err);
  }
};

exports.createLeadPackage = async (req, res, next) => {
  try {
    const pkg = await LeadPackage.create(req.body);
    return sendSuccess(res, 201, 'Lead package created', pkg);
  } catch (err) {
    next(err);
  }
};

exports.getLeadSettings = async (req, res, next) => {
  try {
    let settings = await LeadSettings.findOne();
    if (!settings) {
      settings = await LeadSettings.create({
        freeLeadLimit: 10,
        defaultPricePerLead: 150.00,
        maxSuppliersPerLead: 5,
        autoAssignHotLeads: true,
      });
    }
    return sendSuccess(res, 200, 'OK', settings);
  } catch (err) {
    next(err);
  }
};

exports.updateLeadSettings = async (req, res, next) => {
  try {
    let settings = await LeadSettings.findOne();
    if (!settings) {
      settings = await LeadSettings.create(req.body);
    } else {
      await settings.update(req.body);
    }
    return sendSuccess(res, 200, 'Lead settings updated', settings);
  } catch (err) {
    next(err);
  }
};

// ── 8. TRANSACTIONS & SETTLEMENTS ──────────────────────────────
exports.getTransactions = async (req, res, next) => {
  try {
    const { page, pageSize, limit, offset, sortBy, sortOrder } = buildTableFilters(req.query);
    const where = {};

    if (req.query.search) {
      where[Op.or] = [
        { transactionId: { [Op.like]: `%${req.query.search}%` } },
        { orderNumber: { [Op.like]: `%${req.query.search}%` } },
      ];
    }
    if (req.query.status && req.query.status !== 'all') {
      where.status = req.query.status;
    }

    const { rows: data, count: total } = await Transaction.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, sortOrder]],
    });

    return sendSuccess(res, 200, 'OK', {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    next(err);
  }
};

exports.processRefund = async (req, res, next) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) return sendError(res, 404, 'NOT_FOUND', 'Transaction not found');

    transaction.status = 'reversed';
    await transaction.save();
    return sendSuccess(res, 200, 'Refund processed', transaction);
  } catch (err) {
    next(err);
  }
};

// ── 9. CHAT MODERATION ─────────────────────────────────────────
exports.getFlaggedMessages = async (req, res, next) => {
  try {
    const { page, pageSize, limit, offset, sortBy, sortOrder } = buildTableFilters(req.query);
    const where = {};

    if (req.query.status && req.query.status !== 'all') {
      where.status = req.query.status;
    }

    const { rows: data, count: total } = await FlaggedMessage.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, sortOrder]],
    });

    return sendSuccess(res, 200, 'OK', {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    next(err);
  }
};

exports.resolveFlag = async (req, res, next) => {
  try {
    const flag = await FlaggedMessage.findByPk(req.params.id);
    if (!flag) return sendError(res, 404, 'NOT_FOUND', 'Flagged message not found');
    flag.status = 'resolved';
    await flag.save();
    return sendSuccess(res, 200, 'Flag resolved', flag);
  } catch (err) {
    next(err);
  }
};

exports.banUser = async (req, res, next) => {
  try {
    const { userName } = req.body;
    await User.update({ isActive: false }, { where: { fullName: userName } });
    return sendSuccess(res, 200, `User ${userName} banned`);
  } catch (err) {
    next(err);
  }
};

// ── 10. BROADCAST NOTIFICATIONS ────────────────────────────────
exports.getCampaigns = async (req, res, next) => {
  try {
    const campaigns = await NotificationCampaign.findAll({ order: [['created_at', 'DESC']] });
    return sendSuccess(res, 200, 'OK', campaigns);
  } catch (err) {
    next(err);
  }
};

exports.createCampaign = async (req, res, next) => {
  try {
    const campaign = await NotificationCampaign.create(req.body);
    return sendSuccess(res, 201, 'Broadcast campaign created', campaign);
  } catch (err) {
    next(err);
  }
};

// ── 11. SUPPORT DESK ───────────────────────────────────────────
exports.getSupportTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.findAll({ order: [['created_at', 'DESC']] });
    return sendSuccess(res, 200, 'OK', tickets);
  } catch (err) {
    next(err);
  }
};

exports.updateTicketStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const ticket = await SupportTicket.findByPk(req.params.id);
    if (!ticket) return sendError(res, 404, 'NOT_FOUND', 'Ticket not found');
    ticket.status = status;
    await ticket.save();
    return sendSuccess(res, 200, 'Ticket status updated', ticket);
  } catch (err) {
    next(err);
  }
};

// ── 12. CMS ────────────────────────────────────────────────────
exports.getBanners = async (req, res, next) => {
  try {
    const banners = await CMSBanner.findAll({ order: [['sort_order', 'ASC']] });
    return sendSuccess(res, 200, 'OK', banners);
  } catch (err) {
    next(err);
  }
};

exports.getFaqs = async (req, res, next) => {
  try {
    const faqs = await CMSFaq.findAll({ order: [['sort_order', 'ASC']] });
    return sendSuccess(res, 200, 'OK', faqs);
  } catch (err) {
    next(err);
  }
};

// ── 13. SETTINGS & AUDIT LOGS ──────────────────────────────────
exports.getPlatformSettings = async (req, res, next) => {
  try {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = await PlatformSettings.create({});
    }
    return sendSuccess(res, 200, 'OK', settings);
  } catch (err) {
    next(err);
  }
};

exports.updatePlatformSettings = async (req, res, next) => {
  try {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = await PlatformSettings.create(req.body);
    } else {
      await settings.update(req.body);
    }
    return sendSuccess(res, 200, 'Platform settings updated', settings);
  } catch (err) {
    next(err);
  }
};

exports.getAuditLogs = async (req, res, next) => {
  try {
    const logs = await ActivityLog.findAll({ order: [['timestamp', 'DESC']], limit: 100 });
    return sendSuccess(res, 200, 'OK', logs);
  } catch (err) {
    next(err);
  }
};

// ── 14. DASHBOARD STATS & ANALYTICS ────────────────────────────
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalBuyers = await User.count({ where: { role: 'buyer' } });
    const totalSuppliers = await User.count({ where: { role: 'seller' } });
    const verifiedSuppliers = await User.count({ where: { role: 'seller', isVerified: true } });
    const pendingKYC = await KYCApplication.count({ where: { status: 'pending' } });
    const pendingOrders = await Order.count({ where: { status: 'pending' } });
    const rfqsToday = await RFQ.count();

    const todaySum = await Order.sum('grandTotal', {
      where: {
        created_at: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }) || 0;

    const monthlySum = await Order.sum('grandTotal', {
      where: {
        created_at: {
          [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }) || 0;

    const totalOrdersCount = await Order.count();
    const totalVisitors = (totalBuyers + totalSuppliers) || 1;
    const conversionRate = parseFloat(((totalOrdersCount / totalVisitors) * 100).toFixed(1));

    const stats = {
      totalBuyers,
      totalSuppliers,
      verifiedSuppliers,
      pendingKYC,
      pendingOrders,
      todayRevenue: parseFloat(todaySum.toFixed(2)),
      monthlyRevenue: parseFloat(monthlySum.toFixed(2)),
      rfqsToday,
      conversionRate,
      liveUsers: totalBuyers + totalSuppliers,
    };

    return sendSuccess(res, 200, 'OK', stats);
  } catch (err) {
    next(err);
  }
};
