import pandas as pd
import json
import os
import sys

# Add the current directory to sys.path to ensure local modules are importable
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ai_assistant import run_full_pipeline

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "Cohort_Writing_Data.xlsx")
FRONTEND_DATA_DIR = os.path.join(BASE_DIR, "..", "..", "frontend", "src", "data")

def run():
    print(f"Loading cohort data from {DATA_PATH}...")
    df = pd.read_excel(DATA_PATH)
    
    # Run the full pipeline
    results = run_full_pipeline(df)
    
    # Convert results to JSON-serializable format
    # The 'data' is the main student table
    student_results = results["data"].to_dict(orient="records")
    
    final_output = {
        "students": student_results,
        "metrics": {
            "rf_metrics": results["rf_metrics"],
            "rf_importance": results["rf_importance"],
            "cluster_centroids": results["cluster_centroids"]
        }
    }
    
    # Ensure frontend data directory exists
    if not os.path.exists(FRONTEND_DATA_DIR):
        os.makedirs(FRONTEND_DATA_DIR)
        
    output_path = os.path.join(FRONTEND_DATA_DIR, "diagnostic_results.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(final_output, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully saved diagnostic results for 28 students to {output_path}")

if __name__ == "__main__":
    run()
