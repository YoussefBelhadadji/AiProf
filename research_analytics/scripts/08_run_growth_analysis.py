import pandas as pd
import numpy as np
from scripts.utils import PROJECT_ROOT, ensure_outputs_dir

def main():
    ensure_outputs_dir()
    df = pd.read_csv(PROJECT_ROOT / "outputs/03_thresholds_applied.csv")

    # Group by student and task, compare draft 1 and draft 2
    growth_data = []
    
    # We assume draft_no is 1 or 2
    for (student_id, task_id), group in df.groupby(['student_id', 'task_id']):
        d1 = group[group['draft_no'] == 1]
        d2 = group[group['draft_no'] == 2]
        
        if not d1.empty and not d2.empty:
            d1_row = d1.iloc[0]
            d2_row = d2.iloc[0]
            
            growth = {
                "student_id": student_id,
                "task_id": task_id,
                "score_gain": d2_row['total_score'] - d1_row['total_score'],
                "word_count_change": d2_row['word_count'] - d1_row['word_count'],
                "cohesion_gain": d2_row['cohesion_index'] - d1_row['cohesion_index'],
                "error_reduction": d1_row['error_density'] - d2_row['error_density']
            }
            growth_data.append(growth)

    growth_df = pd.DataFrame(growth_data)
    growth_df.to_csv(PROJECT_ROOT / "outputs/08_growth_analysis.csv", index=False)
    print(f"Created outputs/08_growth_analysis.csv")
    
    # Calculate Mean Growth
    mean_growth = growth_df[['score_gain', 'word_count_change', 'cohesion_gain', 'error_reduction']].mean()
    mean_growth.to_csv(PROJECT_ROOT / "outputs/08_mean_growth_report.csv")
    print(f"Created outputs/08_mean_growth_report.csv")

    # Add thresholds for growth analysis
    thresholds = {
        "score_gain": {"low": 0, "medium": 5, "high": 10},
        "word_count_change": {"low": 0, "medium": 50, "high": 100},
        "cohesion_gain": {"low": 0, "medium": 0.5, "high": 1.0},
        "error_reduction": {"low": 0, "medium": 2, "high": 5}
    }

    # Classify growth levels based on thresholds
    def classify_growth(value, metric):
        if value < thresholds[metric]["medium"]:
            return "low"
        elif value < thresholds[metric]["high"]:
            return "medium"
        else:
            return "high"

    growth_df["score_gain_level"] = growth_df["score_gain"].apply(lambda x: classify_growth(x, "score_gain"))
    growth_df["word_count_change_level"] = growth_df["word_count_change"].apply(lambda x: classify_growth(x, "word_count_change"))
    growth_df["cohesion_gain_level"] = growth_df["cohesion_gain"].apply(lambda x: classify_growth(x, "cohesion_gain"))
    growth_df["error_reduction_level"] = growth_df["error_reduction"].apply(lambda x: classify_growth(x, "error_reduction"))

    # Save updated growth analysis with levels
    growth_df.to_csv(PROJECT_ROOT / "outputs/08_growth_analysis_with_levels.csv", index=False)
    print(f"Created outputs/08_growth_analysis_with_levels.csv")

if __name__ == "__main__":
    main()
