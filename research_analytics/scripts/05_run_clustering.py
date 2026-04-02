from __future__ import annotations
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from utils import ensure_outputs_dir

def main() -> None:
    out_dir = ensure_outputs_dir()
    df = pd.read_csv(out_dir / "04_rules_applied.csv")

    features = [
        "time_on_task",
        "revision_frequency",
        "feedback_views",
        "help_seeking_messages",
        "ttr",
        "cohesion_index",
        "word_count",
    ]

    X = df[features].fillna(0)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = KMeans(n_clusters=3, random_state=42, n_init=10)
    df["cluster"] = model.fit_predict(X_scaled)

    df.to_csv(out_dir / "05_clusters.csv", index=False)
    print("Created outputs/05_clusters.csv")

if __name__ == "__main__":
    main()
