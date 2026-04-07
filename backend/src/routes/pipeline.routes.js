const express = require('express');
const router = express.Router();
const pipelineController = require('../controllers/pipeline.controller');

// STRICT API ROUTE -> Call Pipeline Controller -> Return Validated Output.
// Removed the redundant '/api' prefix because app.js already mounts this router at '/api'
router.post('/pipeline/run', pipelineController.runPipeline);

module.exports = router;
