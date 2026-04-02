"""
Backend API for Adaptive Writing System
Flask/Python endpoints for submission analysis and feedback generation
Integrates all adaptive engines
"""

from flask import Flask, request, jsonify
import json
from datetime import datetime
from typing import Dict, Optional
import traceback

# Import adaptive system components
from .adaptive_system import AdaptiveWritingSystem, AdaptiveWritingAPI
from .database_adapter import DatabaseAdapter

# Initialize Flask app
app = Flask(__name__)


@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    return response

# Initialize adaptive system
adaptive_system = AdaptiveWritingSystem()
api = AdaptiveWritingAPI()
db = DatabaseAdapter()


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "WriteLens Adaptive System",
        "version": "1.0.0"
    })


@app.route('/api/submissions/analyze', methods=['POST'])
def analyze_submission():
    """
    POST /api/submissions/analyze
    
    Analyze a student submission and return adaptive feedback
    
    Request body:
    {
        "student_id": string,
        "assignment_id": string,
        "submission_id": string,
        "text": string,
        "previous_draft": optional string,
        "rubric_scores": optional {
            "rubric_organization": 1-5,
            "rubric_argument": 1-5,
            "rubric_cohesion": 1-5,
            "rubric_clarity": 1-5
        },
        "time_on_task": optional number (minutes),
        "engagement_metrics": optional {
            "rubric_views": number,
            "assignment_views": number,
            "revision_frequency": number,
            "feedback_views": number,
            "help_messages": number,
            "time_to_first_action": string
        }
    }
    
    Response:
    {
        "success": true,
        "data": {
            "submission_id": string,
            "text_analysis": {...},
            "pedagogical_evaluation": {...},
            "learner_profile": {...},
            "competence": {...},
            "adaptive_feedback": {...},
            "adaptive_strategy": {...},
            "next_steps": [...]
        }
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('text'):
            return jsonify({
                "success": False,
                "error": "Missing required field: text"
            }), 400
        
        if not data.get('student_id'):
            return jsonify({
                "success": False,
                "error": "Missing required field: student_id"
            }), 400
        
        # Process submission through adaptive system
        response = adaptive_system.process_submission(data)
        
        # Save response to database (optional)
        if db.is_connected():
            try:
                db.save_submission_analysis(
                    student_id=data.get('student_id'),
                    assignment_id=data.get('assignment_id'),
                    submission_id=response.get('submission_id'),
                    analysis_result=response
                )
            except Exception as db_error:
                print(f"Warning: Could not save to database: {db_error}")
                # Don't fail the request if database save fails
        
        return jsonify({
            "success": True,
            "data": response,
            "timestamp": datetime.now().isoformat()
        }), 200
    
    except Exception as e:
        print(f"Error analyzing submission: {e}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/students/<student_id>/dashboard', methods=['GET'])
def get_student_dashboard(student_id: str):
    """
    GET /api/students/{student_id}/dashboard
    
    Get student's adaptive response dashboard data
    Includes latest submission analysis, learning profile, progress
    """
    try:
        # Get latest submission analysis from database
        if db.is_connected():
            latest_analysis = db.get_latest_submission_analysis(student_id)
            
            if latest_analysis:
                dashboard = {
                    "student_id": student_id,
                    "latest_submission": latest_analysis,
                    "learner_profile": latest_analysis.get("learner_profile"),
                    "competence_summary": latest_analysis.get("competence"),
                    "feedback_summary": latest_analysis.get("adaptive_feedback"),
                    "progress_indicators": db.get_progress_indicators(student_id),
                }
                
                return jsonify({
                    "success": True,
                    "data": dashboard
                }), 200
        
        return jsonify({
            "success": False,
            "error": "No submission data found for student"
        }), 404
    
    except Exception as e:
        print(f"Error getting dashboard: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/students/<student_id>/feedback-history', methods=['GET'])
def get_feedback_history(student_id: str):
    """
    GET /api/students/{student_id}/feedback-history
    
    Get all feedback history for a student across submissions
    """
    try:
        if db.is_connected():
            history = db.get_student_feedback_history(student_id)
            
            return jsonify({
                "success": True,
                "data": {
                    "student_id": student_id,
                    "feedback_history": history,
                    "count": len(history)
                }
            }), 200
        
        return jsonify({
            "success": False,
            "error": "Database connection error"
        }), 500
    
    except Exception as e:
        print(f"Error getting feedback history: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/students/<student_id>/competence', methods=['GET'])
def get_competence_estimate(student_id: str):
    """
    GET /api/students/{student_id}/competence
    
    Get current competence estimate and trajectory
    """
    try:
        if db.is_connected():
            competence_data = db.get_competence_trajectory(student_id)
            
            return jsonify({
                "success": True,
                "data": {
                    "student_id": student_id,
                    "competence": competence_data
                }
            }), 200
        
        return jsonify({
            "success": False,
            "error": "Database connection error"
        }), 500
    
    except Exception as e:
        print(f"Error getting competence: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/admin/calibrate-thresholds', methods=['POST'])
def calibrate_thresholds():
    """
    POST /api/admin/calibrate-thresholds
    
    Validate and calibrate thresholds based on pilot data
    Request: {
        "indicator_name": string,
        "values": [number, ...]
    }
    """
    try:
        data = request.get_json()
        
        result = api.calibrate_thresholds(
            data.get('indicator_name'),
            data.get('values', [])
        )
        
        return jsonify({
            "success": True,
            "data": result
        }), 200
    
    except Exception as e:
        print(f"Error calibrating thresholds: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/admin/system-config', methods=['GET'])
def get_system_config():
    """
    GET /api/admin/system-config
    
    Get current system configuration (thresholds, rules, templates)
    """
    try:
        config = {
            "thresholds": adaptive_system.interpreter.thresholds,
            "rules_count": len(adaptive_system.interpreter.rules),
            "rules_summary": list(adaptive_system.interpreter.rules.keys()),
            "learner_profiles": list(adaptive_system.profiler.profiles.keys()),
        }
        
        return jsonify({
            "success": True,
            "data": config
        }), 200
    
    except Exception as e:
        print(f"Error getting config: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/admin/system-stats', methods=['GET'])
def get_system_stats():
    """
    GET /api/admin/system-stats
    
    Get system statistics: total submissions, learner distributions, etc.
    """
    try:
        if db.is_connected():
            stats = {
                "total_submissions": db.get_total_submissions(),
                "total_students": db.get_unique_students_count(),
                "learner_profile_distribution": db.get_profile_distribution(),
                "competence_distribution": db.get_competence_distribution(),
                "intervention_need_count": db.get_intervention_needs_count(),
            }
            
            return jsonify({
                "success": True,
                "data": stats
            }), 200
        
        return jsonify({
            "success": False,
            "error": "Database connection error"
        }), 500
    
    except Exception as e:
        print(f"Error getting stats: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        "success": False,
        "error": "Endpoint not found"
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        "success": False,
        "error": "Internal server error"
    }), 500


if __name__ == '__main__':
    print("=" * 50)
    print("WriteLens Adaptive Writing System API")
    print("=" * 50)
    print("\nInitializing components...")
    print("✓ Text Analytics Engine")
    print("✓ Interpretation Engine")
    print("✓ Learner Profiling Engine")
    print("✓ Competence Inference Engine")
    print("✓ Bayesian Modeling")
    print("✓ Random Forest Prediction")
    print("✓ Feedback Generation")
    print("\nAPI Endpoints:")
    print("  POST   /api/submissions/analyze - Submit draft for analysis")
    print("  GET    /api/students/<id>/dashboard - Student dashboard")
    print("  GET    /api/students/<id>/feedback-history - Feedback history")
    print("  GET    /api/students/<id>/competence - Competence trajectory")
    print("  POST   /api/admin/calibrate-thresholds - Calibrate thresholds")
    print("  GET    /api/admin/system-config - System configuration")
    print("  GET    /api/admin/system-stats - System statistics")
    print("\n" + "=" * 50)
    
    # Run server
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False,
        threaded=True
    )
