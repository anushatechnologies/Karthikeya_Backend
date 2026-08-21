const { Category } = require('../models/index');
const { sendSuccess, sendError } = require('../utils/response');

// ── 3.1 GET /categories ─────────────────────────────────────────
exports.getCategories = async (req, res, next) => {
  try {
    let categories = await Category.findAll({
      attributes: ['id', 'name', 'icon', 'slug', 'productCount'],
      order: [['name', 'ASC']],
    });

    if (!categories || categories.length === 0) {
      const defaultCategories = [
        { name: 'Industrial Machinery', icon: 'construct-outline', slug: 'machinery', productCount: 0 },
        { name: 'Electronics & Electricals', icon: 'hardware-chip-outline', slug: 'electronics', productCount: 0 },
        { name: 'Textiles & Apparel', icon: 'shirt-outline', slug: 'textiles', productCount: 0 },
        { name: 'Chemicals & Materials', icon: 'flask-outline', slug: 'chemicals', productCount: 0 },
        { name: 'Auto Parts & Tools', icon: 'car-outline', slug: 'auto-parts', productCount: 0 },
        { name: 'Building & Construction', icon: 'business-outline', slug: 'building', productCount: 0 },
        { name: 'Food & Agriculture', icon: 'leaf-outline', slug: 'food-agri', productCount: 0 },
        { name: 'Packaging & Paper', icon: 'cube-outline', slug: 'packaging', productCount: 0 },
        { name: 'Medical & Healthcare', icon: 'medkit-outline', slug: 'medical', productCount: 0 },
        { name: 'General Sourcing', icon: 'grid-outline', slug: 'general', productCount: 0 },
      ];

      await Category.bulkCreate(defaultCategories);
      categories = await Category.findAll({
        attributes: ['id', 'name', 'icon', 'slug', 'productCount'],
        order: [['name', 'ASC']],
      });
    }

    return sendSuccess(res, 200, 'OK', categories);
  } catch (err) {
    next(err);
  }
};
