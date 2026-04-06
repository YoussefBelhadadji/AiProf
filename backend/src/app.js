const express = require('express');
const cors = require('cors');

const app = express();

// ============= Middleware =============
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============= Health Check =============
app.get('/health', (req, res) => {
  res.json({ 
    status: 'running',
    timestamp: new Date().toISOString(),
    service: 'writelens-backend'
  });
});

// ============= API Routes =============
const router = express.Router();

// Import and use individual route modules
try {
  router.use(require('./api/student.routes'));
  router.use(require('./api/pipeline.routes'));
  router.use(require('./api/auth.routes'));
  router.use(require('./api/report.routes'));
} catch (err) {
  console.warn('Some routes failed to load:', err.message);
}

app.use('/api', router);

// ============= Error Handling =============
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
