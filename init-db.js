#!/usr/bin/env node

/**
 * Initialize WriteLens Database
 * Creates writelens.db with required schema if it doesn't exist
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'writelens.db');

console.log('🔧 Initializing WriteLens Database...\n');

try {
  const db = new Database(DB_PATH);
  
  console.log('📁 Database path:', DB_PATH);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Create tables if they don't exist
  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('student', 'teacher', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Students table
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      first_name TEXT,
      last_name TEXT,
      cohort TEXT,
      study_scope TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    -- Writing submissions
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      content TEXT,
      total_score REAL,
      score_gain REAL,
      revision_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
    
    -- Feedback records
    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      submission_id TEXT NOT NULL,
      feedback_text TEXT,
      rule_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
    );
    
    -- Help-seeking messages
    CREATE TABLE IF NOT EXISTS help_seeking_messages (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      message TEXT,
      message_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
    
    -- Analytics results
    CREATE TABLE IF NOT EXISTS analytics (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      analysis_type TEXT,
      result_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
  `);
  
  console.log('✅ Successfully initialized database!\n');
  console.log('📊 Created tables:');
  console.log('   • users');
  console.log('   • students');
  console.log('   • submissions');
  console.log('   • feedback');
  console.log('   • help_seeking_messages');
  console.log('   • analytics\n');
  
  db.close();
  console.log('✨ Database ready for use!\n');
  
} catch (error) {
  console.error('❌ Error initializing database:', error.message);
  process.exit(1);
}
