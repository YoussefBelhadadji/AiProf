#!/usr/bin/env python3
"""
AI Engine Main Entrypoint
========================

Node.js aiBridge calls this script with student data JSON.
Python processes it through the pipeline and returns decisions, feedback, etc.

NO database writes here - only computation.
Node stores results via aiBridge after receiving them.

Usage: python main.py '<json_student_data>'
"""

import json
import sys
from typing import Dict, Any
from pathlib import Path

if __package__ is None or __package__ == "":
    sys.path.append(str(Path(__file__).resolve().parents[0]))

try:
    from ai_engine.pipeline.v1.orchestrator import full_pipeline
    
    # Simple mock model placeholder since we haven't pickled a real model yet
    class MockModel:
        def predict(self, X):
            return ["needs_support"] * len(X)
            
    mock_model = MockModel()

    def run_orchestrator(data: Dict[str, Any]) -> Dict[str, Any]:
        return full_pipeline(data, mock_model)
        
except ImportError as e:
    # Fallback for early stage
    def run_orchestrator(data: Dict[str, Any]) -> Dict[str, Any]:
        return {"decision": "pending", "data": data, "error": str(e)}


def run_pipeline(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main pipeline function - callable from Node.js aiBridge.
    
    Args:
        input_data: Student data dictionary from backend
    
    Returns:
        dict: Complete decision package (decision, feedback, growth, explainability)
    """
    try:
        if not isinstance(input_data, dict):
            raise ValueError("Input must be a dictionary")
        
        # 🔥 CORE: Run orchestrator (ingestion → analytics → ai → decision → feedback → reporting)
        result = run_orchestrator(input_data)
        
        return {
            "success": True,
            "data": result
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


if __name__ == "__main__":
    # Node.js aiBridge calls: python main.py '<json>'
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No input provided"}, ensure_ascii=True))
        sys.exit(1)
    
    try:
        student_data = json.loads(sys.argv[1])
        result = run_pipeline(student_data)
        print(json.dumps(result, ensure_ascii=True))
    except json.JSONDecodeError as e:
        print(json.dumps({"success": False, "error": f"Invalid JSON: {str(e)}"}, ensure_ascii=True))
        sys.exit(1)
