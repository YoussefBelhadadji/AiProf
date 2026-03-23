import json
from functools import lru_cache
from pathlib import Path
from typing import Dict, List


BASE = Path(__file__).resolve().parents[1]
CONFIG_DIR = BASE / "config"

CLUSTER_LABELS = {
    0: "Disengaged / low-participation learner",
    1: "Efficient but fragile regulator",
    2: "Effortful but struggling writer",
    3: "Engaged or strategic writer",
}


def _load_json_config(filename: str) -> Dict[str, object]:
    with open(CONFIG_DIR / filename, "r", encoding="utf-8") as handle:
        return json.load(handle)


@lru_cache(maxsize=1)
def load_rulebook() -> Dict[str, object]:
    return _load_json_config("adaptive_rulebook.yaml")


@lru_cache(maxsize=1)
def load_feedback_template_config() -> Dict[str, object]:
    return _load_json_config("feedback_templates.yaml")


@lru_cache(maxsize=1)
def load_feedback_templates() -> Dict[str, str]:
    return load_feedback_template_config()["feedback_templates"]


@lru_cache(maxsize=1)
def build_rule_definitions() -> Dict[str, Dict[str, object]]:
    definitions = {}
    for rule in load_rulebook()["feedback_rules"]:
        actions = rule["actions"]
        display = rule["display"]
        definitions[rule["rule_id"]] = {
            "category": rule["category"],
            "priority": rule["priority"],
            "enabled": rule.get("enabled", True),
            "interpretation": display["pedagogical_interpretation"],
            "onsite_intervention": "; ".join(actions.get("onsite_interventions", [])),
            "raw_data_condition": display["raw_data_condition"],
            "ai_learner_state_output": display["ai_learner_state_output"],
            "adaptive_feedback_type": display["adaptive_feedback_type"],
            "feedback_message_focus": display["feedback_message_focus"],
            "theoretical_justification": display["theoretical_justification"],
            "feedback_templates": list(actions.get("feedback_templates", [])),
            "onsite_interventions": list(actions.get("onsite_interventions", [])),
            "focus_statement": actions.get("focus_statement", ""),
        }
    return definitions


def get_cluster_label_description(label: int) -> str:
    return CLUSTER_LABELS.get(label, CLUSTER_LABELS[3])


def build_strong_rule_rows() -> List[Dict[str, object]]:
    templates = load_feedback_templates()
    rows = []
    for rule in sorted(load_rulebook()["feedback_rules"], key=lambda item: (-item["priority"], item["rule_id"])):
        display = rule["display"]
        actions = rule["actions"]
        template_ids = list(actions.get("feedback_templates", []))
        rows.append(
            {
                "rule_id": rule["rule_id"],
                "category": rule["category"],
                "priority": rule["priority"],
                "enabled": rule.get("enabled", True),
                "raw_data_condition": display["raw_data_condition"],
                "ai_learner_state_output": display["ai_learner_state_output"],
                "pedagogical_interpretation": display["pedagogical_interpretation"],
                "adaptive_feedback_type": display["adaptive_feedback_type"],
                "feedback_message_focus": display["feedback_message_focus"],
                "theoretical_justification": display["theoretical_justification"],
                "feedback_templates": template_ids,
                "onsite_interventions": list(actions.get("onsite_interventions", [])),
                "feedback_messages": [templates.get(template_id, "") for template_id in template_ids],
            }
        )
    return rows
