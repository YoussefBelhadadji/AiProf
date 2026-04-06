const express = require('express');
const router = express.Router();
const aiBridge = require('../services/aiBridge.service');

// STRICT API ROUTE -> Call AI Engine Bridge -> Return Output.
router.post('/api/pipeline/run', async (req, res) => {
  try {
    const output = await aiBridge.runAiPipeline(req.body);
    res.json(output);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

module.exports = router;
