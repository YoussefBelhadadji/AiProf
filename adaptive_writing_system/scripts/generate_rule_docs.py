import argparse
import json
from pathlib import Path


BASE = Path(__file__).resolve().parents[1]
CONFIG_DIR = BASE / "config"
OUTPUT_PATH = BASE / "RULE_FEEDBACK_MATRIX.md"


def load_json(filename: str):
    with open(CONFIG_DIR / filename, "r", encoding="utf-8") as handle:
        return json.load(handle)


def escape_cell(value: str) -> str:
    return str(value).replace("|", "\\|").replace("\n", " ")


def build_document() -> str:
    rulebook = load_json("adaptive_rulebook.yaml")
    templates = load_json("feedback_templates.yaml")["feedback_templates"]
    metadata = rulebook["metadata"]
    columns = metadata["strong_rule_table_columns"]

    lines = [
        "# Unified Strong Rule Table",
        "",
        metadata["preface"],
        "",
        "## Comprehensive AI-Supported Adaptive Feedback Decision Table",
        "",
        f"| {' | '.join(columns)} |",
        f"| {' | '.join(['---'] * len(columns))} |",
    ]

    for rule in sorted(rulebook["feedback_rules"], key=lambda item: (-item["priority"], item["rule_id"])):
        display = rule["display"]
        action = rule["actions"]
        template_ids = action.get("feedback_templates", [])
        message_focus = display["feedback_message_focus"]
        if not rule.get("enabled", True):
            message_focus = f"{message_focus} [Documented but disabled in the current runtime.]"

        row = [
            rule["rule_id"],
            display["raw_data_condition"],
            display["ai_learner_state_output"],
            display["pedagogical_interpretation"],
            display["adaptive_feedback_type"],
            message_focus,
            "; ".join(action.get("onsite_interventions", [])),
            display["theoretical_justification"],
        ]
        lines.append(f"| {' | '.join(escape_cell(cell) for cell in row)} |")

        if template_ids:
            template_preview = " ".join(templates.get(template_id, "") for template_id in template_ids).strip()
            lines.append(
                f"|  |  |  |  | Template(s) | {escape_cell(template_preview)} |  |  |"
            )

    lines.extend(
        [
            "",
            "## Runtime Note",
            "",
            "The canonical source of truth is `config/adaptive_rulebook.yaml`. This document is generated from that rulebook and the shared feedback template library.",
            "",
            "## Render Deployment Checklist",
            "",
            "- Pin Node with `.node-version` and Python with `.python-version` so Render builds do not drift when platform defaults change.",
            "- Build the frontend into `frontend/dist` before starting the backend service.",
            "- Install Python dependencies from `adaptive_writing_system/requirements.txt` during the Render build.",
            "- Start the Node backend as the single Render web service so it serves both `/api/*` and the built frontend.",
            "- Verify `/api/health` returns `{\"status\":\"ok\"}` after deployment.",
            "- Keep same-origin frontend/API behavior in production by leaving `VITE_API_URL` unset unless an override is explicitly required.",
            "- Confirm the workbook upload flow works through `/api/upload-dataset` after deployment.",
            "- Confirm `/api/run-pipeline` still works when the four required CSV files are uploaded: `moodle_logs.csv`, `rubric_scores.csv`, `essays.csv`, and `messages.csv`.",
            "- Refresh a client-side route directly in the browser to verify backend route fallback serves the same frontend app shell.",
        ]
    )

    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Fail if the generated content does not match the file on disk.")
    args = parser.parse_args()

    content = build_document()

    if args.check:
        existing = OUTPUT_PATH.read_text(encoding="utf-8") if OUTPUT_PATH.exists() else ""
        if existing != content:
            raise SystemExit("RULE_FEEDBACK_MATRIX.md is out of date. Regenerate it with generate_rule_docs.py.")
        return 0

    OUTPUT_PATH.write_text(content, encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
