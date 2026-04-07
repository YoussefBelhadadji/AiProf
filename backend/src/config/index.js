/**
 * Central Configuration Loader
 * Load all environment variables and expose single source of truth
 */

require('dotenv').config()

module.exports = {
  // Server
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key',
    expiration: process.env.JWT_EXPIRATION || '24h',
  },

  // Python AI Bridge
  python: {
    bridgePath: process.env.PYTHON_BRIDGE_PATH || '../../ai_engine/main.py',
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    filePath: process.env.LOG_FILE_PATH || './logs/app.log',
  },
}
