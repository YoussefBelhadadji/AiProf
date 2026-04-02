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

    # Ensure features exist
    for f in features:
        if f not in df.columns:
            df[f] = 0

    X = df[features].fillna(0)
    scaler = StandardScaler()
    
    unique_rows = len(X.drop_duplicates())
    cluster_count = min(n_clusters, max(1, unique_rows))

    if len(X) < 2 or cluster_count < 2:
        print("Not enough distinct data to build stable clusters.")
        df["cluster_id"] = -1
        df["learner_profile"] = "profile_unknown"
    else:
        X_scaled = scaler.fit_transform(X)
        model = KMeans(n_clusters=cluster_count, random_state=42, n_init=10)
        df["cluster_id"] = model.fit_predict(X_scaled)
        df["learner_profile"] = df["cluster_id"].map(PROFILE_NAMES).fillna("profile_unknown")

    out = BASE / "outputs" / "04_clustered.csv"
    df.to_csv(out, index=False)
    # Return just df for safety if model is not instantiated
    return df

if __name__ == "__main__":
    run_clustering()
