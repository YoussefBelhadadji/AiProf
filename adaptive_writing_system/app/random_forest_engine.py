import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor

BASE = Path(__file__).resolve().parents[1]

def label_improvement(score_gain: float) -> str:
    if score_gain < 2:
        return "low"
    if score_gain < 5:
        return "moderate"
    return "high"

def run_random_forest():
    df = pd.read_csv(BASE / "outputs" / "04_clustered.csv")

    if "score_gain" not in df.columns:
        df["score_gain"] = df.groupby("student_id")["total_score"].diff().fillna(0)

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

    X = df[features].fillna(0)
    y = df["score_gain"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    df["predicted_score_gain"] = model.predict(X)
    df["predicted_improvement"] = df["predicted_score_gain"].apply(label_improvement)

    importance = pd.DataFrame({
        "feature": features,
        "importance": model.feature_importances_
    }).sort_values("importance", ascending=False)

    out = BASE / "outputs" / "05_rf.csv"
    out.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out, index=False)
    importance.to_csv(BASE / "outputs" / "05_rf_importance.csv", index=False)
    return df, model, importance

if __name__ == "__main__":
    run_random_forest()
