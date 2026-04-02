from __future__ import annotations
import pandas as pd
from pgmpy.estimators import MaximumLikelihoodEstimator
from pgmpy.inference import VariableElimination
from pgmpy.models import DiscreteBayesianNetwork
from utils import ensure_outputs_dir

def band_value(x: float, thresholds: list) -> str:
    if x <= thresholds[0]: return "low"
    if x <= thresholds[1]: return "medium"
    return "high"

def main() -> None:
    out_dir = ensure_outputs_dir()
    df = pd.read_csv(out_dir / "06_predictions.csv")

    # Discretizing for Bayesian Network
    df["rev_level"] = df["revision_frequency"].apply(lambda x: "low" if x == 0 else "medium" if x == 1 else "high")
    df["feedback_level"] = df["feedback_views"].apply(lambda x: "low" if x == 0 else "medium" if x == 1 else "high")
    df["argument_level"] = df["argumentation"].apply(lambda x: "low" if x <= 2 else "medium" if x == 3 else "high")
    df["cohesion_level"] = df["cohesion"].apply(lambda x: "low" if x <= 2 else "medium" if x == 3 else "high")

    bn_data = df[["rev_level", "feedback_level", "argument_level", "cohesion_level"]].copy()

    # Define structure: Learning Behaviors -> Writing Outcomes
    model = DiscreteBayesianNetwork([
        ("rev_level", "argument_level"),
        ("feedback_level", "argument_level"),
        ("rev_level", "cohesion_level"),
        ("feedback_level", "cohesion_level"),
    ])

    model.fit(bn_data, estimator=MaximumLikelihoodEstimator)
    infer = VariableElimination(model)

    arg_probs = []
    coh_probs = []

    for _, row in df.iterrows():
        try:
            arg_q = infer.query(
                variables=["argument_level"],
                evidence={
                    "rev_level": "low" if row["revision_frequency"] == 0 else "medium" if row["revision_frequency"] == 1 else "high",
                    "feedback_level": "low" if row["feedback_views"] == 0 else "medium" if row["feedback_views"] == 1 else "high",
                }
            )
            coh_q = infer.query(
                variables=["cohesion_level"],
                evidence={
                    "rev_level": "low" if row["revision_frequency"] == 0 else "medium" if row["revision_frequency"] == 1 else "high",
                    "feedback_level": "low" if row["feedback_views"] == 0 else "medium" if row["feedback_views"] == 1 else "high",
                }
            )
            arg_probs.append(round(float(arg_q.values[-1]), 4)) # Probability of 'high'
            coh_probs.append(round(float(coh_q.values[-1]), 4))
        except:
            arg_probs.append(0.5)
            coh_probs.append(0.5)

    df["argument_prob_high"] = arg_probs
    df["cohesion_prob_high"] = coh_probs

    df.to_csv(out_dir / "07_bayesian_results.csv", index=False)
    print("Created outputs/07_bayesian_results.csv")

if __name__ == "__main__":
    main()
