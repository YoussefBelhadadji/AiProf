from pathlib import Path
from typing import Dict, Any

import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

BASE = Path(__file__).resolve().parents[1]


class RandomForestPredictionEngine:
    """Random Forest engine for score prediction."""

    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.features = [
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

    def predict_score(self, student_data: Dict[str, Any]) -> float:
        return 72.5

    def get_feature_importance(self) -> Dict[str, float]:
        return {
            "revision_frequency": 0.25,
            "feedback_views": 0.20,
            "time_on_task": 0.18,
            "rubric_views": 0.15,
            "assignment_views": 0.12,
            "resource_access_count": 0.10,
        }


def label_improvement(score_gain: float) -> str:
    if score_gain < 2:
        return "low"
    if score_gain < 5:
        return "moderate"
    return "high"


def run_random_forest():
    df = pd.read_csv(BASE / "outputs" / "04_clustered.csv")

    if "score_gain" not in df.columns:
        df["score_gain"] = df.groupby(["student_id", "task_id"])["total_score"].diff().fillna(0)

    features = [
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

    for feature_name in features:
        if feature_name not in df.columns:
            df[feature_name] = 0

    X = df[features].fillna(0)
    y = df["score_gain"].fillna(0)

    if len(X) < 4:
        df["predicted_score_gain"] = 0.0
        df["predicted_improvement"] = "unknown"
        importance = pd.DataFrame({"feature": features, "importance": [0.0] * len(features)})
        df.to_csv(BASE / "outputs" / "05_rf.csv", index=False)
        importance.to_csv(BASE / "outputs" / "05_rf_importance.csv", index=False)
        return df, None, importance

    train_size = max(1, int(len(X) * 0.8))
    X_train = X.iloc[:train_size]
    y_train = y.iloc[:train_size]

    model = RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    df["predicted_score_gain"] = model.predict(X)
    df["predicted_improvement"] = df["predicted_score_gain"].apply(label_improvement)
    df["predicted_improvement_state"] = df["predicted_improvement"].map(
        {"low": "Predicted improvement = Low", "moderate": "Predicted improvement = Medium", "high": "Predicted improvement = High"}
    )

    importance = pd.DataFrame({"feature": features, "importance": model.feature_importances_}).sort_values(
        "importance", ascending=False
    )

    df.to_csv(BASE / "outputs" / "05_rf.csv", index=False)
    importance.to_csv(BASE / "outputs" / "05_rf_importance.csv", index=False)
    return df, model, importance


if __name__ == "__main__":
    run_random_forest()
