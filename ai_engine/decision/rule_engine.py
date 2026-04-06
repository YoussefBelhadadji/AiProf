from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Any, Callable, Dict, List, Optional


@dataclass
class TriggeredRule:
    rule_id: str
    category: str
    priority: int
    interpretation: str
    feedback_template: str
    onsite_intervention: str
    evidence: Dict[str, Any]


class Rule:
    def __init__(
        self,
        rule_id: str,
        category: str,
        priority: int,
        evaluator: Callable[[Dict[str, Any]], bool],
        interpretation: str,
        feedback_template: str,
        onsite_intervention: str,
    ) -> None:
        self.rule_id = rule_id
        self.category = category
        self.priority = priority
        self.evaluator = evaluator
        self.interpretation = interpretation
        self.feedback_template = feedback_template
        self.onsite_intervention = onsite_intervention

    def evaluate(self, context: Dict[str, Any]) -> Optional[TriggeredRule]:
        if not self.evaluator(context):
            return None

        evidence = _collect_evidence(
            context,
            keys=[
                "rubric_total_score_pct",
                "criteria_awareness",
                "help_seeking_level",
                "help_seeking_type",
                "procrastination_risk",
                "learner_profile",
                "predicted_improvement",
                "argument_competence_prob",
                "lexical_control",
                "grammar_mechanics_level",
                "feedback_access",
                "revision_frequency",
                "word_count_compliance_flag",
                "submission_timing_flag",
            ],
        )

        return TriggeredRule(
            rule_id=self.rule_id,
            category=self.category,
            priority=self.priority,
            interpretation=self.interpretation,
            feedback_template=self.feedback_template,
            onsite_intervention=self.onsite_intervention,
            evidence=evidence,
        )


def _collect_evidence(context: Dict[str, Any], keys: List[str]) -> Dict[str, Any]:
    return {k: context.get(k) for k in keys if k in context}


def _score(context: Dict[str, Any]) -> float:
    return float(context.get("rubric_total_score_pct", 0.0))


def _criterion(context: Dict[str, Any], name: str) -> Optional[float]:
    rubric_scores = context.get("rubric_scores", {})
    value = rubric_scores.get(name)
    if isinstance(value, dict):
        raw_score = value.get("score")
        return float(raw_score) if raw_score is not None else None
    if value is None:
        return None
    return float(value)


def build_rules() -> List[Rule]:
    return [
        Rule(
            rule_id="A1",
            category="Planning / Forethought",
            priority=90,
            evaluator=lambda c: c.get("criteria_awareness") == "low"
            and c.get("procrastination_risk") == "high",
            interpretation="Weak planning and low awareness of task criteria before writing.",
            feedback_template="planning_scaffold",
            onsite_intervention="Rubric walkthrough + short pre-writing outline support.",
        ),
        Rule(
            rule_id="A2",
            category="Planning / Timing",
            priority=80,
            evaluator=lambda c: c.get("submission_timing_flag") in {"LATE", "LAST_MINUTE"},
            interpretation="Writing process appears rushed, which may reduce quality and revision depth.",
            feedback_template="time_management_prompt",
            onsite_intervention="Coach the learner on staged drafting and earlier task start.",
        ),
        Rule(
            rule_id="B1",
            category="Product / Argumentation",
            priority=95,
            evaluator=lambda c: (_criterion(c, "argumentation") is not None)
            and (_criterion(c, "argumentation") <= 2.0),
            interpretation="Argumentation is weak and needs clearer claims, support, and explanation.",
            feedback_template="argument_scaffold",
            onsite_intervention="Model Claim-Evidence-Explanation during revision conference.",
        ),
        Rule(
            rule_id="B2",
            category="Product / Argumentation",
            priority=85,
            evaluator=lambda c: (_criterion(c, "argumentation") is not None)
            and (2.0 < _criterion(c, "argumentation") < 4.0),
            interpretation="Argument exists but support and explanation remain underdeveloped.",
            feedback_template="argument_expansion",
            onsite_intervention="Guide the learner to add evidence and justify connections.",
        ),
        Rule(
            rule_id="B3",
            category="Product / Lexis",
            priority=75,
            evaluator=lambda c: c.get("lexical_control") == "unstable",
            interpretation="Lexical range is developing, but lexical control is unstable.",
            feedback_template="lexical_precision_support",
            onsite_intervention="Provide targeted vocabulary refinement with contextual alternatives.",
        ),
        Rule(
            rule_id="B4",
            category="Product / Grammar",
            priority=75,
            evaluator=lambda c: c.get("grammar_mechanics_level") == "weak",
            interpretation="Sentence-level grammar and mechanics issues interfere with polished expression.",
            feedback_template="grammar_mechanics_support",
            onsite_intervention="Mini-lesson on punctuation, spacing, and article/preposition use.",
        ),
        Rule(
            rule_id="C1",
            category="Revision",
            priority=85,
            evaluator=lambda c: int(c.get("revision_frequency", 0)) == 0
            and int(c.get("feedback_access", 0)) > 0,
            interpretation="Feedback was accessed, but no meaningful revision behavior was observed.",
            feedback_template="revision_activation_prompt",
            onsite_intervention="Use a guided revision checklist before resubmission.",
        ),
        Rule(
            rule_id="C2",
            category="Revision",
            priority=70,
            evaluator=lambda c: int(c.get("revision_frequency", 0)) > 0
            and c.get("predicted_improvement") == "low_improvement_risk",
            interpretation="Revision activity exists, but predicted learning gain remains limited.",
            feedback_template="deeper_revision_prompt",
            onsite_intervention="Focus revision on higher-order changes, not surface edits only.",
        ),
        Rule(
            rule_id="D1",
            category="Engagement / Help-Seeking",
            priority=70,
            evaluator=lambda c: c.get("help_seeking_level") == "low",
            interpretation="Possible disengagement or lack of metacognitive awareness in seeking help.",
            feedback_template="help_seeking_invitation",
            onsite_intervention="Invite learner to ask targeted questions about writing difficulties.",
        ),
        Rule(
            rule_id="D2",
            category="Engagement / Help-Seeking",
            priority=60,
            evaluator=lambda c: c.get("help_seeking_level") == "moderate",
            interpretation="Occasional support-seeking is present but not yet systematic.",
            feedback_template="metacognitive_prompt",
            onsite_intervention="Encourage more explicit reflection on when and why support is needed.",
        ),
        Rule(
            rule_id="D3",
            category="Engagement / Help-Seeking",
            priority=50,
            evaluator=lambda c: c.get("help_seeking_level") == "high",
            interpretation="Active learner monitoring and engagement through help-seeking are visible.",
            feedback_template="affirm_adaptive_help_seeking",
            onsite_intervention="Reinforce effective help-seeking and channel it toward revision goals.",
        ),
        Rule(
            rule_id="D4",
            category="Engagement / Help-Seeking Type",
            priority=65,
            evaluator=lambda c: c.get("help_seeking_type") in {"grammar", "vocabulary", "feedback_clarification"},
            interpretation="The learner seeks support on concrete writing issues, which can be leveraged pedagogically.",
            feedback_template="targeted_support_response",
            onsite_intervention="Respond with focused scaffolding on the exact issue raised.",
        ),
        Rule(
            rule_id="E1",
            category="Profile-Level",
            priority=88,
            evaluator=lambda c: c.get("learner_profile") == "effortful_but_struggling",
            interpretation="The learner appears engaged but still struggles to convert effort into performance.",
            feedback_template="effort_to_strategy_shift",
            onsite_intervention="Move from encouragement alone to explicit writing strategy instruction.",
        ),
        Rule(
            rule_id="E2",
            category="Profile-Level",
            priority=72,
            evaluator=lambda c: c.get("learner_profile") == "disengaged_learner",
            interpretation="Behavioral pattern suggests low engagement and elevated academic support needs.",
            feedback_template="reengagement_prompt",
            onsite_intervention="Schedule short-cycle check-ins and simplify the next writing step.",
        ),
        Rule(
            rule_id="F1",
            category="Prediction-Level",
            priority=82,
            evaluator=lambda c: c.get("predicted_improvement") == "low_improvement_risk",
            interpretation="Predicted growth is weak without additional pedagogical support.",
            feedback_template="motivational_metacognitive_prompt",
            onsite_intervention="Assign individualized support before the next draft.",
        ),
        Rule(
            rule_id="G1",
            category="Bayesian / Competence",
            priority=78,
            evaluator=lambda c: c.get("argument_competence_prob") == "low",
            interpretation="Probabilistic inference suggests low underlying argument competence at this stage.",
            feedback_template="argument_foundation_support",
            onsite_intervention="Rebuild argument structure using worked examples and sentence frames.",
        ),
        Rule(
            rule_id="G2",
            category="Bayesian / Competence",
            priority=68,
            evaluator=lambda c: c.get("argument_competence_prob") == "medium",
            interpretation="Argument competence is emerging but unstable and needs structured reinforcement.",
            feedback_template="argument_stabilization_support",
            onsite_intervention="Provide comparative examples of weak vs strong evidence use.",
        ),
    ]


def evaluate_rules(context: Dict[str, Any]) -> List[TriggeredRule]:
    triggered: List[TriggeredRule] = []

    for rule in build_rules():
        result = rule.evaluate(context)
        if result is not None:
            triggered.append(result)

    triggered.sort(key=lambda r: r.priority, reverse=True)
    return triggered


def serialize_triggered_rules(triggered_rules: List[TriggeredRule]) -> List[Dict[str, Any]]:
    return [asdict(rule) for rule in triggered_rules]
