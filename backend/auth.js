const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const isProduction = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET?.trim() || (isProduction ? '' : 'writelens-local-dev-secret');

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set');
}

if (!process.env.JWT_SECRET && !isProduction) {
  console.warn('[auth] JWT_SECRET is not set. Using a local development fallback secret.');
}

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      displayName: user.display_name
    },
    JWT_SECRET,
    { expiresIn: '24h' }  // FIX: Increased from 15m to 24h for research workflows
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Middleware to protect routes that require authentication
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }

  req.user = decoded;
  next();
}

// Middleware to restrict access based on roles
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient role permissions' });
    }
    next();
  };
}

module.exports = {
  generateToken,
  verifyToken,
  requireAuth,
  requireRole,
  bcrypt
};
