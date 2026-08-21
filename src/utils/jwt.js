const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tradehub_jwt_b2b_kfpl_prod_secret_2026_xK9mQ7';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { signToken, verifyToken };
