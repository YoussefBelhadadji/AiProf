// LEGACY - Moved during architecture refactor on 2026-04-08
// This was a placeholder stub (not implemented). 
// The real implementation was in backend/src/api/decision.routes.js and is now at backend/src/routes/decision.routes.js.

/**
 * Decision Routes
 */
const express = require('express')
const router = express.Router()

// Placeholder routes
router.get('/:studentId', (req, res) => {
  res.json({ message: 'Get AI decision/feedback for student', studentId: req.params.studentId })
})

module.exports = router