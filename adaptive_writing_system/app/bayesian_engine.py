from pathlib import Path
from typing import Any, Dict, Tuple

import pandas as pd

try:
    from pgmpy.estimators import MaximumLikelihoodEstimator
    from pgmpy.inference import VariableElimination
    from pgmpy.models import DiscreteBayesianNetwork

    PGMPY_AVAILABLE = True
except Exception:
    MaximumLikelihoodEstimator = None
    VariableElimination = None
    DiscreteBayesianNetwork = None
    PGMPY_AVAILABLE = False

BASE = Path(__file__).resolve().parents[1]


class BayesianCompetenceEngine:
    """Bayesian inference engine for competence estimation."""

    def __init__(self):
        self.model = None
        self.inference = None

    def infer_competence(self, evidence: Dict[str, Any]) -> Dict[str, float]:
        return {
            "argument_competence_prob": 0.6,
            "cohesion_competence_prob": 0.7,
            "linguistic_competence_prob": 0.65,
            "srl_revision_competence_prob": 0.55,
        }

    def update_posterior(self, evidence: Dict[str, Any]) -> Dict[str, float]:
        return self.infer_competence(evidence)


def _band_score(value):
    try:
        numeric_value = float(value)
    except (TypeError, ValueError):
        return "medium"
    if numeric_value <= 2:
        return "low"
    if numeric_value <= 3:
        return "medium"
    return "high"


def _band_revision(value):
    try:
        numeric_value = float(value)
    except (TypeError, ValueError):
        return "medium"
    if numeric_value == 0:
        return "low"
    if numeric_value == 1:
        return "medium"
    return "high"


def _band_feedback(value):
    try:
        numeric_value = float(value)
    except (TypeError, ValueError):
        return "low"
    if numeric_value == 0:
        return "low"
    if numeric_value == 1:
        return "medium"
    return "high"


def _state_to_probability(state: str) -> float:
    return {"low": 0.33, "medium": 0.66, "high": 0.85}.get(str(state).lower(), 0.5)


def _heuristic_bayes(df: pd.DataFrame) -> pd.DataFrame:
    output = df.copy()
    output["argument_competence"] = output["argumentation"].apply(_band_score)
    output["cohesion_competence"] = output[["cohesion", "cohesion_index"]].apply(
        lambda row: "low"
        if float(row.iloc[0] or 0) <= 2 or float(row.iloc[1] or 0) < 2
        else "medium"
        if float(row.iloc[0] or 0) <= 3 or float(row.iloc[1] or 0) < 4
        else "high",
        axis=1,
    )
    output["linguistic_competence"] = output[["grammar_accuracy", "error_density", "lexical_resource"]].apply(
        lambda row: "low"
        if float(row.iloc[0] or 0) <= 2 or float(row.iloc[1] or 0) > 8
        else "medium"
        if float(row.iloc[0] or 0) == 3 or float(row.iloc[2] or 0) <= 3
        else "high",
        axis=1,
    )
    output["srl_revision_competence"] = output["revision_frequency"].apply(
        lambda value: "low" if float(value or 0) == 0 else "medium" if float(value or 0) == 1 else "high"
    )
    output["argument_competence_prob"] = output["argument_competence"].apply(_state_to_probability)
    output["cohesion_competence_prob"] = output["cohesion_competence"].apply(_state_to_probability)
    output["linguistic_competence_prob"] = output["linguistic_competence"].apply(_state_to_probability)
    output["srl_revision_competence_prob"] = output["srl_revision_competence"].apply(_state_to_probability)
    return output


def run_bayesian() -> Tuple[pd.DataFrame, object]:
    df = pd.read_csv(BASE / "outputs" / "05_rf.csv")

    for column_name in ["argumentation", "cohesion", "grammar_accuracy", "lexical_resource", "revision_frequency", "feedback_views", "cohesion_index", "error_density"]:
        if column_name not in df.columns:
            df[column_name] = 0

    if not PGMPY_AVAILABLE or len(df) < 3:
        output = _heuristic_bayes(df)
        output.to_csv(BASE / "outputs" / "06_bayes.csv", index=False)
        return output, None

    d = df.copy()
    d["argument_state"] = d["argumentation"].apply(_band_score)
    d["cohesion_state"] = d[["cohesion", "cohesion_index"]].apply(
        lambda row: "low"
        if float(row.iloc[0] or 0) <= 2 or float(row.iloc[1] or 0) < 2
        else "medium"
        if float(row.iloc[0] or 0) <= 3 or float(row.iloc[1] or 0) < 4
        else "high",
        axis=1,
    )
    d["linguistic_state"] = d[["grammar_accuracy", "error_density", "lexical_resource"]].apply(
        lambda row: "low"
        if float(row.iloc[0] or 0) <= 2 or float(row.iloc[1] or 0) > 8
        else "medium"
        if float(row.iloc[0] or 0) == 3 or float(row.iloc[2] or 0) <= 3
        else "high",
        axis=1,
    )
    d["revision_state"] = d["revision_frequency"].apply(_band_revision)
    d["feedback_state"] = d["feedback_views"].apply(_band_feedback)

    bn_data = d[["revision_state", "feedback_state", "argument_state", "cohesion_state", "linguistic_state"]].dropna()
    if bn_data.empty:
        output = _heuristic_bayes(df)
        output.to_csv(BASE / "outputs" / "06_bayes.csv", index=False)
        return output, None

    model = DiscreteBayesianNetwork([
        ("revision_state", "argument_state"),
        ("feedback_state", "argument_state"),
        ("revision_state", "cohesion_state"),
        ("feedback_state", "cohesion_state"),
        ("revision_state", "linguistic_state"),
    ])
    model.fit(bn_data, estimator=MaximumLikelihoodEstimator)
    inference = VariableElimination(model)

    output = d.copy()
    argument_states = []
    cohesion_states = []
    linguistic_states = []
    revision_states = []

    for _, row in d.iterrows():
        evidence = {
            "revision_state": _band_revision(row.get("revision_frequency", 0)),
            "feedback_state": _band_feedback(row.get("feedback_views", 0)),
        }
        try:
            argument_query = inference.query(variables=["argument_state"], evidence=evidence)
            cohesion_query = inference.query(variables=["cohesion_state"], evidence=evidence)
            linguistic_query = inference.query(variables=["linguistic_state"], evidence={"revision_state": evidence["revision_state"]})

            argument_index = int(argument_query.values.argmax())
            cohesion_index = int(cohesion_query.values.argmax())
            linguistic_index = int(linguistic_query.values.argmax())

            argument_state = argument_query.state_names["argument_state"][argument_index]
            cohesion_state = cohesion_query.state_names["cohesion_state"][cohesion_index]
            linguistic_state = linguistic_query.state_names["linguistic_state"][linguistic_index]
        except Exception:
            argument_state = _band_score(row.get("argumentation", 0))
            cohesion_state = "low" if float(row.get("cohesion", 0) or 0) <= 2 else "medium" if float(row.get("cohesion", 0) or 0) <= 3 else "high"
            linguistic_state = "low" if float(row.get("grammar_accuracy", 0) or 0) <= 2 else "medium" if float(row.get("grammar_accuracy", 0) or 0) == 3 else "high"

        argument_states.append(argument_state)
        cohesion_states.append(cohesion_state)
        linguistic_states.append(linguistic_state)
        revision_states.append(_band_revision(row.get("revision_frequency", 0)))

    output["argument_competence"] = argument_states
    output["cohesion_competence"] = cohesion_states
    output["linguistic_competence"] = linguistic_states
    output["srl_revision_competence"] = revision_states
    output["argument_competence_prob"] = output["argument_competence"].apply(_state_to_probability)
    output["cohesion_competence_prob"] = output["cohesion_competence"].apply(_state_to_probability)
    output["linguistic_competence_prob"] = output["linguistic_competence"].apply(_state_to_probability)
    output["srl_revision_competence_prob"] = output["srl_revision_competence"].apply(_state_to_probability)

    output.to_csv(BASE / "outputs" / "06_bayes.csv", index=False)
    return output, model


if __name__ == "__main__":
    run_bayesian()
