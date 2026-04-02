from __future__ import annotations
import pandas as pd
from utils import PROJECT_ROOT, ensure_outputs_dir, load_yaml

def main() -> None:
    out_dir = ensure_outputs_dir()
    df = pd.read_csv(out_dir / "07_bayesian_results.csv")

    templates_cfg = load_yaml(PROJECT_ROOT / "config" / "feedback_templates.yaml")
    templates = templates_cfg["feedback_templates"]

    feedback_outputs = []
    strengths_outputs = []
    next_steps_outputs = []

    for _, row in df.iterrows():
        # Identify Strengths
        strengths = []
        if row["grammar_accuracy"] >= 4: strengths.append("good grammatical control")
        if row["organization"] >= 4: strengths.append("clear paragraph organization")
        if row["argumentation"] >= 4: strengths.append("developing argument quality")
        if row["cohesion_index"] >= 2: strengths.append("effective connector use")

        # Select Feedback Templates based on triggered rules
        feedback_texts = []
        rule_types = [x.strip() for x in str(row["feedback_types"]).split(";") if x.strip()]
        for ft in rule_types:
            template = templates.get(ft)
            if template and template not in feedback_texts:
                feedback_texts.append(template)

        if not feedback_texts:
            feedback_texts.append("Your draft shows partial development. Continue improving organization and support.")

        # Next Writing Goal
        if row["word_count"] < 120:
            next_step = "Expand paragraph with one supporting detail and one explanatory sentence."
        elif row["argumentation"] <= 2:
            next_step = "Strengthen the claim-evidence-explanation sequence."
        else:
            next_step = "Refine cohesion and academic register in the next revision."

        strengths_outputs.append("; ".join(strengths) if strengths else "emerging effort")
        feedback_outputs.append(" ".join(feedback_texts))
        next_steps_outputs.append(next_step)

    df["strengths_identified"] = strengths_outputs
    df["adaptive_feedback"] = feedback_outputs
    df["next_writing_goal"] = next_steps_outputs

    keep_cols = [
        "student_id", "task_id", "draft_no", "cluster", "predicted_score",
        "argument_prob_high", "cohesion_prob_high", "triggered_rules",
        "interpretations", "onsite_interventions", "strengths_identified",
        "adaptive_feedback", "next_writing_goal"
    ]
    diagnosis = df[keep_cols].copy()
    diagnosis.to_csv(out_dir / "08_student_diagnosis.csv", index=False)
    print("Created outputs/08_student_diagnosis.csv")

if __name__ == "__main__":
    main()
