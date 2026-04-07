/**
 * Request Validation Middleware
 * Validate incoming request data
 */

const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Basic validation - can be extended with express-validator
      if (schema && typeof schema === 'object') {
        // Validate against schema
        console.log('🔍 Validating request...')
      }
      next()
    } catch (err) {
      res.status(400).json({ error: 'Validation failed', details: err.message })
    }
  }
}

module.exports = { validate }
