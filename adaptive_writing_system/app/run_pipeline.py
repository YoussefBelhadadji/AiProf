from pathlib import Path

import pandas as pd

try:
    from .merge_data import merge_all
    from .text_features import compute_features
    from .threshold_engine import apply_thresholds
    from .clustering_engine import run_clustering
    from .random_forest_engine import run_random_forest
    from .bayesian_engine import run_bayesian
    from .rule_engine import apply_rules
    from .feedback_engine import compose_feedback
except ImportError:
    from merge_data import merge_all
    from text_features import compute_features
    from threshold_engine import apply_thresholds
    from clustering_engine import run_clustering
    from random_forest_engine import run_random_forest
    from bayesian_engine import run_bayesian
    from rule_engine import apply_rules
    from feedback_engine import compose_feedback


BASE = Path(__file__).resolve().parents[1]


def save_descriptive_summary(df: pd.DataFrame) -> pd.DataFrame:
    numeric = df.select_dtypes(include="number")
    summary = numeric.describe().T
    out = BASE / "outputs" / "00_descriptive_summary.csv"
    summary.to_csv(out)
    return summary


def save_correlation_summary(df: pd.DataFrame) -> pd.DataFrame:
    columns = [
        "assignment_views",
        "rubric_views",
        "resource_access_count",
        "first_access_delay_minutes",
        "time_on_task",
        "revision_frequency",
        "feedback_views",
        "help_seeking_messages",
        "word_count",
        "sentence_count",
        "ttr",
        "cohesion_index",
        "avg_sentence_length",
        "error_density",
        "total_score",
        "argumentation",
        "cohesion",
        "lexical_resource",
        "grammar_accuracy",
        "score_gain",
        "cohesion_gain",
        "lexical_gain",
    ]
    available = [column for column in columns if column in df.columns]
    if len(available) < 2:
        correlation = pd.DataFrame()
    else:
        correlation = df[available].corr(method="spearman")
    out = BASE / "outputs" / "04_correlations.csv"
    correlation.to_csv(out)
    return correlation


def save_growth_summary(df: pd.DataFrame) -> pd.DataFrame:
    growth_columns = [column for column in ["score_gain", "cohesion_gain", "lexical_gain", "error_reduction"] if column in df.columns]
    if growth_columns:
        summary = df[growth_columns].describe().T
    else:
        summary = pd.DataFrame()
    out = BASE / "outputs" / "09_growth_summary.csv"
    summary.to_csv(out)
    return summary


def save_teacher_review_queue(df: pd.DataFrame) -> pd.DataFrame:
    review = pd.DataFrame()

    preferred_columns = [
        "student_id",
        "task_id",
        "draft_no",
        "triggered_rules",
        "rule_interpretations",
        "feedback_template_keys",
        "final_feedback_message",
        "onsite_interventions",
        "ai_state_summary",
    ]

    for column in preferred_columns:
        if column in df.columns:
            review[column] = df[column]

    if review.empty:
        review["final_feedback_message"] = df.get("final_feedback_message", pd.Series(dtype="object"))

    review["teacher_approval_status"] = "pending_review"
    review["teacher_approved_message"] = ""
    review["teacher_override_note"] = ""

    out = BASE / "outputs" / "10_teacher_review.csv"
    review.to_csv(out, index=False)
    return review


def main() -> None:
    merge_df = merge_all()
    save_descriptive_summary(merge_df)

    features_df = compute_features()
    apply_thresholds()
    save_correlation_summary(features_df)

    clustered_df = run_clustering()
    rf_df, _, _ = run_random_forest()
    bayes_df, _ = run_bayesian()
    rules_df = apply_rules()
    feedback_df = compose_feedback()
    save_growth_summary(rf_df)
    save_teacher_review_queue(feedback_df)

    print("Pipeline complete.")
    print(f"Final feedback file: {BASE / 'outputs' / '08_feedback.csv'}")
    print(f"Teacher review queue: {BASE / 'outputs' / '10_teacher_review.csv'}")


if __name__ == "__main__":
    main()
