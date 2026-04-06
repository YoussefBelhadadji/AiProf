import sys
import os
from pathlib import Path

# Fix relative imports dynamically if run directly
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from ai_engine.thresholds.engine import apply_thresholds
from ai_engine.ai.prediction import predict_improvement
from ai_engine.ai.bayesian import bayesian_argument_competence
from ai_engine.reporting.outputs import generate_ai_states
from ai_engine.decision.rules import evaluate_rules
from ai_engine.feedback.generator import generate_feedback

def full_pipeline(student_data, model):
    # 1. indicators
    indicators = {
        "score": student_data.get("score", 0),
        "days_before_deadline": student_data.get("days", 0)
    }

    # 2. thresholds
    flags = apply_thresholds(indicators)

    # 3. clustering
    cluster = "developing_writer"  # (تبسيط)

    # 4. prediction
    prediction = predict_improvement(model, [
        student_data.get("score", 0),
        student_data.get("days", 0),
        student_data.get("word_count", 0)
    ])

    # 5. bayesian
    competence = bayesian_argument_competence(student_data.get("score", 0))

    # 6. ai states
    ai_states = generate_ai_states(cluster, prediction, competence)

    # 7. rules
    rules = evaluate_rules(indicators, flags, ai_states)

    # 8. feedback
    feedback = generate_feedback(rules)

    return {
        "indicators": indicators,
        "flags": flags,
        "ai_states": ai_states,
        "rules": rules,
        "feedback": feedback
    }
