def apply_thresholds(indicators):
    score = indicators["score"]
    days = indicators["days_before_deadline"]

    return {
        "score_flag": "LOW" if score < 50 else "MEDIUM" if score < 70 else "HIGH",
        "timing_flag": "LATE" if days < 0 else "LAST_MINUTE" if days < 1 else "EARLY"
    }
