const aiBridge = require('../services/aiBridge.service');

/**
 * Validates incoming payload and delegates to the AI bridge.
 * Acts as the standard controller handling req/res lifecycle.
 */
exports.runPipeline = async (req, res, next) => {
  try {
    const { score, days, word_count } = req.body;

    // Simple validation
    if (typeof score !== 'number' || typeof days !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: score and days must be numbers.',
      });
    }

    const payload = { score, days, word_count: word_count || 0 };

    // Delegate to the AI Engine subprocess wrapper
    const output = await aiBridge.runAiPipeline(payload);
    
    // Check if the python script failed or caught an error
    if (output && output.success === false) {
       return res.status(500).json(output);
    }

    return res.status(200).json(output);
  } catch (error) {
    next(error);
  }
};
