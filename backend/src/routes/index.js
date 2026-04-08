/**
 * Central Routes Aggregator
 * All API routes defined in one place
 */

const express = require('express')
const router = express.Router()

try {
  const authRoutes = require('./auth.routes')
  const studentRoutes = require('./student.routes')
  const pipelineRoutes = require('./pipeline.routes')
  const reportRoutes = require('./report.routes')
  const decisionRoutes = require('./decision.routes')
  const casesRoutes = require('./cases.routes')

  // Register routes
  router.use('/auth', authRoutes)
  router.use('/student', studentRoutes)
  router.use('/pipeline', pipelineRoutes)
  router.use('/report', reportRoutes)
  router.use('/decision', decisionRoutes)
  router.use('/cases', casesRoutes)

  console.log('✅ All routes loaded successfully')
} catch (err) {
  console.error('⚠️ Error loading routes:', err.message)
}

module.exports = router
