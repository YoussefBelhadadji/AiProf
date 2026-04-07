/**
 * Central Routes Aggregator
 * All API routes defined in one place
 */

const router = require('express').Router()

try {
  const authRoutes = require('./auth')
  const studentRoutes = require('./student')
  const pipelineRoutes = require('./pipeline')
  const reportRoutes = require('./report')
  const decisionRoutes = require('./decision')

  // Register routes
  router.use('/auth', authRoutes)
  router.use('/student', studentRoutes)
  router.use('/pipeline', pipelineRoutes)
  router.use('/report', reportRoutes)
  router.use('/decision', decisionRoutes)

  console.log('✅ All routes loaded successfully')
} catch (err) {
  console.error('⚠️ Error loading routes:', err.message)
}

module.exports = router
