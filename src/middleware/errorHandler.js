const { sendError } = require('../utils/response');

// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  console.error('❌ Unhandled error:', err);

  // Sequelize validation errors / Unique constraint errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const details = err.errors ? err.errors.map(e => e.message) : [];
    const mainMsg = details[0] || err.message || 'Validation error';
    return sendError(res, 422, 'VALIDATION_ERROR', mainMsg, details);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'TOKEN_INVALID', 'Token is invalid or expired');
  }

  // Custom app errors
  if (err.statusCode) {
    return sendError(res, err.statusCode, err.code || 'ERROR', err.message);
  }

  // Generic 500 with actual error detail fallback
  const errMsg = err.message || 'An unexpected error occurred';
  return sendError(res, 500, 'INTERNAL_ERROR', errMsg);
};
