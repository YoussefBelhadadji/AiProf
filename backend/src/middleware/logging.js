/**
 * Request Logging Middleware
 * Log all incoming requests
 */

module.exports = (req, res, next) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    const method = req.method.padEnd(6)
    const status = res.statusCode
    const path = req.path
    
    console.log(`[${new Date().toISOString()}] ${method} ${status} ${path} (+${duration}ms)`)
  })
  
  next()
}
