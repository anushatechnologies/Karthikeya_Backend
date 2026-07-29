const { Op }                       = require('sequelize');
const { Product, Category, User, ProductPricingTier } = require('../models/index');
const { sendSuccess, sendError }   = require('../utils/response');

// ── Shared product serializer ────────────────────────────────────
function serializeProduct(p) {
  return {
    id:               p.id,
    name:             p.name,
    description:      p.description,
    images:           p.images || [],
    categoryId:       p.categoryId,
    categoryName:     p.category?.name,
    sellerId:         p.sellerId,
    sellerName:       p.seller?.fullName,
    sellerAvatar:     p.seller?.avatar,
    sellerVerified:   p.seller?.isVerified,
    price:            parseFloat(p.price),
    priceType:        p.priceType,
    currency:         p.currency,
    minOrderQty:      p.minOrderQty,
    unit:             p.unit,
    specifications:   p.specifications || {},
    tags:             p.tags || [],
    location:         p.location,
    rating:           parseFloat(p.rating),
    reviewCount:      p.reviewCount,
    isActive:         p.isActive,
    bulkPricingTiers: (p.bulkPricingTiers || []).map(t => ({
      minQty: t.minQty,
      maxQty: t.maxQty,
      price:  parseFloat(t.price),
    })),
    createdAt: p.created_at,
  };
}

const INCLUDE = [
  { model: Category,           as: 'category',          attributes: ['id', 'name'] },
  { model: User,               as: 'seller',             attributes: ['id', 'fullName', 'avatar', 'isVerified'] },
  { model: ProductPricingTier, as: 'bulkPricingTiers',   attributes: ['minQty', 'maxQty', 'price'] },
];

// ── 3.2 GET /products ───────────────────────────────────────────
exports.getProducts = async (req, res, next) => {
  try {
    const {
      search, categoryId, location,
      priceMin, priceMax, maxMoq,
      verifiedOnly, priceType,
      sortBy = 'newest',
      page = 1, limit = 20,
    } = req.query;

    const where = { isActive: true };
    if (search)      where.name        = { [Op.like]: `%${search}%` };
    if (categoryId)  where.categoryId  = categoryId;
    if (location)    where.location    = { [Op.like]: `%${location}%` };
    if (priceType)   where.priceType   = priceType;
    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) where.price[Op.gte] = parseFloat(priceMin);
      if (priceMax) where.price[Op.lte] = parseFloat(priceMax);
    }
    if (maxMoq) where.minOrderQty = { [Op.lte]: parseInt(maxMoq) };

    // Handle verifiedOnly via seller join
    const include = [...INCLUDE];
    if (verifiedOnly === 'true') {
      include[1] = { ...include[1], where: { isVerified: true }, required: true };
    }

    const orderMap = {
      relevance:  [['rating', 'DESC']],
      price_asc:  [['price', 'ASC']],
      price_desc: [['price', 'DESC']],
      newest:     [['created_at', 'DESC']],
      rating:     [['rating', 'DESC']],
    };
    const order = orderMap[sortBy] || orderMap.newest;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Product.findAndCountAll({
      where, include, order,
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    return sendSuccess(res, 200, 'OK', {
      products:   rows.map(serializeProduct),
      total:      count,
      page:       parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (err) {
    next(err);
  }
};

// ── 3.3 GET /products/:id ───────────────────────────────────────
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, { include: INCLUDE });
    if (!product) return sendError(res, 404, 'NOT_FOUND', 'Product not found');
    return sendSuccess(res, 200, 'OK', serializeProduct(product));
  } catch (err) {
    next(err);
  }
};

// ── 3.4 GET /suppliers/:sellerId ────────────────────────────────
exports.getSupplier = async (req, res, next) => {
  try {
    const seller = await User.findOne({
      where: { id: req.params.sellerId, role: 'seller' },
      attributes: ['id', 'fullName', 'companyName', 'businessType', 'gstNumber', 'address', 'avatar', 'isVerified', 'created_at'],
    });
    if (!seller) return sendError(res, 404, 'NOT_FOUND', 'Supplier not found');

    const products = await Product.findAll({
      where: { sellerId: seller.id, isActive: true },
      include: INCLUDE,
      order: [['created_at', 'DESC']],
    });

    return sendSuccess(res, 200, 'OK', {
      seller,
      products: products.map(serializeProduct),
    });
  } catch (err) {
    next(err);
  }
};
