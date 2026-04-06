def forethought_risk(row):
    if row["rubric_views"] == 0 and row["time_on_task"] < 15 and row["word_count"] < 80:
        return "Forethought risk = High"
    if row["rubric_views"] <= 1 and row["time_on_task"] < 30:
        return "Forethought risk = Medium"
    return "Forethought risk = Low"

def argument_state(row):
    if row["argument_competence"] == "low":
        return "Argumentation weakness = High"
    if row["argument_competence"] == "medium":
        return "Argumentation weakness = Medium"
    return "Argumentation weakness = Low"

def revision_state(row):
    if row["revision_frequency"] == 0:
        return "Revision depth = Low"
    if row["revision_frequency"] == 1:
        return "Revision depth = Medium"
    return "Revision depth = High"

def feedback_state(row):
    if row["feedback_views"] >= 1 and row["revision_frequency"] == 0:
        return "Feedback uptake risk = High"
    if row["feedback_views"] >= 1 and row["revision_frequency"] == 1:
        return "Feedback uptake risk = Medium"
    return "Feedback uptake risk = Low"

def help_state(row):
    if row["help_seeking_messages"] >= 1:
        return "Help-seeking regulation = Adaptive"
    return "Help-seeking regulation = None"
