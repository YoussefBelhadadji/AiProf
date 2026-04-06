from sklearn.cluster import KMeans
import numpy as np

def cluster_students(features):
    """
    features = [
        [score, days_before_deadline, word_count],
        ...
    ]
    """
    X = np.array(features)
    kmeans = KMeans(n_clusters=3, random_state=42)
    clusters = kmeans.fit_predict(X)
    return clusters
