import os
import sys
from pathlib import Path

# Add current folder to sys.path
sys.path.append(str(Path(__file__).resolve().parent))

from merge_data import merge_all
from text_features import compute_features
from threshold_engine import apply_thresholds
from clustering_engine import run_clustering
from random_forest_engine import run_random_forest
from bayesian_engine import run_bayesian
from rule_engine import apply_rules
from feedback_engine import compose_feedback

if __name__ == "__main__":
    merge_all()
    compute_features()
    apply_thresholds()
    run_clustering()
    run_random_forest()
    run_bayesian()
    apply_rules()
    compose_feedback()
    print("Pipeline complete. Open outputs/08_feedback.csv")
