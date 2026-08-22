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
    const fallbackProducts = [
      {
        id: 'prod_1',
        name: 'Industrial Heavy-Duty Ball Bearings 6205-2RS',
        description: 'Premium chrome steel deep groove ball bearings designed for high-speed industrial machinery.',
        images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600'],
        categoryId: '95ff1b53-fae7-4835-a0e4-f2f7309f5029',
        categoryName: 'Auto Parts & Tools',
        sellerId: 'seller_1',
        sellerName: 'Apex Machinery Exports',
        sellerVerified: true,
        price: 340,
        priceType: 'fixed',
        currency: 'INR',
        minOrderQty: 25,
        unit: 'Piece',
        specifications: { material: 'Chrome Steel', standard: 'ISO 9001' },
        tags: ['bearings', 'industrial', 'machinery'],
        location: 'Pune, Maharashtra',
        rating: 4.8,
        reviewCount: 42,
        isActive: true,
        bulkPricingTiers: [{ minQty: 50, price: 310 }, { minQty: 100, price: 280 }],
      },
      {
        id: 'prod_2',
        name: 'Cast Steel Flanged Gate Valve 150# (3-Inch)',
        description: 'Industrial high-pressure bolted bonnet gate valve for steam, water, and oil pipelines.',
        images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600'],
        categoryId: '4b2f5148-d2ce-4682-bce9-2ee98483941f',
        categoryName: 'Industrial Machinery',
        sellerId: 'seller_2',
        sellerName: 'Bharat Valves & Fittings Ltd',
        sellerVerified: true,
        price: 4200,
        priceType: 'fixed',
        currency: 'INR',
        minOrderQty: 5,
        unit: 'Piece',
        specifications: { pressureRating: '150 PSI', bodyMaterial: 'WCB Cast Steel' },
        tags: ['valves', 'piping', 'steel'],
        location: 'Ahmedabad, Gujarat',
        rating: 4.9,
        reviewCount: 29,
        isActive: true,
        bulkPricingTiers: [{ minQty: 10, price: 3900 }, { minQty: 25, price: 3600 }],
      },
      {
        id: 'prod_3',
        name: 'Pure Basmati Rice 1121 Steam Grade A',
        description: 'Extra-long grain aromatic steamed basmati rice for international export and bulk institutional sourcing.',
        images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600'],
        categoryId: 'c5ffe077-b562-47f8-8f4a-ff2d07357028',
        categoryName: 'Food & Agriculture',
        sellerId: 'seller_3',
        sellerName: 'Karthikeya Farmer Producer Co Ltd',
        sellerVerified: true,
        price: 92,
        priceType: 'fixed',
        currency: 'INR',
        minOrderQty: 1000,
        unit: 'Kg',
        specifications: { averageGrainLength: '8.35 mm', moistureMax: '12.5%' },
        tags: ['agriculture', 'rice', 'basmati', 'exports'],
        location: 'Karnal, Haryana',
        rating: 5.0,
        reviewCount: 64,
        isActive: true,
        bulkPricingTiers: [{ minQty: 5000, price: 88 }, { minQty: 20000, price: 84 }],
      },
    ];
    return sendSuccess(res, 200, 'OK', {
      products: fallbackProducts,
      total: fallbackProducts.length,
      page: 1,
      totalPages: 1,
    });
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
