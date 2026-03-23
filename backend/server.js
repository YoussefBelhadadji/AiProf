const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { parseWorkbook } = require('./workbookParser');
const { buildAnalyticsSummary } = require('./liveAnalytics');
const { execFile, spawnSync } = require('child_process');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const REQUIRED_PIPELINE_FILES = ['moodle_logs.csv', 'rubric_scores.csv', 'essays.csv', 'messages.csv'];

app.use(cors());
app.use(express.json());

function resolvePythonCommand() {
  const configured = process.env.PYTHON_BIN?.trim();
  const candidates = configured
    ? [configured]
    : process.platform === 'win32'
      ? ['python', 'py']
      : ['python3', 'python'];

  for (const candidate of candidates) {
    const probeArgs = candidate === 'py' ? ['-3', '--version'] : ['--version'];
    const result = spawnSync(candidate, probeArgs, { encoding: 'utf8' });
    if (!result.error && result.status === 0) {
      return candidate;
    }
  }

  return null;
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'WriteLens Backend Operations Active.' });
});

app.post('/api/upload-dataset', upload.any(), (req, res) => {
  const files = Array.isArray(req.files) ? req.files : [];

  if (files.length === 0) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const parsedCases = files.map((file) => parseWorkbook(file.buffer, file.originalname));
    const { cases, analytics } = buildAnalyticsSummary(parsedCases);
    const firstCase = cases[0];
    const studentCount = cases.reduce((sum, result) => sum + result.data.length, 0);

    res.json({
      message: 'Processing complete',
      workbookCount: cases.length,
      studentCount,
      analytics,
      cases,
      ...firstCase,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Failed to process dataset: ${error.message}` });
  }
});

app.post('/api/run-pipeline', upload.any(), (req, res) => {
  const files = Array.isArray(req.files) ? req.files : [];
  
  if (files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const uploadedByName = new Map(files.map((file) => [String(file.originalname).toLowerCase(), file]));
  const missingFiles = REQUIRED_PIPELINE_FILES.filter((filename) => !uploadedByName.has(filename));

  if (missingFiles.length > 0) {
    return res.status(400).json({
      error: 'Missing required pipeline files.',
      required_files: REQUIRED_PIPELINE_FILES,
      missing_files: missingFiles,
    });
  }

  const pipelineDir = path.resolve(__dirname, '../adaptive_writing_system');
  const dataDir = path.join(pipelineDir, 'data');
  const outputsDir = path.join(pipelineDir, 'outputs');
  const pythonCommand = resolvePythonCommand();

  if (!pythonCommand) {
    return res.status(500).json({
      error: 'Python runtime is unavailable for the adaptive pipeline.',
      required_files: REQUIRED_PIPELINE_FILES,
    });
  }

  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(outputsDir)) {
      fs.mkdirSync(outputsDir, { recursive: true });
    }
  } catch(err) {
    return res.status(500).json({ error: `Failed to create data dir: ${err.message}` });
  }

  try {
    REQUIRED_PIPELINE_FILES.forEach((filename) => {
      const uploaded = uploadedByName.get(filename);
      const filePath = path.join(dataDir, filename);
      fs.writeFileSync(filePath, uploaded.buffer);
    });
    const feedbackOutput = path.join(outputsDir, '08_feedback.csv');
    if (fs.existsSync(feedbackOutput)) {
      fs.unlinkSync(feedbackOutput);
    }
    const intermediateOutputs = [
      '01_merged.csv',
      '02_features.csv',
      '03_thresholds.csv',
      '04_clustered.csv',
      '05_rf.csv',
      '05_rf_importance.csv',
      '06_bayes.csv',
      '07_rules.csv',
    ];
    intermediateOutputs.forEach((filename) => {
      const fullPath = path.join(outputsDir, filename);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });
  } catch (err) {
    return res.status(500).json({ error: `Failed to save files: ${err.message}` });
  }

  const commandArgs = pythonCommand === 'py' ? ['-3', 'app/run_pipeline.py'] : ['app/run_pipeline.py'];
  execFile(pythonCommand, commandArgs, { cwd: pipelineDir, timeout: 120000 }, (error, stdout, stderr) => {
    if (error) {
       console.error(`Pipeline execution error: ${error.message}`);
       return res.status(500).json({
         error: 'Python pipeline failed',
         details: stderr || error.message,
         python_command: pythonCommand,
       });
    }

    const feedbackOutput = path.join(outputsDir, '08_feedback.csv');
    if (!fs.existsSync(feedbackOutput)) {
       return res.status(500).json({ error: 'Pipeline did not produce expected output csv.' });
    }

    const content = fs.readFileSync(feedbackOutput, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 1) {
       return res.json({ result: [] });
    }
    
    res.json({ result_csv: content, stdout });
  });
});

const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
const frontendIndexPath = path.join(frontendDistPath, 'index.html');

if (fs.existsSync(frontendIndexPath)) {
  app.use(express.static(frontendDistPath));

  app.get(/^(?!\/api(?:\/|$)).*/, (req, res) => {
    res.sendFile(frontendIndexPath);
  });
} else {
  app.get('/', (req, res) => {
    res.status(503).json({
      status: 'frontend_missing',
      message: 'Backend is running, but the frontend production build was not found.',
      expectedPath: frontendIndexPath,
    });
  });
}

const PORT = Number(process.env.PORT || 3001);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log(
      fs.existsSync(frontendIndexPath)
        ? `Frontend build detected at ${frontendIndexPath}`
        : `Frontend build missing at ${frontendIndexPath}`
    );
  });
}

module.exports = {
  app,
};
