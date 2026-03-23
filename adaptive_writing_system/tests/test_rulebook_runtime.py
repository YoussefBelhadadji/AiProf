from pathlib import Path
import sys


BASE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE / "app"))
sys.path.insert(0, str(BASE / "scripts"))

from decision_logic import compute_adaptive_decision  # noqa: E402
from generate_rule_docs import OUTPUT_PATH, build_document  # noqa: E402


def assert_feedback_responsive_case():
    result = compute_adaptive_decision(
        {
            "assignment_views": 108,
            "resource_access_count": 19,
            "rubric_views": 6,
            "time_on_task": 180,
            "revision_frequency": 4,
            "feedback_views": 4,
            "help_seeking_messages": 5,
            "word_count": 199,
            "error_density": 2.8,
            "cohesion_index": 4,
            "cohesion": 3.5,
            "ttr": 0.52,
            "argumentation": 3.4,
            "grammar_accuracy": 3.2,
            "lexical_resource": 3.6,
            "total_score": 20.6,
            "score_gain": 3.4,
            "first_access_delay_minutes": 10,
        }
    )

    assert result["learner_profile"] == "Feedback-responsive developing writer"
    assert result["triggered_rule_ids"] == "C4; C5; B2"
    assert result["feedback_templates_selected"] == "feedback_decoding; feedforward_guidance; argument_expansion"
    assert result["onsite_interventions"] == "feedback_to_revision_mapping; next_draft_transfer_prompt; guided_argument_development"
    assert (
        result["final_feedback_focus"]
        == "Consolidate feedback use and push the learner from partial revision to deeper reasoning and stronger support."
    )


def assert_disengaged_case():
    result = compute_adaptive_decision(
        {
            "assignment_views": 1,
            "resource_access_count": 0,
            "rubric_views": 0,
            "time_on_task": 12,
            "revision_frequency": 0,
            "feedback_views": 0,
            "help_seeking_messages": 0,
            "word_count": 70,
            "error_density": 4.5,
            "cohesion_index": 1,
            "cohesion": 2.2,
            "ttr": 0.39,
            "argumentation": 2.4,
            "grammar_accuracy": 2.5,
            "lexical_resource": 2.7,
            "total_score": 12.5,
            "score_gain": 0.4,
            "first_access_delay_minutes": 45,
        }
    )

    assert result["learner_profile"] == "Disengaged / low-participation learner"
    assert result["triggered_rule_ids"] == "A1; A2; C1; D1; D5"
    assert (
        result["feedback_templates_selected"]
        == "planning_scaffold; elaboration_prompt; revision_prompt; motivational_reengagement; metacognitive_prompt"
    )


def assert_rule_docs_current():
    generated = build_document()
    existing = OUTPUT_PATH.read_text(encoding="utf-8")
    assert generated == existing


if __name__ == "__main__":
    assert_feedback_responsive_case()
    assert_disengaged_case()
    assert_rule_docs_current()
    print("Python rulebook tests passed")
