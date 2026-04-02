"""
Interpretation Engine - Convert data into pedagogical decisions
Rule-based system for adaptive feedback generation
"""

import yaml
from typing import Dict, List, Tuple
from pathlib import Path


class InterpretationEngine:
    """
    Rule-based pedagogical interpretation layer
    Maps observable indicators → pedagogical diagnoses → adaptive responses
    """
    
    def __init__(self, config_path: str = None):
        """Initialize with threshold and rule configuration"""
        if config_path is None:
            config_path = Path(__file__).parent.parent / "config" / "thresholds.yaml"
        
        self.config = self._load_config(config_path)
        self.thresholds = self.config.get("thresholds", {})
        self.rules = self.config.get("interpretation_rules", {})
        self.templates = self.config.get("feedback_templates", {})
    
    def _load_config(self, config_path: str) -> Dict:
        """Load YAML configuration"""
        try:
            with open(config_path, 'r') as f:
                return yaml.safe_load(f)
        except Exception as e:
            print(f"Warning: Could not load config from {config_path}: {e}")
            return {"thresholds": {}, "interpretation_rules": {}, "feedback_templates": {}}
    
    def evaluate_student(self, student_data: Dict) -> Dict:
        """
        Complete pedagogical evaluation of student profile
        """
        # Step 1: Evaluate thresholds for each indicator
        threshold_results = self._evaluate_thresholds(student_data)
        
        # Step 2: Apply interpretation rules
        triggered_rules = self._apply_rules(threshold_results)
        
        # Step 3: Generate pedagogical diagnosis
        diagnosis = self._generate_diagnosis(triggered_rules, threshold_results)
        
        # Step 4: Select feedback and interventions
        feedback = self._select_feedback(triggered_rules, diagnosis)
        
        return {
            "threshold_evaluation": threshold_results,
            "triggered_rules": triggered_rules,
            "diagnosis": diagnosis,
            "adaptive_feedback": feedback,
        }
    
    def _evaluate_thresholds(self, student_data: Dict) -> Dict:
        """
        Evaluate all indicators against thresholds
        Returns: low/moderate/high categorization for each indicator
        """
        results = {}
        
        # Planning phase
        planning_results = {}
        if "assignment_views" in student_data:
            planning_results["assignment_views"] = self._categorize(
                student_data["assignment_views"],
                self.thresholds.get("planning", {}).get("assignment_views", {})
            )
        if "rubric_views" in student_data:
            planning_results["rubric_views"] = self._categorize(
                student_data["rubric_views"],
                self.thresholds.get("planning", {}).get("rubric_views", {})
            )
        if "time_to_first_action" in student_data:
            planning_results["time_to_first_action"] = self._categorize(
                student_data["time_to_first_action"],
                self.thresholds.get("planning", {}).get("time_to_first_action", {})
            )
        results["planning"] = planning_results
        
        # Product quality
        product_results = {}
        if "rubric_organization" in student_data:
            product_results["rubric_organization"] = self._categorize(
                student_data["rubric_organization"],
                self.thresholds.get("product", {}).get("rubric_organization", {})
            )
        if "rubric_argument" in student_data:
            product_results["rubric_argument"] = self._categorize(
                student_data["rubric_argument"],
                self.thresholds.get("product", {}).get("rubric_argument", {})
            )
        if "cohesion_index" in student_data:
            product_results["cohesion_index"] = self._categorize(
                student_data["cohesion_index"],
                self.thresholds.get("product", {}).get("cohesion_index", {})
            )
        results["product"] = product_results
        
        # Revision behavior
        revision_results = {}
        if "revision_frequency" in student_data:
            revision_results["revision_frequency"] = self._categorize(
                student_data["revision_frequency"],
                self.thresholds.get("revision", {}).get("revision_frequency", {})
            )
        if "feedback_views" in student_data:
            revision_results["feedback_views"] = self._categorize(
                student_data["feedback_views"],
                self.thresholds.get("revision", {}).get("feedback_views", {})
            )
        results["revision"] = revision_results
        
        return results
    
    def _categorize(self, value, threshold_config: Dict) -> str:
        """
        Compare value against threshold configuration
        Returns: "low", "moderate", "adequate", "strong", etc.
        """
        if not threshold_config:
            return "not_evaluated"
        
        # Handle numeric thresholds
        if isinstance(value, (int, float)):
            if "low" in threshold_config and value <= threshold_config["low"]:
                return "low"
            elif "moderate" in threshold_config and value <= threshold_config["moderate"]:
                return "moderate"
            elif "high" in threshold_config or "strong" in threshold_config:
                return "high" if "high" in threshold_config else "strong"
            else:
                return "adequate"
        
        # Handle string/categorical thresholds
        else:
            return threshold_config.get(value, "unknown")
    
    def _apply_rules(self, threshold_results: Dict) -> List[str]:
        """
        Apply interpretation rules to threshold results
        Returns: list of triggered rule IDs
        """
        triggered = []
        
        for rule_id, rule in self.rules.items():
            if self._check_rule_condition(rule, threshold_results):
                triggered.append(rule_id)
        
        return triggered
    
    def _check_rule_condition(self, rule: Dict, results: Dict) -> bool:
        """
        Check if all conditions for a rule are met
        """
        conditions = rule.get("condition", [])
        if not conditions:
            return False
        
        # Simplified condition check - in production would be more sophisticated
        # For now: check if conditions reference low/weak indicators
        for condition in conditions:
            # This is a placeholder - would need to parse actual conditions
            if "low" in str(condition) or "weak" in str(condition):
                return True
        
        return False
    
    def _generate_diagnosis(self, triggered_rules: List[str], results: Dict) -> Dict:
        """
        Generate comprehensive pedagogical diagnosis from triggered rules
        """
        diagnosis = {
            "profile": "",
            "key_findings": [],
            "intervention_priority": "none",
            "learning_needs": {},
        }
        
        if not triggered_rules:
            diagnosis["profile"] = "Strategic writer with strong engagement"
            diagnosis["intervention_priority"] = "none"
            return diagnosis
        
        # Categorize by severity
        if any(rule in triggered_rules for rule in ["rule_e1"]):
            diagnosis["intervention_priority"] = "critical"
            diagnosis["profile"] = "At-risk learner - comprehensive support needed"
        elif any(rule in triggered_rules for rule in ["rule_b1", "rule_b2"]):
            diagnosis["intervention_priority"] = "high"
            diagnosis["profile"] = "Effortful but struggling writer"
        elif any(rule in triggered_rules for rule in ["rule_a1", "rule_a2"]):
            diagnosis["intervention_priority"] = "moderate"
            diagnosis["profile"] = "Engaged with planning-phase support needs"
        else:
            diagnosis["intervention_priority"] = "low"
            diagnosis["profile"] = "Engaged and responsive writer"
        
        # Map triggered rules to learning needs
        for rule_id in triggered_rules:
            if rule_id in self.rules:
                rule = self.rules[rule_id]
                interpretation = rule.get("interpretation", "")
                diagnosis["key_findings"].append(interpretation)
                
                category = rule.get("name", rule_id)
                diagnosis["learning_needs"][category] = rule.get("pedagogical_response", "")
        
        return diagnosis
    
    def _select_feedback(self, triggered_rules: List[str], diagnosis: Dict) -> Dict:
        """
        Select appropriate feedback templates and interventions
        """
        feedback = {
            "online_feedback": "",
            "onsite_intervention": "",
            "metacognitive_prompts": [],
            "next_writing_goal": "",
        }
        
        # Select based on priority
        priority = diagnosis["intervention_priority"]
        
        if priority == "critical":
            feedback["online_feedback"] = self.templates.get("low_engagement", {}).get("level_0", "")
            feedback["onsite_intervention"] = "Comprehensive check-in conference needed"
            feedback["metacognitive_prompts"] = [
                "What challenges are you facing with this assignment?",
                "What support would help you most right now?"
            ]
        
        elif priority == "high":
            feedback["online_feedback"] = self.templates.get("argument_development", {}).get("level_0", "")
            feedback["onsite_intervention"] = "Guided paragraph revision and modeling"
            feedback["metacognitive_prompts"] = [
                "Which part of your argument needs strongest evidence?",
                "How could you explain why your evidence matters?"
            ]
        
        elif priority == "moderate":
            feedback["online_feedback"] = self.templates.get("low_engagement", {}).get("level_1", "")
            feedback["onsite_intervention"] = "Planning workshop and rubric consultation"
            feedback["metacognitive_prompts"] = [
                "What does the rubric say about good organization?",
                "How would you start this paragraph?"
            ]
        
        else:
            feedback["online_feedback"] = "Continue with this strong engagement approach!"
            feedback["onsite_intervention"] = "Check-in to challenge further development"
            feedback["metacognitive_prompts"] = [
                "What's working well in your writing?",
                "What's one area you'd like to strengthen further?"
            ]
        
        # Set next goal
        if "low" in str(diagnosis.get("learning_needs", {}).keys()):
            feedback["next_writing_goal"] = "Focus on strengthening argument with specific evidence"
        elif "cohesion" in str(diagnosis.get("learning_needs", {}).keys()):
            feedback["next_writing_goal"] = "Practice smooth transitions between ideas"
        else:
            feedback["next_writing_goal"] = "Move to more complex argument structures"
        
        return feedback


class ThresholdValidator:
    """
    Validate and calibrate thresholds based on pilot data
    """
    
    @staticmethod
    def validate_threshold(indicator_name: str, values: List[float], 
                          config: Dict) -> Dict:
        """
        Check if threshold makes sense for given data distribution
        """
        import statistics
        
        if not values:
            return {"valid": False, "reason": "No data"}
        
        mean = statistics.mean(values)
        stdev = statistics.stdev(values) if len(values) > 1 else 0
        
        # Get configured threshold
        threshold = config.get("low")
        
        recommendation = {
            "indicator": indicator_name,
            "current_threshold": threshold,
            "data_mean": round(mean, 3),
            "data_stdev": round(stdev, 3),
            "sample_size": len(values),
        }
        
        # Flag if threshold seems misaligned
        if threshold is None:
            recommendation["recommendation"] = "Threshold not configured"
            recommendation["valid"] = False
        elif threshold > mean + stdev:
            recommendation["recommendation"] = "Threshold may be too high - consider lowering"
            recommendation["valid"] = False
        elif threshold < mean - stdev:
            recommendation["recommendation"] = "Threshold may be too low - consider raising"
            recommendation["valid"] = False
        else:
            recommendation["recommendation"] = "Threshold well-calibrated"
            recommendation["valid"] = True
        
        return recommendation


if __name__ == "__main__":
    engine = InterpretationEngine()
    
    # Test data
    student_data = {
        "assignment_views": 1,
        "rubric_views": 0,
        "time_to_first_action": "3 min",
        "revision_frequency": 0,
        "feedback_views": 0,
        "rubric_organization": 2,
        "rubric_argument": 2,
        "word_count": 75,
        "cohesion_index": 0.25,
    }
    
    results = engine.evaluate_student(student_data)
    print("Evaluation Results:")
    print(f"Profile: {results['diagnosis']['profile']}")
    print(f"Priority: {results['diagnosis']['intervention_priority']}")
    print(f"Triggered Rules: {results['triggered_rules']}")
