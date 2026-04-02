#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
System Initialization & Configuration
Ensures all modules are properly imported and configured
"""

import sys
from pathlib import Path

def initialize_system():
    """Initialize the WriteLens system."""
    
    # Add current directory to path
    current_dir = Path(__file__).resolve().parent
    sys.path.insert(0, str(current_dir))
    
    # Import all required modules
    try:
        from .merge_data import merge_all
        from .text_features import compute_features
        from .threshold_engine import apply_thresholds
        from .clustering_engine import run_clustering
        from .random_forest_engine import run_random_forest
        from .bayesian_engine import run_bayesian
        from .rule_engine import apply_rules
        from .feedback_engine import compose_feedback
        from .correlation_engine import CorrelationEngine
        
        return True
    except Exception as e:
        print(f"Error initializing system: {e}")
        return False

if __name__ == "__main__":
    if initialize_system():
        print("✓ System initialized successfully")
    else:
        print("✗ System initialization failed")
