import pandas as pd
import numpy as np
from scripts.utils import PROJECT_ROOT, ensure_outputs_dir

def main():
    ensure_outputs_dir()
    df = pd.read_csv(PROJECT_ROOT / "outputs/08_student_diagnosis.csv")
    growth_df = pd.read_csv(PROJECT_ROOT / "outputs/08_growth_analysis.csv")

    # Merge growth with diagnostic info
    merged = pd.merge(growth_df, df[df['draft_no'] == 1], on=['student_id', 'task_id'])

    # Analyze if specific rules triggered in Draft 1 led to higher gains
    # We check the 'triggered_rules' column
    
    effectiveness = []
    
    # List of all possible rules
    all_rules = ['A1', 'A2', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'D1', 'D2']
    
    for rule in all_rules:
        # Students who had the rule triggered
        has_rule = merged[merged['triggered_rules'].str.contains(rule, na=False)]
        no_rule = merged[~merged['triggered_rules'].str.contains(rule, na=False)]
        
        if not has_rule.empty:
            effectiveness.append({
                "rule": rule,
                "avg_gain_with_rule": has_rule['score_gain'].mean(),
                "avg_gain_without_rule": no_rule['score_gain'].mean() if not no_rule.empty else 0,
                "count": len(has_rule)
            })

    eff_df = pd.DataFrame(effectiveness)
    eff_df.to_csv(PROJECT_ROOT / "outputs/09_feedback_effectiveness.csv", index=False)
    print(f"Created outputs/09_feedback_effectiveness.csv")

    # Summary Conclusion
    with open(PROJECT_ROOT / "outputs/09_effectiveness_summary.txt", "w") as f:
        f.write("ADAPTIVE FEEDBACK EFFECTIVENESS SUMMARY\n")
        f.write("=======================================\n")
        for index, row in eff_df.iterrows():
            f.write(f"Rule {row['rule']}: Avg Gain {row['avg_gain_with_rule']:.2f} (n={int(row['count'])})\n")

if __name__ == "__main__":
    main()
