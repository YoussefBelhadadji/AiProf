import pandas as pd
import os

# Create outputs directory if not exists
os.makedirs("outputs", exist_ok=True)

def run_cleaning():
    print("--- [PHASE 1] Initializing Data Cleaning & Integration ---")
    
    # Path setup
    moodle_path = "data_templates/moodle_logs.csv"
    rubric_path = "data_templates/rubric_scores.csv"
    essays_path = "data_templates/essays.csv"
    
    # Load files
    print(f"Loading {moodle_path}...")
    moodle = pd.read_csv(moodle_path)
    
    print(f"Loading {rubric_path}...")
    rubric = pd.read_csv(rubric_path)
    
    print(f"Loading {essays_path}...")
    essays = pd.read_csv(essays_path)
    
    # Merge by common keys
    # Note: We merge by student_id, task_id, and draft_no to ensure alignment
    print("Merging datasets into Master Dataframe...")
    df = moodle.merge(rubric, on=["student_id", "task_id", "draft_no"], how="left")
    df = df.merge(essays, on=["student_id", "task_id", "draft_no"], how="left")
    
    # Fill missing values with defaults if necessary
    df = df.fillna({
        'assignment_views': 0,
        'revision_frequency': 0,
        'time_on_task': 0,
        'final_score': df['final_score'].mean() if 'final_score' in df else 0
    })
    
    # Save results
    output_path = "outputs/01_master_dataset.csv"
    df.to_csv(output_path, index=False)
    print(f"--- SUCCESS: Master dataset saved to {output_path} ---")
    print(f"Total Rows: {len(df)}")
    print(df.head())

if __name__ == "__main__":
    run_cleaning()
