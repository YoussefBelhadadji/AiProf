/**
 * Middleware Index - Central middleware loader
 * Export all middleware functions
 */

const authMiddleware = require('./auth')
const errorHandler = require('./errorHandler')
const validator = require('./validator')
const logging = require('./logging')

module.exports = {
  authMiddleware,
  errorHandler,
  validator,
  logging,
}
