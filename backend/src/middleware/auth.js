/**
 * Authentication Middleware
 * Verify JWT tokens and attach user to request
 */

const jwt = require('jsonwebtoken')
const config = require('../config')

const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded = jwt.verify(token, config.jwt.secret)
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

module.exports = { verifyToken }
