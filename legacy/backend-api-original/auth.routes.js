// LEGACY - Moved during architecture refactor on 2026-04-08
// These were the real route implementations, now moved to backend/src/routes/.
// Do not import from here.

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config');

// Instructor accounts only — replace with DB lookup when ready (no student/admin demo users)
const TEACHER_ACCOUNTS = [
  { id: '2', username: 'teacher', password: 'teacher123', role: 'teacher', displayName: 'Instructor' },
];

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = TEACHER_ACCOUNTS.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiration }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      displayName: user.displayName,
    },
  });
});

// POST /api/auth/verify
router.post('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });

  const token = authHeader.replace('Bearer ', '');
  try {
    jwt.verify(token, config.jwt.secret);
    return res.json({ valid: true });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
