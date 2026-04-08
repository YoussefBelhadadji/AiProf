# LEGACY - Moved during architecture refactor on 2026-04-08
# This file is from the prototype system (adaptive_writing_system) predating ai_engine/.
# Do NOT import or run. Kept for historical reference only.
import yaml
import pandas as pd
from pathlib import Path
from utils import forethought_risk, argument_state, revision_state, feedback_state, help_state

BASE = Path(__file__).resolve().parents[1]

def parse_condition(expr, current):
    if expr.startswith("=="):
        return float(current) == float(expr[2:])
    if expr.startswith("<="):
        return float(current) <= float(expr[2:])
    if expr.startswith(">="):
        return float(current) >= float(expr[2:])
    if expr.startswith("<"):
        return float(current) < float(expr[1:])
    if expr.startswith(">"):
        return float(current) > float(expr[1:])
    return False

def load_yaml(path):
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

def apply_rules():
    rules = load_yaml(BASE / "config" / "rules.yaml")["rules"]
    df = pd.read_csv(BASE / "outputs" / "06_bayes.csv")

    df["ai_forethought"] = df.apply(forethought_risk, axis=1)
    df["ai_argument"] = df.apply(argument_state, axis=1)
    df["ai_revision"] = df.apply(revision_state, axis=1)
    df["ai_feedback"] = df.apply(feedback_state, axis=1)
    df["ai_help"] = df.apply(help_state, axis=1)

    triggered = []
    templates = []
    interventions = []

    for _, row in df.iterrows():
        row_rules = []
        row_templates = []
        row_interventions = []

        for rule in rules:
            cond_ok = all(parse_condition(expr, row.get(field, 0)) for field, expr in rule["condition"].items())
            ai_ok = rule["ai_state_required"] in [
                row["ai_forethought"], row["ai_argument"], row["ai_revision"], row["ai_feedback"], row["ai_help"]
            ]
            if cond_ok and ai_ok:
                row_rules.append(rule["rule_id"])
                row_templates.append(rule["feedback_template"])
                row_interventions.append(rule["onsite_intervention"])

        triggered.append("; ".join(row_rules))
        templates.append("; ".join(dict.fromkeys(row_templates)))
        interventions.append("; ".join(dict.fromkeys(row_interventions)))

    df["triggered_rules"] = triggered
    df["feedback_templates_selected"] = templates
    df["onsite_interventions"] = interventions

    out = BASE / "outputs" / "07_rules.csv"
    out.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out, index=False)
    return df

if __name__ == "__main__":
    apply_rules()
