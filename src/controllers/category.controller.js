const { Category } = require('../models/index');
const { sendSuccess, sendError } = require('../utils/response');

// ── 3.1 GET /categories ─────────────────────────────────────────
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name', 'icon', 'slug', 'productCount'],
      order: [['name', 'ASC']],
    });
    return sendSuccess(res, 200, 'OK', categories);
  } catch (err) {
    next(err);
  }
};
