import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import os

def run_clustering():
    print("--- [PHASE 3] Learner Profile Detection (Clustering) ---")
    
    input_path = "outputs/02_dataset_with_features.csv"
    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found. Run 01_clean_data.py and 02_text_features.py first.")
        return
    
    df = pd.read_csv(input_path)
    
    # Select features for clustering
    # We choose process indicators (Moodle) + product indicators (NLP)
    features = [
        "time_on_task", 
        "revision_frequency", 
        "feedback_views", 
        "help_seeking_messages", 
        "word_count", 
        "ttr"
    ]
    
    print(f"Processing clustering for {len(df)} records using features: {features}")
    X = df[features].fillna(0)
    
    # Standardize data
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Run K-Means
    print("Running KMeans algorithm (n_clusters=3)...")
    model = KMeans(n_clusters=3, random_state=42, n_init=10)
    df["cluster"] = model.fit_predict(X_scaled)
    
    # Map clusters to descriptive labels (manual step for researcher)
    # Researcher Note: This is an interpretation step where you analyze the centroids.
    # We define labels for the dissertation mapping.
    cluster_labels = {
        0: "At-Risk / Low Engagement",
        1: "Efficient / Moderate Engagement",
        2: "Strategic / High Engagement"
    }
    df["cluster_profile"] = df["cluster"].map(cluster_labels)
    
    output_path = "outputs/03_dataset_with_clusters.csv"
    df.to_csv(output_path, index=False)
    print(f"--- SUCCESS: Learner profiles identified and saved to {output_path} ---")
    print(df[["student_id", "cluster", "cluster_profile"]].head())

if __name__ == "__main__":
    run_clustering()
