import pandas as pd
from pgmpy.models import DiscreteBayesianNetwork
from pgmpy.estimators import MaximumLikelihoodEstimator
from pgmpy.inference import VariableElimination
import os

def run_bayesian_inference():
    print("--- [PHASE 5] Latent Competence Inference (Bayesian Network) ---")
    
    input_path = "outputs/03_dataset_with_clusters.csv"
    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found. Run stages 1-3 first.")
        return
    
    df = pd.read_csv(input_path)
    
    # Preprocessing: Binning continuous data into discrete states ('low', 'medium', 'high')
    # Researcher Note: Bayesian Networks (Discrete) require categorical data.
    print("Preprocessing data into discrete competence levels...")
    
    df["rev_level"] = pd.cut(df["revision_frequency"], bins=[-1, 0, 1, 100], labels=["low", "medium", "high"])
    df["feedback_level"] = pd.cut(df["feedback_views"], bins=[-1, 0, 1, 100], labels=["low", "medium", "high"])
    df["arg_level"] = pd.cut(df["rubric_argument"], bins=[0, 2, 3, 5], labels=["low", "medium", "high"])
    df["coh_level"] = pd.cut(df["rubric_cohesion"], bins=[0, 2, 3, 5], labels=["low", "medium", "high"])
    
    # Model Structure: Defining the causal relationships
    # Example: Revision behavior and Feedback views influence Argumentation competence.
    print("Defining Bayesian Model Structure: (Revision, Feedback) -> Competence")
    model = DiscreteBayesianNetwork([
        ("rev_level", "arg_level"),
        ("feedback_level", "arg_level")
    ])
    
    # Parameter Estimation
    print("Fitting model parameters (Maximum Likelihood Estimation)...")
    data = df[["rev_level", "feedback_level", "arg_level"]].dropna()
    model.fit(data, estimator=MaximumLikelihoodEstimator)
    
    # Inference Example
    print("Running Inference for 'High-Evidence' student profile...")
    infer = VariableElimination(model)
    
    # Query: P(Argumentation | Revisions=High, Feedback=High)
    q_high = infer.query(
        variables=["arg_level"], 
        evidence={"rev_level": "high", "feedback_level": "high"}
    )
    
    # Query: P(Argumentation | Revisions=Low, Feedback=Low)
    q_low = infer.query(
        variables=["arg_level"], 
        evidence={"rev_level": "low", "feedback_level": "low"}
    )
    
    print("\n--- Bayesian Posterior Probability (High Evidence Profile) ---")
    print(q_high)
    
    print("\n--- Bayesian Posterior Probability (Low Evidence Profile) ---")
    print(q_low)
    
    # Save the model summary
    with open("outputs/05_bayesian_inference_results.txt", "w") as f:
        f.write("Bayesian Inference Results Summary\n")
        f.write("--------------------------------\n\n")
        f.write(f"High-Engagement Profile Result:\n{q_high}\n\n")
        f.write(f"Low-Engagement Profile Result:\n{q_low}\n")
    
    print(f"--- SUCCESS: Bayesian inference results saved to outputs/05_bayesian_inference_results.txt ---")

if __name__ == "__main__":
    run_bayesian_inference()
