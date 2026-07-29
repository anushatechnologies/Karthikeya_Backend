/**
 * Standard success response — matches spec schema:
 * { "success": true, "message": "...", "data": { ... } }
 */
function sendSuccess(res, statusCode = 200, message = 'OK', data = {}) {
  return res.status(statusCode).json({ success: true, message, data });
}

/**
 * Standard error response — matches spec schema:
 * { "success": false, "error": { "code": "...", "message": "...", "details": [] } }
 */
function sendError(res, statusCode = 500, code = 'ERROR', message = 'An error occurred', details = []) {
  return res.status(statusCode).json({
    success: false,
    error: { code, message, details },
  });
}

/**
 * Throw a formatted app error (caught by errorHandler middleware).
 */
function createAppError(statusCode, code, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

module.exports = { sendSuccess, sendError, createAppError };
