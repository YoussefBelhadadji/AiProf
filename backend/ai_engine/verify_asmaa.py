import os
import sys
import pandas as pd
import json

# Add the current directory to sys.path to ensure local modules are importable
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ai_assistant import run_full_pipeline

# Data for Pilot Student: Lahmarabbou Asmaa
asmaa_data = {
    "student_id": ["S01"],
    "name": ["Lahmarabbou Asmaa"],
    "assignment_views": [12],
    "resource_access_count": [8],
    "rubric_views": [6],
    "time_on_task": [180.0],
    "revision_frequency": [4],
    "feedback_views": [4],
    "help_seeking_messages": [4],
    "word_count": [214],
    "error_density": [1.4],
    "cohesion_index": [4],
    "cohesion": [4.0],
    "ttr": [0.52],
    "argumentation": [4.0],
    "grammar_accuracy": [4.5],
    "lexical_resource": [4.5],
    "total_score": [24.0],
    "score_gain": [1.2],
    "first_access_delay_minutes": [10.0]
}

def verify():
    df = pd.DataFrame(asmaa_data)
    
    # Run the full pipeline
    results = run_full_pipeline(df)
    
    # Check the outputs
    output_df = results["data"]
    
    print("\n--- Verification Results for Asmaa ---")
    print(f"Student: {output_df['name'][0]}")
    print(f"Triggered Rules: {output_df['triggered_rule_ids'][0]}")
    print(f"Interpretations: {output_df['interpretations'][0]}")
    print(f"Archetype/Cluster: {output_df['cluster_label'][0]}")
    print(f"Feedback Type: {output_df['feedback_types'][0]}")
    print(f"Personalized Feedback: {output_df['personalized_feedback'][0]}")
    print(f"On-site Intervention: {output_df['onsite_interventions'][0]}")
    
    # Verify Bayesian (check if it added states)
    if "argument_state" in output_df.columns:
        print(f"Bayesian Argument State: {output_df['argument_state'][0]}")
    
    # Save the result to a JSON for inspection
    json_results = output_df.to_json(orient="records", indent=2)
    with open("asmaa_diagnostic.json", "w") as f:
        f.write(json_results)
    print("\nSaved detailed results to 'asmaa_diagnostic.json'.")

if __name__ == "__main__":
    verify()
