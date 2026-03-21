import pandas as pd
from pgmpy.models import DiscreteBayesianNetwork
from pgmpy.estimators import MaximumLikelihoodEstimator
from pgmpy.inference import VariableElimination

# Expected columns in df:
# argument_state, cohesion_state, linguistic_state, 
# revision_state, feedback_state, time_state

def discretize_scores(df: pd.DataFrame) -> pd.DataFrame:
    """
    Converts continuous scores into High, Medium, Low bands for Bayesian inference.
    """
    d = df.copy()

    # Low / Medium / High bands for writing quality
    d["argument_state"] = pd.cut(
        d["argumentation"],
        bins=[0, 2, 3, 5],
        labels=["low", "medium", "high"],
        include_lowest=True
    )

    d["cohesion_state"] = pd.cut(
        d["cohesion"],
        bins=[0, 2, 3, 5],
        labels=["low", "medium", "high"],
        include_lowest=True
    )

    # Combine grammar and lexical for a general linguistic competence
    d["linguistic_state"] = pd.cut(
        (d["grammar_accuracy"] + d["lexical_resource"]) / 2,
        bins=[0, 2, 3, 5],
        labels=["low", "medium", "high"],
        include_lowest=True
    )

    # Process states
    d["revision_state"] = pd.cut(
        d["revision_frequency"],
        bins=[-1, 0, 1, 100],
        labels=["low", "medium", "high"],
        include_lowest=True
    )

    d["feedback_state"] = pd.cut(
        d["feedback_views"],
        bins=[-1, 0, 1, 100],
        labels=["low", "medium", "high"],
        include_lowest=True
    )

    d["time_state"] = pd.cut(
        d["time_on_task"],
        bins=[0, 15, 30, 1000],
        labels=["low", "medium", "high"],
        include_lowest=True
    )

    return d

def run_bayesian(df: pd.DataFrame):
    """
    Builds and runs a Bayesian network for latent competence inference.
    """
    d = discretize_scores(df)

    bn_data = d[
        [
            "revision_state",
            "feedback_state",
            "time_state",
            "argument_state",
            "cohesion_state",
            "linguistic_state",
        ]
    ].dropna()

    # Network structure: Process behavior influences Competence States
    # (A simpler directed graph for research mapping)
    model = DiscreteBayesianNetwork([
        ("revision_state", "argument_state"),
        ("feedback_state", "argument_state"),
        ("time_state", "argument_state"),

        ("revision_state", "cohesion_state"),
        ("feedback_state", "cohesion_state"),

        ("revision_state", "linguistic_state"),
        ("time_state", "linguistic_state"),
    ])

    # Fit CPDs using Maximum Likelihood Estimator
    model.fit(bn_data, estimator=MaximumLikelihoodEstimator)

    inference = VariableElimination(model)

    return model, inference

if __name__ == "__main__":
    print("Bayesian model module ready.")
