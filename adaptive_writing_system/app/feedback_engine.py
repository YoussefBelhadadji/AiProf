from pathlib import Path
from typing import Dict

import pandas as pd
import yaml

BASE = Path(__file__).resolve().parents[1]


class FeedbackEngine:
    """Engine for generating adaptive feedback."""

    def __init__(self):
        self.templates = self._load_templates()

    def _load_templates(self) -> Dict[str, str]:
        template_path = BASE / "config" / "feedback_templates.yaml"
        if not template_path.exists():
            return {}
        with open(template_path, "r", encoding="utf-8") as handle:
            data = yaml.safe_load(handle) or {}
        return data.get("feedback_templates", {})

    def generate_feedback(self, student_profile, competence) -> str:
        target_area = list(competence.keys())[0] if competence else "writing development"
        return f"Based on your current performance, focus on improving your {target_area}."


def _load_templates() -> Dict[str, str]:
    template_path = BASE / "config" / "feedback_templates.yaml"
    with open(template_path, "r", encoding="utf-8") as handle:
        return (yaml.safe_load(handle) or {}).get("feedback_templates", {})


def compose_feedback():
    templates = _load_templates()
    df = pd.read_csv(BASE / "outputs" / "07_rules.csv")

    messages = []
    template_texts = []
    for _, row in df.iterrows():
        selected = [item.strip() for item in str(row.get("feedback_templates_selected", "")).split(";") if item.strip()]
        resolved = [templates[key] for key in selected if key in templates]
        if not resolved and row.get("rule_interpretations"):
            resolved = [str(row.get("rule_interpretations"))]
        messages.append(" ".join(resolved) if resolved else "No feedback template selected.")
        template_texts.append("; ".join(selected))

    df["feedback_template_keys"] = template_texts
    df["final_feedback_message"] = messages
    df.to_csv(BASE / "outputs" / "08_feedback.csv", index=False)
    return df


if __name__ == "__main__":
    compose_feedback()
