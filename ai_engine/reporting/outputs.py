def generate_ai_states(cluster, prediction, competence):
    return {
        "learner_profile": cluster,
        "predicted_improvement": prediction,
        "argument_competence": competence
    }
