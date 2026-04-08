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
