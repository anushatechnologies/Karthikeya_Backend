const { sendError } = require('../utils/response');

const ADMIN_ROLES = [
  'admin',
  'super_admin',
  'platform_admin',
  'support_admin',
  'finance_admin',
  'moderator',
  'operations_admin',
  'marketing_admin',
  'readonly_admin',
];

/**
 * Role guard factory.
 * Usage: router.use(requireRole('seller'))
 *        router.use(requireRole('admin'))
 */
module.exports = function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
    }

    const userRole = req.user.role;
    const isAllowed = roles.some((role) => {
      if (role === 'admin') {
        return ADMIN_ROLES.includes(userRole);
      }
      return userRole === role;
    });

    if (!isAllowed) {
      return sendError(res, 403, 'FORBIDDEN', `Requires role: ${roles.join(' or ')}`);
    }

    next();
  };
};
