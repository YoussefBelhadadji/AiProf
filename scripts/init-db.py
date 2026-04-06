#!/usr/bin/env python3
"""
Initialize WriteLens Database using Python
Creates writelens.db with required schema if it doesn't exist
"""

import sqlite3
import os
from pathlib import Path

DB_PATH = Path(__file__).parent / 'writelens.db'

print('🔧 Initializing WriteLens Database...\n')

try:
    # Create database connection
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    print(f'📁 Database path: {DB_PATH}')
    
    # Enable foreign keys
    cursor.execute('PRAGMA foreign_keys = ON')
    
    # Create tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT CHECK(role IN ('student', 'teacher', 'admin')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id TEXT PRIMARY KEY,
            user_id TEXT UNIQUE NOT NULL,
            first_name TEXT,
            last_name TEXT,
            cohort TEXT,
            study_scope TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ''')
    
    cursor.execute('''
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
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS feedback (
            id TEXT PRIMARY KEY,
            submission_id TEXT NOT NULL,
            feedback_text TEXT,
            rule_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS help_seeking_messages (
            id TEXT PRIMARY KEY,
            student_id TEXT NOT NULL,
            message TEXT,
            message_type TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analytics (
            id TEXT PRIMARY KEY,
            student_id TEXT NOT NULL,
            analysis_type TEXT,
            result_json TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
        )
    ''')
    
    conn.commit()
    conn.close()
    
    print('✅ Successfully initialized database!\n')
    print('📊 Created tables:')
    print('   • users')
    print('   • students')
    print('   • submissions')
    print('   • feedback')
    print('   • help_seeking_messages')
    print('   • analytics\n')
    print('✨ Database ready for use!\n')
    
except Exception as e:
    print(f'❌ Error initializing database: {e}')
    exit(1)

if __name__ == '__main__':
    print('Database initialization script completed.')
