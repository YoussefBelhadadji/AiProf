def forethought_risk(row):
    rubric_views = row.get("rubric_views", 0)
    time_on_task = row.get("time_on_task", 0)
    word_count = row.get("word_count", 0)
    if rubric_views == 0 and time_on_task < 15 and word_count < 80:
        return "Forethought risk = High"
    if rubric_views <= 1 and time_on_task < 30:
        return "Forethought risk = Medium"
    return "Forethought risk = Low"


def engagement_risk(row):
    assignment_views = row.get("assignment_views", 0)
    resource_access_count = row.get("resource_access_count", 0)
    rubric_views = row.get("rubric_views", 0)
    if assignment_views <= 1 and resource_access_count == 0 and rubric_views == 0:
        return "Engagement risk = High"
    if assignment_views <= 3 or resource_access_count <= 1:
        return "Engagement risk = Medium"
    return "Engagement risk = Low"


def argument_state(row):
    competence = str(row.get("argument_competence", "unknown")).lower()
    if competence == "low":
        return "Argumentation weakness = High"
    if competence == "medium":
        return "Argumentation weakness = Medium"
    if competence == "high":
        return "Argumentation weakness = Low"

    score = float(row.get("argumentation", row.get("argumentation_score", 0)) or 0)
    if score <= 2:
        return "Argumentation weakness = High"
    if score <= 3:
        return "Argumentation weakness = Medium"
    return "Argumentation weakness = Low"


def discourse_state(row):
    cohesion = float(row.get("cohesion", row.get("cohesion_score", 0)) or 0)
    cohesion_index = float(row.get("cohesion_index", 0) or 0)
    organization = float(row.get("organization", row.get("organization_score", 0)) or 0)
    if organization <= 2 and cohesion_index < 2 and cohesion <= 2:
        return "Discourse competence = Low"
    if organization <= 3 or cohesion_index < 4:
        return "Discourse competence = Medium"
    return "Discourse competence = High"


def linguistic_accuracy_state(row):
    grammar = float(row.get("grammar_accuracy", row.get("grammar_accuracy_score", 0)) or 0)
    error_density = float(row.get("error_density", 0) or 0)
    if grammar <= 2 or error_density > 8:
        return "Linguistic accuracy = Low"
    if grammar == 3 or error_density > 4:
        return "Linguistic accuracy = Medium"
    return "Linguistic accuracy = High"


def lexical_state(row):
    lexical = float(row.get("lexical_resource", row.get("lexical_resource_score", 0)) or 0)
    ttr = float(row.get("ttr", row.get("type_token_ratio", 0)) or 0)
    if lexical <= 2 or ttr < 0.5:
        return "Lexical competence = Low"
    if lexical == 3 or ttr < 0.6:
        return "Lexical competence = Medium"
    return "Lexical competence = High"


def revision_state(row):
    revision = float(row.get("revision_frequency", 0) or 0)
    if revision == 0:
        return "Revision depth = Low"
    if revision == 1:
        return "Revision depth = Medium"
    return "Revision depth = High"


def feedback_state(row):
    feedback_views = float(row.get("feedback_views", 0) or 0)
    revision = float(row.get("revision_frequency", 0) or 0)
    if feedback_views >= 1 and revision == 0:
        return "Feedback uptake risk = High"
    if feedback_views >= 1 and revision == 1:
        return "Feedback uptake risk = Medium"
    return "Feedback uptake risk = Low"


def help_state(row):
    help_messages = float(row.get("help_seeking_messages", 0) or 0)
    message_type = str(row.get("message_type", "") or "").lower()
    if help_messages >= 3 or message_type in {"adaptive", "language_help", "argument_help"}:
        return "Help-seeking regulation = Adaptive"
    if help_messages >= 1:
        return "Help-seeking regulation = Procedural"
    return "Help-seeking regulation = None"


def predicted_improvement_state(value):
    try:
        numeric_value = float(value)
    except (TypeError, ValueError):
        return "Predicted improvement = Unknown"
    if numeric_value < 2:
        return "Predicted improvement = Low"
    if numeric_value < 5:
        return "Predicted improvement = Medium"
    return "Predicted improvement = High"


def ai_state_summary(row):
    return "; ".join(
        [
            forethought_risk(row),
            engagement_risk(row),
            argument_state(row),
            discourse_state(row),
            linguistic_accuracy_state(row),
            lexical_state(row),
            revision_state(row),
            feedback_state(row),
            help_state(row),
        ]
    )
