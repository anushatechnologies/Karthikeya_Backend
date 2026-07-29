const { sendError } = require('../utils/response');

/**
 * Role guard factory.
 * Usage: router.use(requireRole('seller'))
 *        router.use(requireRole('seller', 'admin'))
 */
module.exports = function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 403, 'FORBIDDEN', `Requires role: ${roles.join(' or ')}`);
    }
    next();
  };
};
