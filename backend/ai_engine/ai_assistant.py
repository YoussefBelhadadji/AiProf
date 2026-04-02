# pyre-ignore-all-errors
import pandas as pd
import os
import sys
import json
import re
import yaml

# Add the current directory to sys.path to ensure local modules are importable
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from .clustering import run_clustering
from .random_forest import run_random_forest
from .bayesian_model import run_bayesian
from .rule_engine import apply_rules
from .feedback_generator import load_templates, generate_feedback_text

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RULES_PATH = os.path.join(BASE_DIR, "rules.yaml")
TEMPLATES_PATH = os.path.join(BASE_DIR, "feedback_templates.yaml")
THRESHOLDS_PATH = os.path.join(BASE_DIR, "thresholds.yaml")


def _rf(value: float, ndigits: int) -> float:
    """Float-rounding helper. # type: ignore silences Pyre2's missing-stub overload error."""
    return float(round(value, ndigits))  # type: ignore[call-overload]


# ---------------------------------------------------------------------------
# Gap 5 fix: avg_sentence_length text feature extractor
# ---------------------------------------------------------------------------
def compute_avg_sentence_length(text: str) -> float:
    """
    Estimates average sentence length (words per sentence) from a text string.
    Sentences are split on '.', '!', '?' followed by whitespace or end-of-string.
    Returns 0.0 for empty or missing text.
    """
    if not isinstance(text, str) or not text.strip():
        return 0.0
    sentences = re.split(r"[.!?]+", text)
    sentences = [s.strip() for s in sentences if s.strip()]
    if not sentences:
        return 0.0
    total_words = sum(len(s.split()) for s in sentences)
    return _rf(float(total_words) / float(len(sentences)), 2)


def add_text_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes any text-level features not already present in the dataframe.
    Currently adds: avg_sentence_length.
    Existing features (word_count, ttr, cohesion_index, error_density) are
    assumed to be pre-computed by the parser / data source.
    """
    if "essay_text" in df.columns:
        df["avg_sentence_length"] = df["essay_text"].apply(compute_avg_sentence_length)
    elif "avg_sentence_length" not in df.columns:
        df["avg_sentence_length"] = 0.0
    return df


# ---------------------------------------------------------------------------
# Gap 2 fix: Draft 1 vs Draft 2 growth analysis
# ---------------------------------------------------------------------------
def generate_growth_analysis(df: pd.DataFrame) -> dict:
    """
    Compares Draft 1 and Draft 2 scores to produce a growth summary table.
    Expects columns: draft1_score, draft2_score (and optionally per-criterion columns
    ending in _d1 / _d2 for detailed criterion-level growth).

    Returns a dict suitable for JSON serialisation.
    """
    growth = {}

    if "draft1_score" in df.columns and "draft2_score" in df.columns:
        df["score_gain"] = df["draft2_score"] - df["draft1_score"]
        growth["avg_draft1_score"] = _rf(float(df["draft1_score"].mean()), 2)
        growth["avg_draft2_score"] = _rf(float(df["draft2_score"].mean()), 2)
        growth["avg_score_gain"] = _rf(float(df["score_gain"].mean()), 2)
        growth["pct_improved"] = _rf(float((df["score_gain"] > 0).sum()) / max(len(df), 1) * 100, 1)  # type: ignore[union-attr]
        growth["pct_no_change"] = _rf(float((df["score_gain"] == 0).sum()) / max(len(df), 1) * 100, 1)  # type: ignore[union-attr]
        growth["pct_declined"] = _rf(float((df["score_gain"] < 0).sum()) / max(len(df), 1) * 100, 1)  # type: ignore[union-attr]

        # Per-student growth records
        student_growth = []
        for _, row in df.iterrows():
            record = {
                "student_id": str(row.get("student_id", "unknown")),
                "draft1_score": row.get("draft1_score", None),
                "draft2_score": row.get("draft2_score", None),
                "score_gain": row.get("score_gain", None),
            }
            student_growth.append(record)
        growth["student_growth_table"] = student_growth  # type: ignore[assignment]

    else:
        # Fallback: try total_score as a proxy where draft separation is unavailable
        fallback: dict = {
            "note": (
                "Columns draft1_score and draft2_score not found. "
                "Add these to your Excel source for full growth analysis."
            )
        }
        if "total_score" in df.columns:
            fallback["avg_total_score"] = _rf(float(df["total_score"].mean()), 2)
        growth.update(fallback)

    return growth


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------
def run_full_pipeline(df: pd.DataFrame):
    """
    Executes the entire research-driven analytical pipeline for the provided dataset.
    """
    print("--- Starting WriteLens AI Pipeline ---")

    # Gap 5: compute avg_sentence_length before rule application
    print("Pre-step: Computing text features (avg_sentence_length)...")
    df = add_text_features(df)

    # 1. Apply Rule-Based Interpretation (Thresholds + Logic)
    print("Step 1: Applying pedagogical rules...")
    df = apply_rules(df, RULES_PATH)

    # 2. Run Learner Profiling (Clustering) — now returns 3 values (Gap 4 fix)
    print("Step 2: Assigning learner profiles (Clustering)...")
    df_clustered, centroids, cluster_justification = run_clustering(df)

    # 3. Run Performance Prediction (Random Forest)
    print("Step 3: Predicting performance gain (Random Forest)...")
    rf_model, rf_metrics, rf_importance = run_random_forest(df_clustered)

    # Add predictions back to the dataframe
    rf_features = [
        "assignment_views",
        "resource_access_count",
        "rubric_views",
        "time_on_task",
        "revision_frequency",
        "feedback_views",
        "help_seeking_messages",
        "word_count",
        "error_density",
        "cohesion_index",
        "ttr",
        "argumentation",
    ]
    if rf_model:
        df_clustered["predicted_score"] = rf_model.predict(df_clustered[rf_features].fillna(0))
    else:
        df_clustered["predicted_score"] = df_clustered.get("total_score", 0)

    # 4. Run Latent Competence Inference (Bayesian)
    print("Step 4: Inferring latent competencies (Bayesian)...")
    bn_model, bn_inference = run_bayesian(df_clustered)

    # 5. Generate Personalized Feedback
    print("Step 5: Synthesizing feedback messages...")
    templates = load_templates(TEMPLATES_PATH)
    df_clustered["personalized_feedback"] = df_clustered["feedback_types"].apply(
        lambda x: generate_feedback_text(x, templates)
    )

    # Gap 2: Draft 1 vs Draft 2 growth analysis
    print("Step 6: Computing Draft 1 vs Draft 2 growth analysis...")
    growth_analysis = generate_growth_analysis(df_clustered)

    print("--- Pipeline Complete ---")

    return {
        "data": df_clustered,
        "rf_metrics": rf_metrics,
        "rf_importance": rf_importance.to_dict(orient="records"),
        "cluster_centroids": centroids.to_dict(orient="records") if not centroids.empty else [],
        "cluster_justification": cluster_justification,   # Gap 4 output
        "growth_analysis": growth_analysis,               # Gap 2 output
    }


if __name__ == "__main__":
    # Example usage with mock data or loading from Excel
    print("AI Assistant orchestrator ready.")

    # In a real run, you would load your Excel file here:
    # data_path = "../../Cohort_Writing_Data.xlsx"
    # df = pd.read_excel(data_path)
    # results = run_full_pipeline(df)
    # results["data"].to_csv("diagnostic_results.csv", index=False)
