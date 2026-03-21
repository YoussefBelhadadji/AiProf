import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import os

# Expected columns in df:
# student_id, time_on_task, revision_frequency, feedback_views,
# rubric_views, help_seeking_messages, total_score, ttr,
# cohesion_index, word_count

def run_clustering(df: pd.DataFrame, n_clusters: int = 4):
    """
    Groups students into learner profiles using KMeans.
    Profiles: Strategic, Efficient, Struggling, At-Risk.
    """
    features = [
        "time_on_task",
        "revision_frequency",
        "feedback_views",
        "rubric_views",
        "help_seeking_messages",
        "total_score",
        "ttr",
        "cohesion_index",
        "word_count",
    ]

    # Ensure all features exist in the dataframe
    for f in features:
        if f not in df.columns:
            df[f] = 0

    if len(df) < n_clusters:
        print(f"Warning: Not enough samples ({len(df)}) for {n_clusters} clusters. Assigning 'Unclassified'.")
        df["cluster_label"] = -1
        return df, pd.DataFrame()

    X = df[features].fillna(0)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    df = df.copy()
    df["cluster_label"] = model.fit_predict(X_scaled)

    # Map cluster labels to archetypes based on centroid performance/engagement
    # In a real study, this mapping is done after analyzing the centroids.
    # For automation, we can provide a default mapping or just the label.
    
    centroids = pd.DataFrame(
        scaler.inverse_transform(model.cluster_centers_),
        columns=features
    )
    centroids["cluster_label"] = range(n_clusters)

    # Simplified Archetype Mapping (Research-based):
    # Cluster with highest total_score and engagement -> Strategic
    # Cluster with lowest total_score and engagement -> At-Risk
    # Cluster with high engagement but low score -> Struggling
    # Cluster with low engagement but high score -> Efficient
    
    archetypes = {}
    # Sort clusters by total_score or engagement to assign names
    # (Leaving as labels for now to match kkk.txt exact logic)
    
    return df, centroids

if __name__ == "__main__":
    # Test block
    print("Clustering module ready.")
