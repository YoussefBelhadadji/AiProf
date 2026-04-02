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

    numeric_defaults = {
        "assignment_views": 0,
        "rubric_views": 0,
        "resource_access_count": 0,
        "first_access_delay_minutes": 0,
        "time_on_task": 0,
        "revision_frequency": 0,
        "feedback_views": 0,
        "help_seeking_messages": 0,
        "task_achievement": 0,
        "organization": 0,
        "argumentation": 0,
        "cohesion": 0,
        "lexical_resource": 0,
        "grammar_accuracy": 0,
        "academic_style": 0,
        "mechanics": 0,
        "total_score": 0,
    }
    for column_name, default_value in numeric_defaults.items():
        if column_name not in df.columns:
            df[column_name] = default_value
        else:
            df[column_name] = pd.to_numeric(df[column_name], errors="coerce").fillna(default_value)

    text_defaults = {
        "message_type": "none",
        "message_text": "",
        "essay_text": "",
    }
    for column_name, default_value in text_defaults.items():
        if column_name not in df.columns:
            df[column_name] = default_value
        else:
            df[column_name] = df[column_name].fillna(default_value)

    df["first_access_delay_hours"] = df["first_access_delay_minutes"] / 60.0
    df["performance_total"] = df["total_score"]
    df["grammar_accuracy_score"] = df["grammar_accuracy"]
    df["organization_score"] = df["organization"]
    df["argumentation_score"] = df["argumentation"]
    df["lexical_resource_score"] = df["lexical_resource"]
    df["type_token_ratio"] = 0.0
    df["score_gain"] = df.groupby(["student_id", "task_id"])['total_score'].diff().fillna(0)
    df["cohesion_gain"] = df.groupby(["student_id", "task_id"])['cohesion'].diff().fillna(0)
    df["lexical_gain"] = df.groupby(["student_id", "task_id"])['lexical_resource'].diff().fillna(0)
    df["error_reduction"] = 0.0

    # Ensure outputs directory exists
    (BASE / "outputs").mkdir(exist_ok=True)

    out = BASE / "outputs" / "01_merged.csv"
    df.to_csv(out, index=False)
    return df

if __name__ == "__main__":
    merge_all()
