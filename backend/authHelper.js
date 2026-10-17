const jwt = require('jsonwebtoken');

function verifyAdminToken(request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return { valid: false, error: 'No token provided. Admin access required.', status: 401 };
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'lansakara_luxury_super_secret_key_2026');
    return { valid: true, admin: decoded };
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return { valid: false, error: 'Token expired. Please login again.', status: 401 };
    }
    return { valid: false, error: 'Invalid token. Access denied.', status: 401 };
  }
}

module.exports = { verifyAdminToken };
