# LEGACY - Moved during architecture refactor on 2026-04-08
# This file is from the prototype system (adaptive_writing_system) predating ai_engine/.
# Do NOT import or run. Kept for historical reference only.
import pandas as pd
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]

def merge_all():
    logs = pd.read_csv(BASE / "data" / "moodle_logs.csv")
    rubric = pd.read_csv(BASE / "data" / "rubric_scores.csv")
    essays = pd.read_csv(BASE / "data" / "essays.csv")
    messages = pd.read_csv(BASE / "data" / "messages.csv")

    df = logs.merge(rubric, on=["student_id", "task_id", "draft_no"], how="left")
    df = df.merge(essays, on=["student_id", "task_id", "draft_no"], how="left")
    df = df.merge(messages, on=["student_id", "task_id", "draft_no"], how="left")

    df["help_seeking_messages"] = df["help_seeking_messages"].fillna(0)
    df["message_type"] = df["message_type"].fillna("none")
    df["message_text"] = df["message_text"].fillna("")

    out = BASE / "outputs" / "01_merged.csv"
    out.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out, index=False)
    return df

if __name__ == "__main__":
    merge_all()
