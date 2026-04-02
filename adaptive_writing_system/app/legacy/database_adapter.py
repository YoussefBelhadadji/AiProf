"""
Database Adapter for Adaptive Writing System
Handles persistence of submissions, analyses, and competence data
"""

import sqlite3
from datetime import datetime
from typing import Dict, List, Optional
import json


class DatabaseAdapter:
    """
    Adapter for SQLite database operations
    Manages: submissions, analyses, learner profiles, competence tracking
    """
    
    def __init__(self, db_path: str = "writelens.db"):
        self.db_path = db_path
        self.connection = None
        self._connect()
        self._ensure_tables()
    
    def _connect(self):
        """Establish database connection"""
        try:
            self.connection = sqlite3.connect(self.db_path)
            self.connection.row_factory = sqlite3.Row
        except Exception as e:
            print(f"Error connecting to database: {e}")
            self.connection = None
    
    def is_connected(self) -> bool:
        """Check if database connection is active"""
        return self.connection is not None
    
    def _ensure_tables(self):
        """Create necessary tables if they don't exist"""
        if not self.is_connected():
            return
        
        cursor = self.connection.cursor()
        
        # Submissions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS submissions (
                id TEXT PRIMARY KEY,
                student_id TEXT NOT NULL,
                assignment_id TEXT,
                submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                text TEXT NOT NULL,
                previous_draft TEXT,
                time_on_task REAL,
                engagement_metrics JSON
            )
        ''')
        
        # Analysis results table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS submission_analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                submission_id TEXT NOT NULL,
                student_id TEXT NOT NULL,
                analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                text_analysis JSON,
                pedagogical_evaluation JSON,
                learner_profile JSON,
                competence_estimate JSON,
                adaptive_feedback JSON,
                FOREIGN KEY (submission_id) REFERENCES submissions(id)
            )
        ''')
        
        # Competence trajectory table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS competence_trajectory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT NOT NULL,
                submission_id TEXT,
                measurement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                overall_competence REAL,
                planning_competence REAL,
                drafting_competence REAL,
                revision_competence REAL,
                metacognitive_competence REAL,
                bayesian_belief JSON
            )
        ''')
        
        # Learner profiles table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS learner_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT NOT NULL,
                profile_type TEXT,
                profile_name TEXT,
                confidence_score REAL,
                profile_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                description TEXT
            )
        ''')
        
        # Feedback and help-seeking table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS feedback_interactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT NOT NULL,
                submission_id TEXT,
                interaction_type TEXT,
                interaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                content TEXT,
                response_quality TEXT,
                FOREIGN KEY (submission_id) REFERENCES submissions(id)
            )
        ''')
        
        self.connection.commit()
    
    def save_submission_analysis(self, student_id: str, assignment_id: str,
                                 submission_id: str, analysis_result: Dict):
        """Save complete submission analysis to database"""
        if not self.is_connected():
            return False
        
        try:
            cursor = self.connection.cursor()
            
            # Save analysis record
            cursor.execute('''
                INSERT INTO submission_analyses
                (submission_id, student_id, text_analysis, pedagogical_evaluation,
                 learner_profile, competence_estimate, adaptive_feedback)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                submission_id,
                student_id,
                json.dumps(analysis_result.get('text_analysis', {})),
                json.dumps(analysis_result.get('pedagogical_evaluation', {})),
                json.dumps(analysis_result.get('learner_profile', {})),
                json.dumps(analysis_result.get('competence', {})),
                json.dumps(analysis_result.get('adaptive_feedback', {})),
            ))
            
            # Save competence trajectory
            competence = analysis_result.get('competence', {})
            bayesian = analysis_result.get('bayesian_competence', {})
            
            cursor.execute('''
                INSERT INTO competence_trajectory
                (student_id, submission_id, overall_competence,
                 planning_competence, drafting_competence,
                 revision_competence, metacognitive_competence, bayesian_belief)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                student_id,
                submission_id,
                competence.get('overall_competence_estimate', 0),
                competence.get('factor_competence', {}).get('planning_competence', 0),
                competence.get('factor_competence', {}).get('drafting_competence', 0),
                competence.get('factor_competence', {}).get('revision_competence', 0),
                competence.get('factor_competence', {}).get('metacognitive_competence', 0),
                json.dumps(bayesian),
            ))
            
            # Save learner profile
            profile = analysis_result.get('learner_profile', {})
            cursor.execute('''
                INSERT INTO learner_profiles
                (student_id, profile_type, profile_name, confidence_score, description)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                student_id,
                profile.get('type'),
                profile.get('name'),
                profile.get('confidence', 0),
                profile.get('description'),
            ))
            
            self.connection.commit()
            return True
        
        except Exception as e:
            print(f"Error saving submission analysis: {e}")
            return False
    
    def get_latest_submission_analysis(self, student_id: str) -> Optional[Dict]:
        """Retrieve latest submission analysis for a student"""
        if not self.is_connected():
            return None
        
        try:
            cursor = self.connection.cursor()
            cursor.execute('''
                SELECT * FROM submission_analyses
                WHERE student_id = ?
                ORDER BY analysis_date DESC
                LIMIT 1
            ''', (student_id,))
            
            row = cursor.fetchone()
            if row:
                return dict(row)
            return None
        
        except Exception as e:
            print(f"Error getting latest analysis: {e}")
            return None
    
    def get_student_feedback_history(self, student_id: str) -> List[Dict]:
        """Get all feedback interactions for a student"""
        if not self.is_connected():
            return []
        
        try:
            cursor = self.connection.cursor()
            cursor.execute('''
                SELECT * FROM submission_analyses
                WHERE student_id = ?
                ORDER BY analysis_date DESC
            ''', (student_id,))
            
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        
        except Exception as e:
            print(f"Error getting feedback history: {e}")
            return []
    
    def get_competence_trajectory(self, student_id: str) -> List[Dict]:
        """Get competence measurements over time"""
        if not self.is_connected():
            return []
        
        try:
            cursor = self.connection.cursor()
            cursor.execute('''
                SELECT * FROM competence_trajectory
                WHERE student_id = ?
                ORDER BY measurement_date ASC
            ''', (student_id,))
            
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        
        except Exception as e:
            print(f"Error getting competence trajectory: {e}")
            return []
    
    def get_progress_indicators(self, student_id: str) -> Dict:
        """Calculate progress indicators for a student"""
        if not self.is_connected():
            return {}
        
        try:
            trajectory = self.get_competence_trajectory(student_id)
            
            if len(trajectory) < 2:
                return {
                    "submissions_count": len(trajectory),
                    "current_competence": trajectory[-1] if trajectory else 0,
                    "trend": "insufficient_data"
                }
            
            # Calculate trend
            first_competence = trajectory[0].get('overall_competence', 0)
            last_competence = trajectory[-1].get('overall_competence', 0)
            improvement = last_competence - first_competence
            
            return {
                "submissions_count": len(trajectory),
                "current_competence": last_competence,
                "initial_competence": first_competence,
                "improvement": round(improvement, 3),
                "trend": "improving" if improvement > 0 else "declining" if improvement < 0 else "stable",
            }
        
        except Exception as e:
            print(f"Error calculating progress: {e}")
            return {}
    
    def get_total_submissions(self) -> int:
        """Get total number of submissions in system"""
        if not self.is_connected():
            return 0
        
        try:
            cursor = self.connection.cursor()
            cursor.execute('SELECT COUNT(*) as count FROM submissions')
            return cursor.fetchone()['count']
        except Exception:
            return 0
    
    def get_unique_students_count(self) -> int:
        """Get count of unique students"""
        if not self.is_connected():
            return 0
        
        try:
            cursor = self.connection.cursor()
            cursor.execute('SELECT COUNT(DISTINCT student_id) as count FROM submissions')
            return cursor.fetchone()['count']
        except Exception:
            return 0
    
    def get_profile_distribution(self) -> Dict:
        """Get distribution of learner profiles"""
        if not self.is_connected():
            return {}
        
        try:
            cursor = self.connection.cursor()
            cursor.execute('''
                SELECT profile_type, COUNT(*) as count
                FROM learner_profiles
                GROUP BY profile_type
            ''')
            
            rows = cursor.fetchall()
            return {row['profile_type']: row['count'] for row in rows}
        except Exception:
            return {}
    
    def get_competence_distribution(self) -> Dict:
        """Get distribution of competence levels"""
        if not self.is_connected():
            return {}
        
        try:
            cursor = self.connection.cursor()
            
            # Get latest competence for each student
            cursor.execute('''
                SELECT AVG(overall_competence) as avg_competence
                FROM (
                    SELECT DISTINCT ON (student_id) *
                    FROM competence_trajectory
                    ORDER BY student_id, measurement_date DESC
                )
            ''')
            
            row = cursor.fetchone()
            return {
                "average_competence": row['avg_competence'] if row else 0,
                "last_updated": datetime.now().isoformat()
            }
        except Exception:
            return {}
    
    def get_intervention_needs_count(self) -> int:
        """Count students needing intervention"""
        if not self.is_connected():
            return 0
        
        try:
            cursor = self.connection.cursor()
            cursor.execute('''
                SELECT COUNT(DISTINCT student_id) as count
                FROM competence_trajectory
                WHERE overall_competence < 0.4
            ''')
            return cursor.fetchone()['count']
        except Exception:
            return 0


if __name__ == "__main__":
    db = DatabaseAdapter()
    print("Database adapter initialized")
    print(f"Connected: {db.is_connected()}")
    print(f"Total submissions: {db.get_total_submissions()}")
    print(f"Total students: {db.get_unique_students_count()}")
