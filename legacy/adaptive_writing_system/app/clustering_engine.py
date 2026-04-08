# LEGACY - Moved during architecture refactor on 2026-04-08
# This file is from the prototype system (adaptive_writing_system) predating ai_engine/.
# Do NOT import or run. Kept for historical reference only.
import pandas as pd
from pathlib import Path
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

BASE = Path(__file__).resolve().parents[1]

PROFILE_NAMES = {
    0: "strategic_writer",
    1: "engaged_but_developing",
    2: "effortful_but_struggling",
    3: "disengaged_learner",
}

def run_clustering(n_clusters=4):
    df = pd.read_csv(BASE / "outputs" / "03_thresholds.csv")

    if n_clusters > len(df):
        n_clusters = len(df)
        print(f"Lowering clusters to {n_clusters} for small dataset.")

    features = [
        "assignment_views",
        "resource_access_count",
        "rubric_views",
        "time_on_task",
        "revision_frequency",
        "feedback_views",
        "help_seeking_messages",
        "word_count",
        "cohesion_index",
        "total_score",
    ]

    X = df[features].fillna(0)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    df["cluster_id"] = model.fit_predict(X_scaled)
    df["learner_profile"] = df["cluster_id"].map(PROFILE_NAMES).fillna("profile_unknown")

    out = BASE / "outputs" / "04_clustered.csv"
    out.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out, index=False)
    return df, model

if __name__ == "__main__":
    run_clustering()
