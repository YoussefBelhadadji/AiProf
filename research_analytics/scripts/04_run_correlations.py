import pandas as pd
import numpy as np
from scripts.utils import PROJECT_ROOT, ensure_outputs_dir

def main():
    ensure_outputs_dir()
    df = pd.read_csv(PROJECT_ROOT / "outputs/03_thresholds_applied.csv")

    # Select key engagement and performance columns
    behavior_cols = ['time_on_task', 'revision_frequency', 'rubric_views', 'feedback_views', 'help_seeking_messages']
    performance_cols = ['word_count', 'cohesion_index', 'total_score']

    # Calculate Correlations
    corr_matrix = df[behavior_cols + performance_cols].corr()
    
    # Save Correlation Matrix
    corr_matrix.to_csv(PROJECT_ROOT / "outputs/04_correlations.csv")
    print(f"Created outputs/04_correlations.csv")

    # Extract specific strong links for reporting
    strong_links = []
    for b in behavior_cols:
        for p in performance_cols:
            r = corr_matrix.loc[b, p]
            if abs(r) > 0.3:
                strong_links.append({"behavior": b, "performance": p, "r": round(r, 2)})

    links_df = pd.DataFrame(strong_links)
    links_df.to_csv(PROJECT_ROOT / "outputs/04_engagement_performance_links.csv", index=False)
    print(f"Created outputs/04_engagement_performance_links.csv")

if __name__ == "__main__":
    main()
