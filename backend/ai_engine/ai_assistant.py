import pandas as pd
import os
import sys
import json
import yaml

# Add the current directory to sys.path to ensure local modules are importable
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from clustering import run_clustering
from random_forest import run_random_forest
from bayesian_model import run_bayesian
from rule_engine import apply_rules
from feedback_generator import load_templates, generate_feedback_text

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RULES_PATH = os.path.join(BASE_DIR, "rules.yaml")
TEMPLATES_PATH = os.path.join(BASE_DIR, "feedback_templates.yaml")
THRESHOLDS_PATH = os.path.join(BASE_DIR, "thresholds.yaml")

def run_full_pipeline(df: pd.DataFrame):
    """
    Executes the entire research-driven analytical pipeline for the provided dataset.
    """
    print("--- Starting WriteLens AI Pipeline ---")
    
    # 1. Apply Rule-Based Interpretation (Thresholds + Logic)
    print("Step 1: Applying pedagogical rules...")
    df = apply_rules(df, RULES_PATH)
    
    # 2. Run Learner Profiling (Clustering)
    print("Step 2: Assigning learner profiles (Clustering)...")
    df_clustered, centroids = run_clustering(df)
    
    # 3. Run Performance Prediction (Random Forest)
    print("Step 3: Predicting performance gain (Random Forest)...")
    rf_model, rf_metrics, rf_importance = run_random_forest(df_clustered)
    
    # Add predictions back to the dataframe
    if rf_model:
        features = [
            "assignment_views",
            "resource_access_count",
            "rubric_views",
            "time_on_task",
            "revision_frequency",
            "feedback_views",
            "help_seeking_messages",
            "word_count",
            "error_density",
            "cohesion_index",
            "ttr",
            "argumentation",
        ]
        df_clustered["predicted_score"] = rf_model.predict(df_clustered[features].fillna(0))
    else:
        df_clustered["predicted_score"] = df_clustered["total_score"] # Default
    
    # 4. Run Latent Competence Inference (Bayesian)
    print("Step 4: Inferring latent competencies (Bayesian)...")
    bn_model, bn_inference = run_bayesian(df_clustered)
    
    # 5. Generate Personalized Feedback
    print("Step 5: Synthesizing feedback messages...")
    templates = load_templates(TEMPLATES_PATH)
    df_clustered["personalized_feedback"] = df_clustered["feedback_types"].apply(
        lambda x: generate_feedback_text(x, templates)
    )
    
    print("--- Pipeline Complete ---")
    
    return {
        "data": df_clustered,
        "rf_metrics": rf_metrics,
        "rf_importance": rf_importance.to_dict(orient="records"),
        "cluster_centroids": centroids.to_dict(orient="records")
    }

if __name__ == "__main__":
    # Example usage with mock data or loading from Excel
    print("AI Assistant orchestrator ready.")
    
    # In a real run, you would load your Excel file here:
    # data_path = "../../Cohort_Writing_Data.xlsx"
    # df = pd.read_excel(data_path)
    # results = run_full_pipeline(df)
    # results["data"].to_csv("diagnostic_results.csv", index=False)
