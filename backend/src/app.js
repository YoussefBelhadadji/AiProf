const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');
const { logging, errorHandler } = require('./middleware');

const app = express();

// ============= Middleware =============
app.use(logging);
app.use(cors(config.cors));
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
app.use('/api', routes);

// ============= Error Handling =============
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

app.use(errorHandler);

module.exports = app;
