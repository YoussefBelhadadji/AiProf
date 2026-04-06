import operator
import pandas as pd
import yaml

# Operator mapping for string-based conditions in YAML
OPS = {
    "==": operator.eq,
    "<=": operator.le,
    ">=": operator.ge,
    "<": operator.lt,
    ">": operator.gt,
}

def parse_condition(expr: str):
    """
    Parses a string condition (e.g., '>=30') into an operator and a float value.
    """
    expr_str = str(expr).strip()
    for op in ["<=", ">=", "==", "<", ">"]:
        if expr_str.startswith(op):
            return op, float(expr_str[len(op):])
            
    # Default to equal for numbers without operators
    try:
        return "==", float(expr_str)
    except ValueError:
        return "==", 0.0 # Fallback


def matches_rule(row: pd.Series, condition_dict: dict) -> bool:
    """
    Checks if a student record (row) matches all conditions of a rule.
    """
    for field, expr in condition_dict.items():
        if field not in row:
            continue
            
        op, value = parse_condition(expr)
        current = float(row[field])
        
        if not OPS[op](current, value):
            return False
    return True

def apply_rules(df: pd.DataFrame, rules_path: str) -> pd.DataFrame:
    """
    Applies the pedagogical rules defined in rules.yaml to the student dataset.
    """
    with open(rules_path, "r", encoding="utf-8") as f:
        rules_cfg = yaml.safe_load(f)["rules"]

    out = df.copy()
    triggered_ids = []
    interpretations = []
    feedbacks = []
    interventions = []

    for _, row in out.iterrows():
        row_ids = []
        row_interpretations = []
        row_feedbacks = []
        row_interventions = []

        for rule in rules_cfg:
            if matches_rule(row, rule["condition"]):
                row_ids.append(rule["rule_id"])
                row_interpretations.append(rule["interpretation"])
                row_feedbacks.append(rule["feedback_type"])
                row_interventions.append(rule["onsite_intervention"])

        triggered_ids.append("; ".join(row_ids))
        interpretations.append("; ".join(row_interpretations))
        feedbacks.append("; ".join(row_feedbacks))
        interventions.append("; ".join(row_interventions))

    out["triggered_rule_ids"] = triggered_ids
    out["interpretations"] = interpretations
    out["feedback_types"] = feedbacks
    out["onsite_interventions"] = interventions
    
    return out

if __name__ == "__main__":
    print("Rule Engine module ready.")
