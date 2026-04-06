import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score

# Expected columns in df:
# assignment_views, resource_access_count, rubric_views, time_on_task,
# revision_frequency, feedback_views, help_seeking_messages,
# word_count, error_density, cohesion_index, ttr, argumentation,
# total_score, score_gain

def run_random_forest(df: pd.DataFrame, target: str = "score_gain"):
    """
    Predicts writing performance or gain and shows feature importance.
    """
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

    # Ensure all features exist in the dataframe
    for f in features:
        if f not in df.columns:
            df[f] = 0

    if len(df) < 5:
        print(f"Warning: Not enough samples ({len(df)}) for Random Forest. Returning default metrics.")
        return None, {"mae": 0, "r2": 0}, pd.DataFrame({"feature": features, "importance": [1/len(features)]*len(features)})

    # Add feedback uptake and help-seeking states
    df["feedback_uptake_state"] = df["feedback_views"].apply(
        lambda x: "low" if x == 0 else ("medium" if x == 1 else "high")
    )

    df["help_seeking_state"] = df["help_seeking_messages"].apply(
        lambda x: "none" if x == 0 else ("procedural" if x <= 2 else "adaptive")
    )

    X = df[features].fillna(0)
    y = df[target]

    # Train/Test split (LOO recommended for N=28, but 80/20 is default here)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestRegressor(
        n_estimators=200,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    preds = model.predict(X_test)

    metrics = {
        "mae": mean_absolute_error(y_test, preds),
        "r2": r2_score(y_test, preds),
    }

    importance = pd.DataFrame({
        "feature": features,
        "importance": model.feature_importances_
    }).sort_values("importance", ascending=False)

    return model, metrics, importance

if __name__ == "__main__":
    print("Random Forest module ready.")
