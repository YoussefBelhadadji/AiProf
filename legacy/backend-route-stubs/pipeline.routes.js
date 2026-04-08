// LEGACY - Moved during architecture refactor on 2026-04-08
// This was a placeholder stub (not implemented). 
// The real implementation was in backend/src/api/pipeline.routes.js and is now at backend/src/routes/pipeline.routes.js.

/**
 * AI Pipeline Routes
 */
const express = require('express')
const router = express.Router()

// Placeholder routes
router.post('/run', (req, res) => {
  res.json({ message: 'Run AI pipeline - not implemented yet' })
})

router.get('/:id', (req, res) => {
  res.json({ message: 'Get pipeline results', pipelineId: req.params.id })
})

module.exports = router
