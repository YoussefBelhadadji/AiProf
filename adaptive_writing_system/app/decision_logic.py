from typing import Any, Dict, List

from rulebook import (
    CLUSTER_LABELS,
    build_rule_definitions,
    get_cluster_label_description,
    load_feedback_templates,
    load_rulebook,
)


RULEBOOK = load_rulebook()
FEEDBACK_TEMPLATES = load_feedback_templates()
RULE_DEFINITIONS = build_rule_definitions()
PROFILE_RULES = list(RULEBOOK["profile_rules"])
FEEDBACK_RULES = list(RULEBOOK["feedback_rules"])
PROFILE_RULES_BY_ID = {rule["profile_id"]: rule for rule in PROFILE_RULES}
FEEDBACK_RULES_BY_ID = {rule["rule_id"]: rule for rule in FEEDBACK_RULES}


def _value(row, key: str, default=0.0):
    value = row.get(key, default)
    try:
        if value != value:
            return default
    except Exception:
        return default
    return value


def _as_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _average(values: List[float]) -> float:
    return sum(values) / len(values) if values else 0.0


def _unique(values: List[str]) -> List[str]:
    seen = set()
    ordered = []
    for value in values:
        if value and value not in seen:
            seen.add(value)
            ordered.append(value)
    return ordered


def _delimited(values: List[str]) -> str:
    return "; ".join(_unique(values))


def _sort_rules(items: List[Dict[str, Any]], id_key: str) -> List[Dict[str, Any]]:
    return sorted(items, key=lambda item: (-int(item.get("priority", 0)), str(item.get(id_key, ""))))


def _match_expected(actual: Any, expected: Any) -> bool:
    if isinstance(expected, list):
        return actual in expected
    return actual == expected


def _match_map(source: Dict[str, Any], expected_map: Dict[str, Any]) -> bool:
    return all(_match_expected(source.get(key), expected) for key, expected in expected_map.items())


def _match_condition_group(source: Dict[str, Any], condition_group: Dict[str, Any]) -> bool:
    if not condition_group:
        return True

    all_conditions = condition_group.get("all", {})
    any_conditions = condition_group.get("any", [])

    if not _match_map(source, all_conditions):
        return False

    if not any_conditions:
        return True

    return any(_match_map(source, block) for block in any_conditions)


def build_bayesian_states(row, vocabulary_help_count: int = 0) -> Dict[str, str]:
    rubric_views = _as_float(_value(row, "rubric_views"))
    time_on_task = _as_float(_value(row, "time_on_task"))
    word_count = _as_float(_value(row, "word_count"))
    argumentation = _as_float(_value(row, "argumentation"))
    cohesion_index = _as_float(_value(row, "cohesion_index"))
    cohesion = _as_float(_value(row, "cohesion"))
    revision_frequency = _as_float(_value(row, "revision_frequency"))
    feedback_views = _as_float(_value(row, "feedback_views"))
    grammar_accuracy = _as_float(_value(row, "grammar_accuracy"))
    error_density = _as_float(_value(row, "error_density"))
    lexical_resource = _as_float(_value(row, "lexical_resource"))
    ttr = _as_float(_value(row, "ttr"))
    help_messages = _as_float(_value(row, "help_seeking_messages"))

    forethought = (
        "Low"
        if rubric_views == 0 and time_on_task < 30 and word_count < 120
        else "Medium"
        if rubric_views <= 1 or time_on_task < 60 or word_count < 150
        else "High"
    )
    argument = "Low" if argumentation < 3 else "Medium" if argumentation < 3.8 else "High"
    cohesion_state = (
        "Low"
        if cohesion_index <= 2 or cohesion < 3
        else "Medium"
        if cohesion_index <= 4 or cohesion < 4
        else "High"
    )
    revision = "Low" if revision_frequency == 0 else "Medium" if revision_frequency <= 2 else "High"
    feedback = (
        "High"
        if feedback_views >= 2 and revision_frequency >= 2
        else "Medium"
        if feedback_views >= 1 and revision_frequency >= 1
        else "Low"
    )
    linguistic = (
        "Low"
        if grammar_accuracy < 3 or error_density >= 4
        else "Medium"
        if grammar_accuracy < 3.8 or error_density >= 2.8
        else "High"
    )
    lexical = (
        "Low"
        if lexical_resource < 3 or ttr < 0.45
        else "Medium"
        if lexical_resource < 3.9 or ttr < 0.54
        else "High"
    )
    help_state = (
        "Adaptive" if help_messages >= 1 and vocabulary_help_count > 0 else "Present" if help_messages >= 1 else "None"
    )

    return {
        "forethought": forethought,
        "argument": argument,
        "cohesion": cohesion_state,
        "revision": revision,
        "feedback": feedback,
        "linguistic": linguistic,
        "lexical": lexical,
        "help": help_state,
    }


def build_signals(row, vocabulary_help_count: int = 0) -> Dict[str, object]:
    total_quality = _average(
        [
            _as_float(_value(row, "argumentation")),
            _as_float(_value(row, "cohesion")),
            _as_float(_value(row, "grammar_accuracy")),
            _as_float(_value(row, "lexical_resource")),
        ]
    )
    states = build_bayesian_states(row, vocabulary_help_count)

    assignment_views = _as_float(_value(row, "assignment_views"))
    resource_access_count = _as_float(_value(row, "resource_access_count"))
    time_on_task = _as_float(_value(row, "time_on_task"))
    rubric_views = _as_float(_value(row, "rubric_views"))
    first_access_delay = _as_float(_value(row, "first_access_delay_minutes"))
    word_count = _as_float(_value(row, "word_count"))
    argumentation = _as_float(_value(row, "argumentation"))
    cohesion_index = _as_float(_value(row, "cohesion_index"))
    cohesion = _as_float(_value(row, "cohesion"))
    grammar_accuracy = _as_float(_value(row, "grammar_accuracy"))
    error_density = _as_float(_value(row, "error_density"))
    lexical_resource = _as_float(_value(row, "lexical_resource"))
    ttr = _as_float(_value(row, "ttr"))
    revision_frequency = _as_float(_value(row, "revision_frequency"))
    help_messages = _as_float(_value(row, "help_seeking_messages"))
    feedback_views = _as_float(_value(row, "feedback_views"))
    total_score = _as_float(_value(row, "total_score"))
    score_gain = _as_float(_value(row, "score_gain"))

    low_grammar = grammar_accuracy < 3 or error_density >= 4
    strong_writing = total_quality >= 4 and total_score >= 21.5

    return {
        "states": states,
        "vocabulary_help_count": vocabulary_help_count,
        "total_quality": total_quality,
        "low_engagement": time_on_task < 40 and resource_access_count < 3 and feedback_views == 0,
        "high_engagement": time_on_task >= 90 and resource_access_count >= 5 and assignment_views >= 10,
        "strong_planning": rubric_views >= 3 and first_access_delay <= 30,
        "low_planning": rubric_views == 0 and first_access_delay > 30,
        "low_word_count": word_count < 120,
        "adequate_word_count": word_count >= 150,
        "weak_argument": argumentation < 3.6,
        "very_weak_argument": argumentation < 3,
        "acceptable_argument": argumentation >= 3.2,
        "low_cohesion": cohesion_index <= 2 or cohesion < 3,
        "strong_cohesion": cohesion_index >= 4 and cohesion >= 4,
        "low_grammar": low_grammar,
        "persistent_grammar_problems": (grammar_accuracy < 3.2 or error_density >= 3.5)
        and feedback_views >= 1
        and revision_frequency >= 2,
        "low_lexical": lexical_resource < 3 or ttr < 0.45,
        "moderate_revision": 1 <= revision_frequency <= 2,
        "no_revision": revision_frequency == 0,
        "limited_revision": revision_frequency <= 1,
        "strong_revision": revision_frequency >= 3,
        "help_none": help_messages == 0,
        "help_present": help_messages >= 1,
        "feedback_viewed_not_used": feedback_views >= 1 and revision_frequency == 0,
        "feedback_responsive": feedback_views >= 2 and revision_frequency >= 2 and score_gain >= 2,
        "strong_writing": strong_writing,
        "acceptable_writing": total_quality >= 3.2 and total_score >= 18,
        "weak_writing": total_quality < 3.2 or total_score < 17,
        "improvement_visible": score_gain >= 2,
        "repeated_difficulty": total_score < 17 or (argumentation < 3.1 and cohesion < 3.1) or error_density >= 4,
        "low_time_on_task": time_on_task < 30,
        "high_assignment_views": assignment_views >= 10,
        "vocabulary_help_available": vocabulary_help_count > 0,
        "grammar_stable": not low_grammar,
        "writing_not_strong": not strong_writing,
    }


def _build_ai_context(states: Dict[str, str], extra: Dict[str, Any] = None) -> Dict[str, Any]:
    context = {
        "ai_forethought_state": states["forethought"],
        "ai_argument_state": states["argument"],
        "ai_cohesion_state": states["cohesion"],
        "ai_revision_state": states["revision"],
        "ai_feedback_state": states["feedback"],
        "ai_linguistic_state": states["linguistic"],
        "ai_lexical_state": states["lexical"],
        "ai_help_state": states["help"],
    }
    if extra:
        context.update(extra)
    return context


def _select_profile_rule(signals: Dict[str, Any], ai_context: Dict[str, Any]) -> Dict[str, Any]:
    for rule in _sort_rules(PROFILE_RULES, "profile_id"):
        conditions = rule.get("conditions", {})
        if _match_condition_group(signals, conditions.get("thresholds", {})) and _match_condition_group(
            ai_context, conditions.get("ai_states", {})
        ):
            return rule
    return PROFILE_RULES_BY_ID["engaged_but_developing"]


def _match_feedback_rules(signals: Dict[str, Any], ai_context: Dict[str, Any]) -> List[Dict[str, Any]]:
    matched = []
    for rule in _sort_rules(FEEDBACK_RULES, "rule_id"):
        if not rule.get("enabled", True):
            continue
        conditions = rule.get("conditions", {})
        if _match_condition_group(signals, conditions.get("thresholds", {})) and _match_condition_group(
            ai_context, conditions.get("ai_states", {})
        ):
            matched.append(rule)
    return matched


def _resolve_cluster_label(row, profile_rule: Dict[str, Any]) -> int:
    for key in ("cluster_label", "cluster_id"):
        raw_value = row.get(key)
        if raw_value is None or raw_value == "":
            continue
        try:
            label = int(float(raw_value))
        except (TypeError, ValueError):
            continue
        if label in CLUSTER_LABELS:
            return label
    return int(profile_rule.get("cluster_label_hint", 3))


def _resolve_cluster_profile(row, cluster_label: int, profile_rule: Dict[str, Any]) -> str:
    direct = row.get("cluster_profile")
    if isinstance(direct, str) and direct.strip():
        return direct.strip()
    return profile_rule.get("cluster_profile_hint") or get_cluster_label_description(cluster_label)


def _build_rule_match(rule: Dict[str, Any]) -> Dict[str, Any]:
    display = rule["display"]
    actions = rule["actions"]
    template_ids = list(actions.get("feedback_templates", []))
    intervention_ids = list(actions.get("onsite_interventions", []))
    return {
        "rule_id": rule["rule_id"],
        "category": rule["category"],
        "priority": rule["priority"],
        "raw_data_condition": display["raw_data_condition"],
        "ai_learner_state_output": display["ai_learner_state_output"],
        "pedagogical_interpretation": display["pedagogical_interpretation"],
        "adaptive_feedback_type": display["adaptive_feedback_type"],
        "feedback_message_focus": display["feedback_message_focus"],
        "theoretical_justification": display["theoretical_justification"],
        "feedback_templates": template_ids,
        "feedback_messages": [FEEDBACK_TEMPLATES.get(template_id, "") for template_id in template_ids],
        "onsite_interventions": intervention_ids,
    }


def _estimate_predicted_score(row, predicted_improvement: str) -> float:
    gain_multiplier = (
        1.2
        if predicted_improvement == "High"
        else 1.05
        if predicted_improvement == "Moderate-High"
        else 0.9
        if predicted_improvement == "Moderate"
        else 0.75
        if predicted_improvement == "Low-Moderate"
        else 0.6
    )
    total_score = _as_float(_value(row, "total_score"))
    score_gain = _as_float(_value(row, "score_gain"))
    return round(total_score + score_gain * gain_multiplier, 1)


def _fallback_feedback_rules() -> List[Dict[str, Any]]:
    return [FEEDBACK_RULES_BY_ID["B2"], FEEDBACK_RULES_BY_ID["C2"]]


def compute_adaptive_decision(row, vocabulary_help_count: int = 0) -> Dict[str, object]:
    signals = build_signals(row, vocabulary_help_count)
    states = signals["states"]
    base_ai_context = _build_ai_context(states)
    profile_rule = _select_profile_rule(signals, base_ai_context)
    ai_context = _build_ai_context(
        states,
        {
            "profile_id": profile_rule["profile_id"],
            "predicted_improvement": profile_rule["predicted_improvement"],
        },
    )

    matched_feedback_rules = _match_feedback_rules(signals, ai_context)
    if not matched_feedback_rules:
        matched_feedback_rules = _fallback_feedback_rules()

    rule_ids = _unique([rule["rule_id"] for rule in matched_feedback_rules])
    rule_matches = [_build_rule_match(rule) for rule in matched_feedback_rules]

    template_ids = _unique(
        [template_id for rule in matched_feedback_rules for template_id in rule["actions"].get("feedback_templates", [])]
    )
    interventions = _unique(
        [item for rule in matched_feedback_rules for item in rule["actions"].get("onsite_interventions", [])]
    )
    interpretations = _unique([rule["display"]["pedagogical_interpretation"] for rule in matched_feedback_rules])
    feedback_parts = [FEEDBACK_TEMPLATES[template_id] for template_id in template_ids if template_id in FEEDBACK_TEMPLATES]

    focus_candidates = _unique(
        [profile_rule.get("default_focus_statement", "")]
        + [rule["actions"].get("focus_statement", "") for rule in matched_feedback_rules]
    )
    final_feedback_focus = (
        focus_candidates[0]
        if focus_candidates
        else "Support the next revision at the level of reasoning, organization, and explanation rather than surface correction alone."
    )

    cluster_label = _resolve_cluster_label(row, profile_rule)
    cluster_profile = _resolve_cluster_profile(row, cluster_label, profile_rule)

    final_feedback_message = (
        " ".join(feedback_parts)
        if feedback_parts
        else "No specific writing needs detected. Continue following the task guidelines."
    )

    return {
        "learner_profile": profile_rule["display_label"],
        "profile_rule_id": profile_rule["profile_id"],
        "cluster_profile": cluster_profile,
        "clustering_output": cluster_profile,
        "cluster_label": cluster_label,
        "predicted_improvement": profile_rule["predicted_improvement"],
        "random_forest_output": profile_rule["random_forest_summary"],
        "bayesian_output": profile_rule["bayesian_summary"],
        "ai_forethought_state": states["forethought"],
        "ai_argument_state": states["argument"],
        "ai_cohesion_state": states["cohesion"],
        "ai_revision_state": states["revision"],
        "ai_feedback_state": states["feedback"],
        "ai_linguistic_state": states["linguistic"],
        "ai_lexical_state": states["lexical"],
        "ai_help_state": states["help"],
        "triggered_rules": _delimited(rule_ids),
        "triggered_rule_ids": _delimited(rule_ids),
        "interpretations": _delimited(interpretations),
        "feedback_types": _delimited(template_ids),
        "feedback_templates_selected": _delimited(template_ids),
        "onsite_interventions": _delimited(interventions),
        "final_feedback_focus": final_feedback_focus,
        "teacher_validation_prompt": (
            "Teacher validation required: confirm that the main focus should be "
            f"\"{final_feedback_focus}\" before releasing the student-facing message."
        ),
        "predicted_score": _estimate_predicted_score(row, profile_rule["predicted_improvement"]),
        "final_feedback_message": final_feedback_message,
        "personalized_feedback": final_feedback_message,
        "rule_matches": rule_matches,
    }
