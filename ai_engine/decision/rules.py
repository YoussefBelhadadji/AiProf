def evaluate_rules(indicators, flags, ai_states):
    rules = []
    
    if indicators.get("score", 0) < 70:
        rules.append({
            "rule_id": "R1",
            "reason": "Low writing performance"
        })
        
    if flags.get("timing_flag") == "LAST_MINUTE":
        rules.append({
            "rule_id": "R2",
            "reason": "Late submission behavior"
        })
        
    if ai_states.get("predicted_improvement") == "needs_support":
        rules.append({
            "rule_id": "R3",
            "reason": "Low improvement prediction"
        })
        
    return rules
