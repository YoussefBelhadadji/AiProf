// LEGACY - Moved during architecture refactor on 2026-04-08
// These were the real route implementations, now moved to backend/src/routes/.
// Do not import from here.

const express = require('express');
const router = express.Router();

// GET /api/cases — returns empty list (Python AI engine not connected yet)
router.get('/', (req, res) => {
  res.json({ count: 0, cases: [], message: 'No cases loaded. Upload a workbook to get started.' });
});

// GET /api/auto-load — same stub
router.get('/auto-load', (req, res) => {
  res.json({ count: 0, cases: [], message: 'No workbook auto-loaded.' });
});

module.exports = router;
