const express = require('express');
const router = express.Router();
const pipelineController = require('../controllers/pipeline.controller');

// STRICT API ROUTE -> Call Pipeline Controller -> Return Validated Output.
// Routes are mounted at /api/pipeline in app.js, so use relative paths only
router.post('/run', pipelineController.runPipeline);

module.exports = router;
