from __future__ import annotations
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from utils import ensure_outputs_dir

def main() -> None:
    out_dir = ensure_outputs_dir()
    df = pd.read_csv(out_dir / "05_clusters.csv")

    features = [
        "assignment_views",
        "rubric_views",
        "time_on_task",
        "revision_frequency",
        "feedback_views",
        "help_seeking_messages",
        "word_count",
        "ttr",
        "cohesion_index",
        "avg_sentence_length",
        "error_density",
        "academic_vocab_count",
    ]

    X = df[features].fillna(0)
    y = df["total_score"]

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)

    df["predicted_score"] = model.predict(X).round(2)

    importance = pd.DataFrame({
        "feature": features,
        "importance": model.feature_importances_
    }).sort_values(by="importance", ascending=False)

    df.to_csv(out_dir / "06_predictions.csv", index=False)
    importance.to_csv(out_dir / "06_feature_importance.csv", index=False)

    print("Created outputs/06_predictions.csv")
    print("Created outputs/06_feature_importance.csv")

if __name__ == "__main__":
    main()
