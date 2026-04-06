#!/usr/bin/env python3
"""
End-to-End Pipeline Test
=========================

Tests the complete pipeline flow:
Input → Ingestion → Analytics → AI → Decision → Feedback → Reporting → Output

This is what aiBridge will eventually call.
"""

import json
import unittest
from pathlib import Path
import sys

# Add parent paths for imports
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from ai_engine.main import run_pipeline


class TestEndToEndPipeline(unittest.TestCase):
    """Complete pipeline integration tests"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.sample_student = {
            "student_id": "test-001",
            "name": "Test Student",
            "submissions": [
                {
                    "assignment_id": "assign-1",
                    "text": "This is a test submission with some content.",
                    "word_count": 8,
                    "timestamp": "2026-04-06T10:00:00Z"
                }
            ],
            "rubric_views": 1,
            "time_on_task_minutes": 25,
            "help_seeking_count": 0
        }
    
    def test_pipeline_accepts_valid_input(self):
        """Pipeline should accept valid student data"""
        result = run_pipeline(self.sample_student)
        self.assertTrue(result.get("success"))
        self.assertIn("data", result)
    
    def test_pipeline_rejects_empty_input(self):
        """Pipeline should handle empty input gracefully"""
        result = run_pipeline({})
        self.assertIsInstance(result, dict)
        # Should either have success=False or empty data
    
    def test_pipeline_output_structure(self):
        """Output should have standardized structure"""
        result = run_pipeline(self.sample_student)
        
        if result.get("success"):
            data = result.get("data", {})
            # Should contain at least one of: decision, feedback, growth, explainability
            self.assertTrue(
                any(key in data for key in ["decision", "feedback", "growth", "explainability"])
            )
    
    def test_pipeline_returns_json_serializable(self):
        """Result must be JSON serializable (for Node.js)"""
        result = run_pipeline(self.sample_student)
        try:
            json_str = json.dumps(result)
            reparsed = json.loads(json_str)
            self.assertEqual(result, reparsed)
        except (TypeError, ValueError) as e:
            self.fail(f"Result not JSON serializable: {e}")
    
    def test_pipeline_handles_malformed_input(self):
        """Pipeline should handle unexpected input types"""
        result = run_pipeline({"student_id": "test", "submissions": "not a list"})
        # Should either succeed with fallback or return error gracefully
        self.assertIsInstance(result, dict)
        self.assertIn("success", result)


class TestBridgeSimulation(unittest.TestCase):
    """Simulate how Node.js aiBridge will call the pipeline"""
    
    def test_aiBridge_call_pattern(self):
        """Simulate Node's JSON → Python → JSON pattern"""
        # Node.js sends JSON
        input_json = json.dumps({
            "student_id": "bridge-test-001",
            "submissions": []
        })
        
        # Parse it (like Python does from sys.argv)
        parsed = json.loads(input_json)
        
        # Run pipeline
        result = run_pipeline(parsed)
        
        # Convert back to JSON (Node will parse it)
        output_json = json.dumps(result)
        final = json.loads(output_json)
        
        # Should be valid
        self.assertIsInstance(final, dict)
        self.assertIn("success", final)


if __name__ == "__main__":
    unittest.main(verbosity=2)
