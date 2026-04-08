const express = require('express');
const router = express.Router();

// STRICT API ROUTE for basic DB retrieval operations without analytical overhead.
// Routes are mounted at /api/student in app.js, so use relative paths only
router.get('/:id', async (req, res) => {
  try {
    // db.service call here...
    res.json({ id: req.params.id, message: 'Student fetched directly from data' });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

module.exports = router;
