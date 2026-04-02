from __future__ import annotations
import pandas as pd
from utils import PROJECT_ROOT, ensure_outputs_dir

def main() -> None:
    data_dir = PROJECT_ROOT / "data_templates"
    out_dir = ensure_outputs_dir()

    moodle = pd.read_csv(data_dir / "moodle_logs.csv")
    rubric = pd.read_csv(data_dir / "rubric_scores.csv")
    essays = pd.read_csv(data_dir / "essays.csv")
    help_seek = pd.read_csv(data_dir / "help_seeking_messages.csv")

    df = moodle.merge(
        rubric,
        on=["student_id", "task_id", "draft_no"],
        how="left",
    )
    df = df.merge(
        essays,
        on=["student_id", "task_id", "draft_no"],
        how="left",
    )
    df = df.merge(
        help_seek[["student_id", "task_id", "draft_no", "help_seeking_messages", "message_type"]],
        on=["student_id", "task_id", "draft_no"],
        how="left",
    )

    df["help_seeking_messages"] = df["help_seeking_messages"].fillna(0)
    df["message_type"] = df["message_type"].fillna("none")

    df.to_csv(out_dir / "01_merged_dataset.csv", index=False)
    print("Created outputs/01_merged_dataset.csv")

if __name__ == "__main__":
    main()
