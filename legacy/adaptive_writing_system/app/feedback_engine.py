# LEGACY - Moved during architecture refactor on 2026-04-08
# This file is from the prototype system (adaptive_writing_system) predating ai_engine/.
# Do NOT import or run. Kept for historical reference only.
import yaml
import pandas as pd
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]

def load_yaml(path):
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

def compose_feedback():
    templates = load_yaml(BASE / "config" / "feedback_templates.yaml")["feedback_templates"]
    df = pd.read_csv(BASE / "outputs" / "07_rules.csv")

    messages = []
    for _, row in df.iterrows():
        selected = [x.strip() for x in str(row["feedback_templates_selected"]).split(";") if x.strip()]
        text = []
        for key in selected:
            if key in templates:
                text.append(templates[key])
        messages.append(" ".join(text) if text else "No feedback template selected.")

    df["final_feedback_message"] = messages
    out = BASE / "outputs" / "08_feedback.csv"
    out.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out, index=False)
    return df

if __name__ == "__main__":
    compose_feedback()
