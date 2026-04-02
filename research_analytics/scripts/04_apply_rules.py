from __future__ import annotations
import pandas as pd
from utils import PROJECT_ROOT, compare_condition, ensure_outputs_dir, load_yaml, safe_float

def row_matches_rule(row: pd.Series, conditions: dict) -> bool:
    for field, expr in conditions.items():
        value = safe_float(row.get(field, 0))
        if not compare_condition(value, expr):
            return False
    return True

def main() -> None:
    out_dir = ensure_outputs_dir()
    df = pd.read_csv(out_dir / "03_thresholds_applied.csv")

    rules_cfg = load_yaml(PROJECT_ROOT / "config" / "rules.yaml")
    rules = rules_cfg["rules"]

    triggered_rules_all = []
    interpretations_all = []
    feedback_types_all = []
    interventions_all = []

    for _, row in df.iterrows():
        triggered = []
        interpretations = []
        feedbacks = []
        interventions = []

        for rule in rules:
            if row_matches_rule(row, rule["conditions"]):
                triggered.append(rule["rule_id"])
                interpretations.append(rule["interpretation"])
                feedbacks.append(rule["feedback_type"])
                interventions.append(rule["onsite_intervention"])

        triggered_rules_all.append("; ".join(triggered))
        interpretations_all.append("; ".join(interpretations))
        feedback_types_all.append("; ".join(feedbacks))
        interventions_all.append("; ".join(interventions))

    df["triggered_rules"] = triggered_rules_all
    df["interpretations"] = interpretations_all
    df["feedback_types"] = feedback_types_all
    df["onsite_interventions"] = interventions_all

    df.to_csv(out_dir / "04_rules_applied.csv", index=False)
    print("Created outputs/04_rules_applied.csv")

if __name__ == "__main__":
    main()
