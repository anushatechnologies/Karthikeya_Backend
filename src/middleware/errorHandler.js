const { sendError } = require('../utils/response');

// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  console.error('❌ Unhandled error:', err);

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const details = err.errors ? err.errors.map(e => e.message) : [];
    return sendError(res, 422, 'VALIDATION_ERROR', err.message, details);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'TOKEN_INVALID', 'Token is invalid or expired');
  }

  // Custom app errors
  if (err.statusCode) {
    return sendError(res, err.statusCode, err.code || 'ERROR', err.message);
  }

  // Generic 500
  return sendError(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
};
