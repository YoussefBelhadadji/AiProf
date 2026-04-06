def bayesian_argument_competence(score):
    """
    تبسيط Bayesian logic
    """
    if score >= 4:
        return "high"
    elif score >= 2.5:
        return "medium"
    else:
        return "low"
