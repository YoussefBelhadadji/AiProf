/**
 * Database Service (PostgreSQL)
 * =============================
 * 
 * Handles all database operations:
 * - User/Student/Assignment queries
 * - Storing AI decision results (NOT creating them)
 * - General CRUD operations
 * 
 * Does NOT:
 * ❌ Make decisions
 * ❌ Evaluate rules
 * ❌ Analyze data
 */

const { Pool } = require('pg');
const logger = require('./logger');

// Initialize connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'writelens'
});

/**
 * Get student by ID from database
 */
exports.getStudent = async (studentId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM students WHERE id = $1',
      [studentId]
    );
    return result.rows[0] || null;
  } catch (error) {
    logger.error(`Failed to get student ${studentId}:`, error);
    throw error;
  }
};

/**
 * Store AI decision result in database
 * This just STORES what Python computed - doesn't create decisions
 */
exports.storeDecision = async (studentId, aiDecisionJson) => {
  try {
    const result = await pool.query(
      `INSERT INTO decisions (student_id, ai_decision_json, decision_timestamp, pipeline_version)
       VALUES ($1, $2, NOW(), $3)
       RETURNING id`,
      [studentId, JSON.stringify(aiDecisionJson), 'v1']
    );
    return result.rows[0];
  } catch (error) {
    logger.error(`Failed to store decision for ${studentId}:`, error);
    throw error;
  }
};

/**
 * Get assignment submissions for a student
 */
exports.getSubmissions = async (studentId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM assignments WHERE student_id = $1 ORDER BY submitted_at DESC',
      [studentId]
    );
    return result.rows;
  } catch (error) {
    logger.error(`Failed to get submissions for ${studentId}:`, error);
    throw error;
  }
};

/**
 * Create a new user (registration)
 */
exports.createUser = async (email, passwordHash, role) => {
  try {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING id, email`,
      [email, passwordHash, role]
    );
    return result.rows[0];
  } catch (error) {
    logger.error(`Failed to create user ${email}:`, error);
    throw error;
  }
};

/**
 * Health check
 */
exports.healthCheck = async () => {
  try {
    await pool.query('SELECT 1');
    return { status: 'healthy' };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
};

/**
 * Close pool connection
 */
exports.close = async () => {
  await pool.end();
};

module.exports = exports;
