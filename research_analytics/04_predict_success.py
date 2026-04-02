import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import os

def run_prediction():
    print("--- [PHASE 4] Writing Success Prediction (Random Forest) ---")
    
    input_path = "outputs/03_dataset_with_clusters.csv"
    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found. Run stages 1-3 first.")
        return
    
    df = pd.read_csv(input_path)
    
    # Feature Selection for Prediction
    # Moodle Predictors: Logins, Views, Revisions, Feedback Views, Time
    # NLP Predictors: Word count, TTR, Cohesion
    features = [
        "assignment_views", "rubric_views", "time_on_task", 
        "revision_frequency", "feedback_views", "help_seeking_messages", 
        "word_count", "ttr", "cohesion_index"
    ]
    target = "final_score"
    
    print(f"Dataset Size: {len(df)} records.")
    X = df[features].fillna(0)
    y = df[target]
    
    # Split for Validation (Note: Small datasets may skip the split)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f"Training Random Forest Regressor on {len(X_train)} samples...")
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    r2 = r2_score(y_test, preds)
    
    print(f"Model Accuracy (MAE): {mae:.2f}")
    print(f"Model R2 Score: {r2:.2f}")
    
    # Extract Feature Importance
    importance = pd.DataFrame({
        "feature": features,
        "importance": model.feature_importances_
    }).sort_values("importance", ascending=False)
    
    print("\n--- Feature Importance Table ---")
    print(importance)
    
    # Save results
    output_path = "outputs/04_feature_importance.csv"
    importance.to_csv(output_path, index=False)
    print(f"--- SUCCESS: Performance predictors saved to {output_path} ---")

if __name__ == "__main__":
    run_prediction()
