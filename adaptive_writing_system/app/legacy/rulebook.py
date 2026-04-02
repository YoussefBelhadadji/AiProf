import json
import yaml
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List


BASE = Path(__file__).resolve().parents[2]
CONFIG_DIR = BASE / "config"

CLUSTER_LABELS = {
    0: "Disengaged / low-participation learner",
    1: "Efficient but fragile regulator",
    2: "Effortful but struggling writer",
    3: "Engaged or strategic writer",
}


def _load_json_config(filename: str) -> Dict[str, object]:
    with open(CONFIG_DIR / filename, "r", encoding="utf-8") as handle:
        if filename.endswith(".yaml"):
            return yaml.safe_load(handle)
        else:
            return json.load(handle)


def _load_optional_config(filename: str) -> Dict[str, object]:
    full_path = CONFIG_DIR / filename
    if not full_path.exists():
        return {}
    return _load_json_config(filename)


def _flatten_templates(node: Any, out: Dict[str, str]) -> None:
    if isinstance(node, str):
        return
    if not isinstance(node, dict):
        return

    for key, value in node.items():
        if isinstance(value, str):
            out[key] = value
        elif isinstance(value, dict):
            _flatten_templates(value, out)


@lru_cache(maxsize=1)
def load_rulebook() -> Dict[str, object]:
    return _load_optional_config("adaptive_rulebook.yaml")


@lru_cache(maxsize=1)
def load_feedback_template_config() -> Dict[str, object]:
    legacy = _load_optional_config("feedback_templates.yaml").get("feedback_templates", {})

    comprehensive_raw = _load_optional_config("feedback_templates_comprehensive.yaml")
    comprehensive_templates: Dict[str, str] = {}
    for section_name, section_value in comprehensive_raw.items():
        if section_name == "metadata":
            continue
        if isinstance(section_value, dict):
            _flatten_templates(section_value, comprehensive_templates)

    return {"feedback_templates": {**legacy, **comprehensive_templates}}


@lru_cache(maxsize=1)
def load_feedback_templates() -> Dict[str, str]:
    return load_feedback_template_config().get("feedback_templates", {})


@lru_cache(maxsize=1)
def build_rule_definitions() -> Dict[str, Dict[str, object]]:
    definitions = {}
    for rule in load_rulebook().get("feedback_rules", []):
        actions = rule.get("actions", {})
        display = rule.get("display", {})
        template_ids = list(actions.get("feedback_templates", []))
        if not template_ids:
            if rule.get("feedback_type"):
                template_ids = [rule["feedback_type"]]
            elif rule.get("response_template"):
                template_ids = [rule["response_template"]]

        onsite_items = list(actions.get("onsite_interventions", []))
        if not onsite_items:
            onsite_raw = rule.get("onsite_intervention", [])
            if isinstance(onsite_raw, list):
                onsite_items = onsite_raw
            elif isinstance(onsite_raw, str) and onsite_raw:
                onsite_items = [onsite_raw]

        definitions[rule["rule_id"]] = {
            "category": rule.get("category", "general"),
            "priority": rule.get("priority", 0),
            "enabled": rule.get("enabled", True),
            "interpretation": (
                rule.get("interpretation")
                or display.get("pedagogical_interpretation")
                or rule.get("pedagogical_claim")
                or rule.get("display_label", "")
            ),
            "onsite_intervention": "; ".join(onsite_items),
            "raw_data_condition": display.get("raw_data_condition") or rule.get("evidence_chain", ""),
            "ai_learner_state_output": display.get("ai_learner_state_output") or rule.get("display_label", ""),
            "adaptive_feedback_type": (
                display.get("adaptive_feedback_type")
                or rule.get("adaptive_feedback_type")
                or rule.get("feedback_type", "")
            ),
            "feedback_message_focus": display.get("feedback_message_focus") or rule.get("feedback_focus", ""),
            "theoretical_justification": (
                display.get("theoretical_justification")
                or rule.get("theoretical_justification")
                or rule.get("justification", "")
            ),
            "feedback_templates": template_ids,
            "onsite_interventions": onsite_items,
            "focus_statement": actions.get("focus_statement", ""),
        }
    return definitions


def get_cluster_label_description(label: int) -> str:
    return CLUSTER_LABELS.get(label, CLUSTER_LABELS[3])


def build_strong_rule_rows() -> List[Dict[str, object]]:
    templates = load_feedback_templates()
    rows = []
    for rule in sorted(load_rulebook().get("feedback_rules", []), key=lambda item: (-item.get("priority", 0), item.get("rule_id", ""))):
        display = rule.get("display", {})
        actions = rule.get("actions", {})
        template_ids = list(actions.get("feedback_templates", []))
        if not template_ids:
            if rule.get("feedback_type"):
                template_ids = [rule["feedback_type"]]
            elif rule.get("response_template"):
                template_ids = [rule["response_template"]]

        onsite_items = list(actions.get("onsite_interventions", []))
        if not onsite_items:
            onsite_raw = rule.get("onsite_intervention", [])
            if isinstance(onsite_raw, list):
                onsite_items = onsite_raw
            elif isinstance(onsite_raw, str) and onsite_raw:
                onsite_items = [onsite_raw]

        rows.append(
            {
                "rule_id": rule["rule_id"],
                "category": rule.get("category", "general"),
                "priority": rule.get("priority", 0),
                "enabled": rule.get("enabled", True),
                "raw_data_condition": display.get("raw_data_condition") or rule.get("evidence_chain", ""),
                "ai_learner_state_output": display.get("ai_learner_state_output") or rule.get("display_label", ""),
                "pedagogical_interpretation": (
                    display.get("pedagogical_interpretation")
                    or rule.get("pedagogical_claim")
                    or rule.get("interpretation", "")
                ),
                "adaptive_feedback_type": (
                    display.get("adaptive_feedback_type")
                    or rule.get("adaptive_feedback_type")
                    or rule.get("feedback_type", "")
                ),
                "feedback_message_focus": display.get("feedback_message_focus") or rule.get("feedback_focus", ""),
                "theoretical_justification": (
                    display.get("theoretical_justification")
                    or rule.get("theoretical_justification")
                    or rule.get("justification", "")
                ),
                "feedback_templates": template_ids,
                "onsite_interventions": onsite_items,
                "feedback_messages": [templates.get(template_id, "") for template_id in template_ids],
            }
        )
    return rows
