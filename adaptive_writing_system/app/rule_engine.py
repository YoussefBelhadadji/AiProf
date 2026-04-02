from pathlib import Path
from typing import Any, Dict

import pandas as pd
import yaml

try:
    from .utils import (
        ai_state_summary,
        argument_state,
        discourse_state,
        engagement_risk,
        feedback_state,
        forethought_risk,
        help_state,
        lexical_state,
        linguistic_accuracy_state,
        predicted_improvement_state,
        revision_state,
    )
except ImportError:
    from utils import (
        ai_state_summary,
        argument_state,
        discourse_state,
        engagement_risk,
        feedback_state,
        forethought_risk,
        help_state,
        lexical_state,
        linguistic_accuracy_state,
        predicted_improvement_state,
        revision_state,
    )


BASE = Path(__file__).resolve().parents[1]

RULE_TO_TEMPLATE = {
    "A1": "criteria_referenced_feedback",
    "A2": "elaboration_feedback",
    "B1": "strategic_feedback",
    "B2": "higher_order_feedback",
    "B3": "direct_corrective_feedback",
    "B4": "lexical_enrichment",
    "C1": "metacognitive_prompt",
    "C2": "feedforward_feedback",
    "D1": "dialogic_scaffolding",
    "D2": "motivational_reengagement",
}


RULE_AI_REQUIREMENTS = {
    "A1": lambda row: "High" in forethought_risk(row),
    "A2": lambda row: any(keyword in forethought_risk(row) for keyword in ["High", "Medium"]),
    "B1": lambda row: "Low" in discourse_state(row),
    "B2": lambda row: "High" in argument_state(row),
    "B3": lambda row: "Low" in linguistic_accuracy_state(row),
    "B4": lambda row: "Low" in lexical_state(row),
    "C1": lambda row: "Low" in revision_state(row),
    "C2": lambda row: "High" in feedback_state(row),
    "D1": lambda row: "Adaptive" in help_state(row),
    "D2": lambda row: "None" in help_state(row) or "Low" in engagement_risk(row),
}


def load_yaml(path):
    with open(path, "r", encoding="utf-8") as handle:
        return yaml.safe_load(handle)


def _resolve_alias(row: Dict[str, Any], key: str):
    aliases = {
        "organization_score": "organization",
        "argumentation_score": "argumentation",
        "grammar_accuracy_score": "grammar_accuracy",
        "lexical_resource_score": "lexical_resource",
        "performance_total": "total_score",
        "first_access_timing": "first_access_delay_hours",
        "type_token_ratio": "ttr",
    }
    if key in row:
        return row.get(key)
    alias = aliases.get(key)
    if alias in row:
        return row.get(alias)
    return None


def _match_condition(value, expression) -> bool:
    try:
        numeric_value = float(value)
    except (TypeError, ValueError):
        numeric_value = None

    if isinstance(expression, (int, float)):
        return numeric_value == float(expression) if numeric_value is not None else str(value) == str(expression)

    if not isinstance(expression, str):
        return value == expression

    expression = expression.strip()
    if expression.startswith("<="):
        return numeric_value is not None and numeric_value <= float(expression[2:])
    if expression.startswith(">="):
        return numeric_value is not None and numeric_value >= float(expression[2:])
    if expression.startswith("<"):
        return numeric_value is not None and numeric_value < float(expression[1:])
    if expression.startswith(">"):
        return numeric_value is not None and numeric_value > float(expression[1:])
    if expression.startswith("=="):
        return numeric_value is not None and numeric_value == float(expression[2:])
    return str(value).strip().lower() == expression.lower()


def _rule_passes(row: Dict[str, Any], conditions: Dict[str, Any]) -> bool:
    for key, expression in conditions.items():
        value = _resolve_alias(row, key)
        if not _match_condition(value, expression):
            return False
    return True


def apply_rules():
    rules = load_yaml(BASE / "config" / "rules.yaml").get("rules", [])
    df = pd.read_csv(BASE / "outputs" / "06_bayes.csv")

    if "predicted_improvement" in df.columns:
        df["predicted_improvement_state"] = df["predicted_improvement"].apply(predicted_improvement_state)

    df["ai_forethought"] = df.apply(forethought_risk, axis=1)
    df["ai_engagement"] = df.apply(engagement_risk, axis=1)
    df["ai_argument"] = df.apply(argument_state, axis=1)
    df["ai_discourse"] = df.apply(discourse_state, axis=1)
    df["ai_linguistic"] = df.apply(linguistic_accuracy_state, axis=1)
    df["ai_lexical"] = df.apply(lexical_state, axis=1)
    df["ai_revision"] = df.apply(revision_state, axis=1)
    df["ai_feedback"] = df.apply(feedback_state, axis=1)
    df["ai_help"] = df.apply(help_state, axis=1)
    df["ai_state_summary"] = df.apply(ai_state_summary, axis=1)

    triggered_rules = []
    interpretations = []
    template_keys = []
    interventions = []

    for _, row in df.iterrows():
        row_dict = row.to_dict()
        row_triggered = []
        row_interpretations = []
        row_templates = []
        row_interventions = []

        for rule in rules:
            if not rule.get("enabled", True):
                continue
            conditions = rule.get("conditions") or rule.get("condition") or {}
            if _rule_passes(row_dict, conditions) and RULE_AI_REQUIREMENTS.get(rule["rule_id"], lambda _: True)(row_dict):
                row_triggered.append(rule["rule_id"])
                row_interpretations.append(rule.get("interpretation", ""))
                row_templates.append(RULE_TO_TEMPLATE.get(rule["rule_id"], rule.get("feedback_type", "")))
                row_interventions.append(rule.get("onsite_intervention", ""))

        triggered_rules.append("; ".join(dict.fromkeys(row_triggered)))
        interpretations.append("; ".join([item for item in dict.fromkeys(row_interpretations) if item]))
        template_keys.append("; ".join([item for item in dict.fromkeys(row_templates) if item]))
        interventions.append("; ".join([item for item in dict.fromkeys(row_interventions) if item]))

    df["triggered_rules"] = triggered_rules
    df["rule_interpretations"] = interpretations
    df["feedback_templates_selected"] = template_keys
    df["onsite_interventions"] = interventions

    out = df
    out.to_csv(BASE / "outputs" / "07_rules.csv", index=False)
    return out


if __name__ == "__main__":
    apply_rules()
