const { verifyToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');

module.exports = function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'UNAUTHORIZED', 'Missing or invalid Authorization header');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return sendError(res, 401, 'TOKEN_INVALID', 'Token is invalid or expired');
  }
};
