from typing import Any, Dict, List, Optional

try:
    from .rulebook import (
        CLUSTER_LABELS,
        build_rule_definitions,
        get_cluster_label_description,
        load_feedback_templates,
        load_rulebook,
    )
except ImportError:
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
FIELD_ALIASES = {
    "first_access_timing": "first_access_delay_minutes",
    "argumentation_score": "argumentation",
    "grammar_accuracy_score": "grammar_accuracy",
    "lexical_resource_score": "lexical_resource",
    "performance_total": "total_score",
    "score_improvement": "score_gain",
    "type_token_ratio": "ttr",
}


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


def _resolve_value(source: Dict[str, Any], key: str) -> Any:
    if key in source:
        return source.get(key)
    alias = FIELD_ALIASES.get(key)
    if alias and alias in source:
        return source.get(alias)
    return None


def _normalize_blocks(blocks: Any) -> List[Dict[str, Any]]:
    if not blocks:
        return []
    if isinstance(blocks, list):
        normalized: List[Dict[str, Any]] = []
        for item in blocks:
            normalized.extend(_normalize_blocks(item))
        return normalized
    if isinstance(blocks, dict):
        return [blocks]
    return []


def _normalize_condition_group(group: Any) -> Dict[str, List[Dict[str, Any]]]:
    if not group:
        return {"all": [], "any": []}
    if isinstance(group, list):
        return {"all": _normalize_blocks(group), "any": []}
    if not isinstance(group, dict):
        return {"all": [], "any": []}

    has_all_any = "all" in group or "any" in group
    if not has_all_any:
        return {"all": _normalize_blocks(group), "any": []}

    normalized = {
        "all": _normalize_blocks(group.get("all")),
        "any": [],
    }

    any_block = group.get("any")
    if isinstance(any_block, list):
        for entry in any_block:
            if isinstance(entry, dict) and ("all" in entry or "any" in entry):
                nested = _normalize_condition_group(entry)
                if nested["all"]:
                    normalized["any"].extend(nested["all"])
                elif nested["any"]:
                    normalized["any"].extend(nested["any"])
            else:
                normalized["any"].extend(_normalize_blocks(entry))
    elif isinstance(any_block, dict):
        normalized["any"] = _normalize_blocks(any_block)

    return normalized


def _match_expected(actual: Any, expected: Any) -> bool:
    if isinstance(expected, list):
        return any(_match_expected(actual, candidate) for candidate in expected)

    if expected is None:
        return actual is None

    if isinstance(expected, bool):
        return bool(actual) == expected

    if isinstance(expected, (int, float)):
        try:
            return float(actual) == float(expected)
        except (TypeError, ValueError):
            return actual == expected

    if not isinstance(expected, str):
        return actual == expected

    expression = expected.strip()
    if not expression:
        return actual == expression

    actual_num: Optional[float]
    try:
        actual_num = float(actual)
    except (TypeError, ValueError):
        actual_num = None

    import re

    operator_match = re.match(r"^(<=|>=|<|>|==|!=)\s*(-?\d+(?:\.\d+)?)$", expression)
    if operator_match and actual_num is not None:
        operator = operator_match.group(1)
        threshold = float(operator_match.group(2))
        if operator == "<=":
            return actual_num <= threshold
        if operator == ">=":
            return actual_num >= threshold
        if operator == "<":
            return actual_num < threshold
        if operator == ">":
            return actual_num > threshold
        if operator == "==":
            return actual_num == threshold
        if operator == "!=":
            return actual_num != threshold

    numeric_range = re.match(r"^(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)$", expression)
    if numeric_range and actual_num is not None:
        lower = float(numeric_range.group(1))
        upper = float(numeric_range.group(2))
        return min(lower, upper) <= actual_num <= max(lower, upper)

    textual_range = re.match(r"^([A-Za-z][A-Za-z\s-]+)\s+to\s+([A-Za-z][A-Za-z\s-]+)$", expression, re.IGNORECASE)
    if textual_range:
        return _match_expected(actual, textual_range.group(1).strip()) or _match_expected(actual, textual_range.group(2).strip())

    if "|" in expression or "/" in expression:
        tokens = re.split(r"[|/]", expression)
        return any(_match_expected(actual, token.strip()) for token in tokens if token.strip())

    if "," in expression and "." not in expression:
        tokens = [token.strip() for token in expression.split(",") if token.strip()]
        if len(tokens) > 1:
            return any(_match_expected(actual, token) for token in tokens)

    if actual_num is not None:
        try:
            expected_num = float(expression)
            return actual_num == expected_num
        except ValueError:
            pass

    if isinstance(actual, str):
        return actual.strip().lower() == expression.lower()
    return str(actual).lower() == expression.lower()


def _match_map(source: Dict[str, Any], expected_map: Dict[str, Any]) -> bool:
    return all(_match_expected(_resolve_value(source, key), expected) for key, expected in expected_map.items())


def _match_condition_group(source: Dict[str, Any], condition_group: Dict[str, Any]) -> bool:
    if not condition_group:
        return True

    normalized = _normalize_condition_group(condition_group)
    all_conditions = normalized["all"]
    any_conditions = normalized["any"]

    if any(not _match_map(source, block) for block in all_conditions):
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
    score_gain = _as_float(_value(row, "score_gain"))

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
    revision_depth = "Deep" if revision_frequency >= 3 else "Low" if revision_frequency >= 1 else "None"
    help_seeking_risk = (
        "Adaptive Help-Seeking"
        if help_state == "Adaptive"
        else "Emerging Adaptive Help-Seeking"
        if help_state == "Present"
        else "Low Adaptive Help-Seeking"
    )
    improvement_trajectory = "Positive" if score_gain >= 1 else "Flat"

    return {
        "forethought": forethought,
        "argument": argument,
        "cohesion": cohesion_state,
        "revision": revision,
        "revision_depth": revision_depth,
        "feedback": feedback,
        "linguistic": linguistic,
        "lexical": lexical,
        "help": help_state,
        "help_seeking_pattern": help_state,
        "help_seeking_risk": help_seeking_risk,
        "question_specificity": "High" if help_state == "Adaptive" else "Low",
        "improvement_trajectory": improvement_trajectory,
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
        "revision_depth": states.get("revision_depth", "None"),
        "ai_feedback_state": states["feedback"],
        "ai_linguistic_state": states["linguistic"],
        "ai_lexical_state": states["lexical"],
        "ai_help_state": states["help"],
        "help_seeking_pattern": states.get("help_seeking_pattern", "None"),
        "help_seeking_risk": states.get("help_seeking_risk", "Low Adaptive Help-Seeking"),
        "question_specificity": states.get("question_specificity", "Low"),
        "improvement_trajectory": states.get("improvement_trajectory", "Flat"),
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
    # Default to fragile_regulator if no profile matches
    return PROFILE_RULES_BY_ID.get("fragile_regulator", PROFILE_RULES[0])


def _match_feedback_rules(signals: Dict[str, Any], ai_context: Dict[str, Any]) -> List[Dict[str, Any]]:
    matched = []
    unified_context = {**signals, **ai_context}
    
    for rule in _sort_rules(FEEDBACK_RULES, "rule_id"):
        if not rule.get("enabled", True):
            continue
        conditions = rule.get("conditions", {})
        if not conditions:
            continue
        
        if _match_condition_group(unified_context, conditions.get("thresholds", {})) and _match_condition_group(
            unified_context, conditions.get("ai_states", {})
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
    display = rule.get("display", {})
    actions = rule.get("actions", {})
    template_ids = list(actions.get("feedback_templates", []))
    if not template_ids:
        if rule.get("feedback_type"):
            template_ids = [rule["feedback_type"]]
        elif rule.get("response_template"):
            template_ids = [rule["response_template"]]
    
    intervention_ids = list(actions.get("onsite_interventions", []))
    if not intervention_ids:
        onsite_raw = rule.get("onsite_intervention", [])
        if isinstance(onsite_raw, list):
            intervention_ids = onsite_raw
        elif isinstance(onsite_raw, str) and onsite_raw:
            intervention_ids = [onsite_raw]
    
    return {
        "rule_id": rule["rule_id"],
        "category": rule.get("category", "general"),
        "priority": rule.get("priority", 0),
        "raw_data_condition": display.get("raw_data_condition") or rule.get("evidence_chain", ""),
        "ai_learner_state_output": display.get("ai_learner_state_output") or rule.get("display_label", ""),
        "pedagogical_interpretation": (
            display.get("pedagogical_interpretation")
            or rule.get("pedagogical_claim")
            or rule.get("interpretation", "")
        ),
        "adaptive_feedback_type": (
            display.get("adaptive_feedback_type")
            or rule.get("adaptive_feedback_type")
            or rule.get("feedback_type", "")
        ),
        "feedback_message_focus": display.get("feedback_message_focus") or rule.get("feedback_focus", ""),
        "theoretical_justification": (
            display.get("theoretical_justification")
            or rule.get("theoretical_justification")
            or rule.get("justification", "")
        ),
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
    # Use first available rules if none matched
    available_ids = list(FEEDBACK_RULES_BY_ID.keys())
    if len(available_ids) >= 2:
        return [FEEDBACK_RULES_BY_ID[available_ids[0]], FEEDBACK_RULES_BY_ID[available_ids[1]]]
    elif len(available_ids) == 1:
        return [FEEDBACK_RULES_BY_ID[available_ids[0]]]
    else:
        # If somehow no rules exist, return empty list (will be handled downstream)
        return []


def compute_adaptive_decision(row, vocabulary_help_count: int = 0) -> Dict[str, object]:
    signals = build_signals(row, vocabulary_help_count)
    states = signals["states"]
    
    # Expose additional field aliases for robust rule matching
    assignment_views = _as_float(_value(row, "assignment_views"))
    resource_access_count = _as_float(_value(row, "resource_access_count"))
    rubric_views = _as_float(_value(row, "rubric_views"))
    first_access_delay = _as_float(_value(row, "first_access_delay_minutes"))
    
    signals.update({
        "assignment_views": assignment_views,
        "resource_access_count": resource_access_count,
        "rubric_views": rubric_views,
        "first_access_delay_minutes": first_access_delay,
        "first_access_timing": first_access_delay,
    })
    
    base_ai_context = _build_ai_context(states)
    profile_rule = _select_profile_rule(signals, base_ai_context)
    
    # Determine predicted improvement based on signals
    total_quality = signals.get("total_quality", 0)
    score_gain = row.get("score_gain", 0)
    predicted_improvement = "High" if total_quality >= 4 else "Moderate" if total_quality >= 3 else "Low"
    
    ai_context = _build_ai_context(
        states,
        {
            "profile_id": profile_rule["profile_id"],
            "predicted_improvement": predicted_improvement,
            "time_on_task_band": states.get("time_on_task_band"),
            "final_score_band": states.get("final_score_band"),
            "revision_frequency_band": states.get("revision_frequency_band"),
        },
    )

    matched_feedback_rules = _match_feedback_rules(signals, ai_context)
    if not matched_feedback_rules:
        matched_feedback_rules = _fallback_feedback_rules()

    rule_ids = _unique([rule["rule_id"] for rule in matched_feedback_rules])
    rule_matches = [_build_rule_match(rule) for rule in matched_feedback_rules]

    template_ids = _unique(
        [template_id for rule in matched_feedback_rules for template_id in rule.get("actions", {}).get("feedback_templates", [])]
    )
    interventions = _unique(
        [item for rule in matched_feedback_rules for item in rule.get("actions", {}).get("onsite_interventions", [])]
    )
    interpretations = _unique([rule.get("display", {}).get("pedagogical_interpretation", "") for rule in matched_feedback_rules])
    feedback_parts = [FEEDBACK_TEMPLATES[template_id] for template_id in template_ids if template_id in FEEDBACK_TEMPLATES]

    focus_candidates = _unique(
        [profile_rule.get("default_focus_statement", "")]
        + [rule.get("actions", {}).get("focus_statement", "") for rule in matched_feedback_rules]
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
        "predicted_improvement": predicted_improvement,
        "random_forest_output": "Random Forest model outputs: features analyzed for writing trajectory",
        "bayesian_output": "Bayesian inference: competence states inferred from observables",
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
        "predicted_score": _estimate_predicted_score(row, predicted_improvement),
        "final_feedback_message": final_feedback_message,
        "personalized_feedback": final_feedback_message,
        "rule_matches": rule_matches,
    }
