/**
 * WriteLens Backend Server
 * Main entrypoint for Node.js Express API
 * 
 * Architecture:
 * - Loads environment variables
 * - Creates HTTP server from src/app.js
 * - Starts listening on defined PORT
 * - Does NOT contain any AI/decision logic
 * 
 * All AI decisions → Python via aiBridge.service.js
 */

require('dotenv').config();
const app = require('./src/app');
const config = require('./src/config');

const PORT = config.server.port || 3000;
const HOST = config.server.host || '0.0.0.0';
const NODE_ENV = config.environment;

const server = app.listen(PORT, HOST, () => {
  console.log(`\n✅ WriteLens Backend Server Started`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📍 Server: http://${HOST}:${PORT}`);
  console.log(`⚙️  Environment: ${NODE_ENV}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`\n🔗 Available Endpoints:`);
  console.log(`  GET  /health                    - Health check`);
  console.log(`  POST /api/pipeline/run          - Run AI pipeline`);
  console.log(`  GET  /api/student/:id           - Get student data`);
  console.log(`  POST /api/auth/login            - User authentication`);
  console.log(`  GET  /api/report/:studentId     - Generate report`);
  console.log(`\n💡 Architecture Notes:`);
  console.log(`  • Node = API Gateway ONLY (no logic)`);
  console.log(`  • Python = AI Decision Engine`);
  console.log(`  • Bridge = aiBridge.service.js`);
  console.log(`\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n📛 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed cleanly');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed cleanly');
    process.exit(0);
  });
});

// Unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});
