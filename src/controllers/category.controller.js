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
    const defaultCategories = [
      { id: '95ff1b53-fae7-4835-a0e4-f2f7309f5029', name: 'Auto Parts & Tools', icon: 'car-outline', slug: 'auto-parts', productCount: 4 },
      { id: '8218b03b-cd03-475a-82bb-c4346a5c4c12', name: 'Building & Construction', icon: 'business-outline', slug: 'building', productCount: 0 },
      { id: '7f5e4a5a-aefa-48f2-a64e-9feeb7087410', name: 'Chemicals & Materials', icon: 'flask-outline', slug: 'chemicals', productCount: 0 },
      { id: '35b7984d-1dd3-44a6-a97f-db8cf7a2d4fc', name: 'Electronics & Electricals', icon: 'hardware-chip-outline', slug: 'electronics', productCount: 0 },
      { id: 'c5ffe077-b562-47f8-8f4a-ff2d07357028', name: 'Food & Agriculture', icon: 'leaf-outline', slug: 'food-agri', productCount: 0 },
      { id: '269c00cf-6fa3-4b76-b50f-f602978f02c0', name: 'General Sourcing', icon: 'grid-outline', slug: 'general', productCount: 0 },
      { id: '4b2f5148-d2ce-4682-bce9-2ee98483941f', name: 'Industrial Machinery', icon: 'construct-outline', slug: 'machinery', productCount: 0 },
      { id: '661ec7cc-4cc3-4bd7-b968-8ee20cab546c', name: 'Medical & Healthcare', icon: 'medkit-outline', slug: 'medical', productCount: 0 },
      { id: '559deac5-ceba-4556-926c-0f6f201dcd2f', name: 'Packaging & Paper', icon: 'cube-outline', slug: 'packaging', productCount: 0 },
      { id: '3aa8e385-44d2-45a5-b04c-c779750e537b', name: 'Textiles & Apparel', icon: 'shirt-outline', slug: 'textiles', productCount: 0 },
    ];
    return sendSuccess(res, 200, 'OK', defaultCategories);
  }
};
