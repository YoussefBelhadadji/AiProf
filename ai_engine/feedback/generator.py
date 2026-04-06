from typing import Dict, List
from ai_engine.decision.rule_engine import TriggeredRule


FEEDBACK_TEMPLATES: Dict[str, str] = {
    "planning_scaffold": "Before writing, review the rubric and prepare a short outline with your claim and supporting points.",
    "time_management_prompt": "Start earlier and divide the task into planning, drafting, and revision steps.",
    "argument_scaffold": "Use Claim-Evidence-Explanation: state your point, add evidence, then explain how it supports your claim.",
    "argument_expansion": "Your argument is present, but it needs more support and clearer explanation.",
    "lexical_precision_support": "Replace vague or awkward expressions with more precise academic vocabulary.",
    "grammar_mechanics_support": "Revise punctuation, spacing, and article/preposition use sentence by sentence.",
    "revision_activation_prompt": "You viewed the feedback, but your revision is limited. Apply the comments directly in the next draft.",
    "deeper_revision_prompt": "Focus on improving ideas, support, and structure rather than only correcting surface errors.",
    "help_seeking_invitation": "If a part of the task is unclear, ask a focused question so you can revise more effectively.",
    "metacognitive_prompt": "Try noting what confused you during writing so you can ask for support more strategically.",
    "affirm_adaptive_help_seeking": "Your questions show active engagement. Keep using support to strengthen your revisions.",
    "targeted_support_response": "Your question is useful. Let us focus directly on that issue and improve it in your draft.",
    "effort_to_strategy_shift": "You are putting in effort. Now let us improve the strategy you use while drafting and revising.",
    "reengagement_prompt": "Let us restart with one small step: review the task, write one focused paragraph, then revise it.",
    "motivational_metacognitive_prompt": "Progress may stay limited without support. Identify one writing difficulty and address it explicitly.",
    "argument_foundation_support": "We need to rebuild the basics of argument structure: claim, evidence, and explanation.",
    "argument_stabilization_support": "Your argument is emerging. Strengthen it by making each example clearly support your point.",
}


def generate_feedback(triggered_rules: List[TriggeredRule]) -> Dict[str, object]:
    if not triggered_rules:
        return {
            "status": "no_action_required",
            "primary_feedback": "Good progress. Continue refining your ideas and language.",
            "rules_triggered": [],
            "teacher_interventions": [],
        }

    primary = triggered_rules[0]
    feedback_text = FEEDBACK_TEMPLATES.get(
        primary.feedback_template,
        "Please revise this draft based on the identified learning needs."
    )

    return {
        "status": "feedback_generated",
        "primary_rule": primary.rule_id,
        "primary_feedback": feedback_text,
        "rules_triggered": [r.rule_id for r in triggered_rules],
        "teacher_interventions": [r.onsite_intervention for r in triggered_rules],
    }
