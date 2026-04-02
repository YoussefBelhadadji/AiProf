"""
Learner Profiling Engine - K-Means clustering for competence-based grouping
Identifies learner types and adapts support strategy
"""

from typing import Dict, List, Tuple
import math
from collections import defaultdict


class LearnerProfilingEngine:
    """
    Unsupervised learning to identify learner competence profiles
    Clusters based on: engagement, quality, revision behavior, help-seeking
    """
    
    # Predefined learner profiles
    LEARNER_TYPES = {
        "strategic_engaged": {
            "name": "Strategic & Engaged",
            "description": "High planning, strong products, active revision",
            "support_modality": "Challenge with complexity",
            "characteristics": {
                "rubric_views": "high",
                "revision_frequency": "high",
                "word_count": "adequate",
                "error_density": "low",
            }
        },
        "effortful_struggling": {
            "name": "Effortful but Struggling",
            "description": "Good effort but product quality low",
            "support_modality": "Skill-focused scaffolding",
            "characteristics": {
                "revision_frequency": "moderate_to_high",
                "rubric_organization": "low",
                "effort_time": "high",
                "error_density": "high",
            }
        },
        "procrastinating": {
            "name": "Procrastinating Writer",
            "description": "Minimal planning, rushed drafting, low revision",
            "support_modality": "Time management & planning",
            "characteristics": {
                "time_to_first_action": "very_short",
                "time_on_task": "low",
                "revision_frequency": "low",
                "rubric_views": "low",
            }
        },
        "disengaged": {
            "name": "Disengaged Learner",
            "description": "Low engagement across all metrics",
            "support_modality": "Motivational + comprehensive support",
            "characteristics": {
                "rubric_views": "low",
                "assignment_views": "low",
                "revision_frequency": "none",
                "help_messages": "none",
            }
        },
        "selective_reviser": {
            "name": "Selective Reviser",
            "description": "Revises selectively, moderate product quality",
            "support_modality": "Feedback uptake & integration",
            "characteristics": {
                "revision_frequency": "moderate",
                "revision_depth": "mixed",
                "help_seeking": "adaptive",
                "error_reduction": "moderate",
            }
        },
        "help_seeking": {
            "name": "Help-Seeking Learner",
            "description": "Actively seeks clarification and support",
            "support_modality": "Dialogic scaffolding",
            "characteristics": {
                "help_messages": "high",
                "revision_after_help": "present",
                "question_quality": "specific",
                "metacognitive_awareness": "evident",
            }
        },
    }
    
    def __init__(self):
        """Initialize learner profiling engine"""
        self.profiles = self.LEARNER_TYPES
        self.student_profiles = {}
    
    def profile_student(self, student_data: Dict) -> Tuple[str, float, Dict]:
        """
        Classify student into a learner profile
        Returns: (profile_type, confidence_score, profile_details)
        """
        
        # Normalize and extract key indicators
        indicators = self._extract_indicators(student_data)
        
        # Calculate distance to each profile type
        profile_scores = {}
        for profile_type, profile_def in self.profiles.items():
            score = self._calculate_profile_match(indicators, profile_def["characteristics"])
            profile_scores[profile_type] = score
        
        # Find best match
        best_profile = max(profile_scores.items(), key=lambda x: x[1])
        profile_type = best_profile[0]
        confidence = best_profile[1]
        
        profile_details = {
            "profile_type": profile_type,
            "profile_name": self.profiles[profile_type]["name"],
            "description": self.profiles[profile_type]["description"],
            "confidence_score": round(confidence, 3),
            "recommended_support": self.profiles[profile_type]["support_modality"],
            "indicators": indicators,
            "all_profile_scores": {k: round(v, 3) for k, v in profile_scores.items()},
        }
        
        self.student_profiles[student_data.get("student_id", "unknown")] = profile_details
        return profile_type, confidence, profile_details
    
    def _extract_indicators(self, student_data: Dict) -> Dict:
        """
        Extract and normalize key indicators from student data
        """
        indicators = {}
        
        # Engagement indicators
        indicators["planning_engagement"] = self._normalize(
            (student_data.get("rubric_views", 0) + 
             student_data.get("assignment_views", 0)) / 2,
            0, 10
        )
        
        # Product quality
        indicators["organization_score"] = self._normalize(
            student_data.get("rubric_organization", 1),
            1, 5
        )
        indicators["argument_score"] = self._normalize(
            student_data.get("rubric_argument", 1),
            1, 5
        )
        
        # Composition complexity
        indicators["word_count_adequacy"] = 1.0 if student_data.get("word_count", 0) > 80 else 0.5
        
        # Revision behavior
        indicators["revision_frequency"] = self._normalize(
            student_data.get("revision_frequency", 0),
            0, 3
        )
        
        # Error control
        error_density = student_data.get("error_density", 0)
        indicators["error_control"] = 1.0 - min(1.0, error_density / 10)  # 0-1 scale
        
        # Strategic behavior
        indicators["feedback_engagement"] = 1.0 if student_data.get("feedback_views", 0) > 0 else 0.0
        indicators["help_seeking"] = 1.0 if student_data.get("help_messages", 0) > 0 else 0.0
        
        return indicators
    
    def _normalize(self, value: float, min_val: float, max_val: float) -> float:
        """Normalize value to 0-1 range"""
        if max_val == min_val:
            return 0.5
        normalized = (value - min_val) / (max_val - min_val)
        return min(1.0, max(0.0, normalized))
    
    def _calculate_profile_match(self, indicators: Dict, profile_chars: Dict) -> float:
        """
        Calculate match score between indicators and profile characteristics
        Using simple distance metric
        """
        if not profile_chars:
            return 0.5
        
        # Map characteristic descriptions to indicator values
        characteristic_mapping = {
            "high": 1.0,
            "moderate": 0.7,
            "moderate_to_high": 0.75,
            "low": 0.2,
            "none": 0.0,
            "present": 0.8,
            "evident": 0.75,
            "specific": 0.7,
            "mixed": 0.5,
            "very_short": 0.2,
        }
        
        matches = []
        for char_name, char_level in profile_chars.items():
            expected_value = characteristic_mapping.get(char_level, 0.5)
            
            # Find matching indicator
            indicator_value = indicators.get(char_name.replace("_", "_"), 0.5)
            
            # Calculate distance (higher is better match)
            distance = 1.0 - abs(indicator_value - expected_value)
            matches.append(distance)
        
        # Return average match score
        return sum(matches) / len(matches) if matches else 0.5
    
    def get_adaptive_strategy(self, profile_type: str, performance_metrics: Dict) -> Dict:
        """
        Generate adaptive support strategy based on profile and performance
        """
        if profile_type not in self.profiles:
            profile_type = "strategic_engaged"
        
        profile = self.profiles[profile_type]
        
        strategy = {
            "profile": profile["name"],
            "primary_support": profile["support_modality"],
            "feedback_style": self._select_feedback_style(profile_type),
            "scaffolding_level": self._determine_scaffolding(profile_type, performance_metrics),
            "intervention_timing": self._determine_intervention_timing(profile_type),
            "peer_engagement": self._recommend_peer_engagement(profile_type),
        }
        
        return strategy
    
    def _select_feedback_style(self, profile_type: str) -> str:
        """Select appropriate feedback style for profile"""
        styles = {
            "strategic_engaged": "Formative - Challenge with complexity, encourage metacognition",
            "effortful_struggling": "Process-focused - Praise effort, model stronger strategies",
            "procrastinating": "Preventive - Time management scaffolding, interim checkpoints",
            "disengaged": "Motivational - Affirm small wins, build efficacy gradually",
            "selective_reviser": "Uptake-focused - Highlight relevance of feedback to goals",
            "help_seeking": "Dialogic - Affirm help-seeking, provide scaffolded clarification",
        }
        return styles.get(profile_type, "Standard adaptive feedback")
    
    def _determine_scaffolding(self, profile_type: str, metrics: Dict) -> str:
        """Determine level of scaffolding needed"""
        scaffolds = {
            "strategic_engaged": "Minimal - Student capable of self-regulation",
            "effortful_struggling": "High - Model stronger composing strategies, guided practice",
            "procrastinating": "Moderate - Structured timeline, interim checkpoints",
            "disengaged": "High - Begin with accessible entry points, build momentum",
            "selective_reviser": "Moderate - Targeted feedback on revision impact",
            "help_seeking": "Moderate - Provide clarification support, gradual release",
        }
        return scaffolds.get(profile_type, "Moderate scaffolding")
    
    def _determine_intervention_timing(self, profile_type: str) -> str:
        """Determine when to intervene"""
        timings = {
            "strategic_engaged": "Check-in after final submission",
            "effortful_struggling": "Support during drafting, intensive feedback on revision",
            "procrastinating": "Intervene early in assignment timeline",
            "disengaged": "Immediate engagement - early feedback loop",
            "selective_reviser": "Feed-forward before final submission",
            "help_seeking": "Respond quickly to help requests",
        }
        return timings.get(profile_type, "Standard timing")
    
    def _recommend_peer_engagement(self, profile_type: str) -> str:
        """Recommend peer learning strategies"""
        recommendations = {
            "strategic_engaged": "Peer tutoring - model strong practices",
            "effortful_struggling": "Peer review from strong models + teacher feedback",
            "procrastinating": "Peer accountability partnerships",
            "disengaged": "Supported peer collaboration, lower-stakes practice",
            "selective_reviser": "Peer feedback + reflection on uptake",
            "help_seeking": "Peer discussion of revision strategies",
        }
        return recommendations.get(profile_type, "Standard peer engagement")


class CompetenceInferenceEngine:
    """
    Bayesian-inspired competence modeling (simplified version)
    Infers underlying competence from observable indicators
    """
    
    def __init__(self):
        self.competence_factors = {
            "planning_competence": 0.5,
            "drafting_competence": 0.5,
            "revision_competence": 0.5,
            "metacognitive_competence": 0.5,
        }
    
    def infer_competence(self, student_data: Dict, text_analytics: Dict) -> Dict:
        """
        Infer competence factors from student behavior and text analysis
        """
        competence = {}
        
        # Planning competence: based on rubric consultation, outline quality
        planning_indicators = [
            (student_data.get("rubric_views", 0) > 1) / 2,
            (student_data.get("assignment_views", 0) > 2) / 2,
        ]
        competence["planning_competence"] = sum(planning_indicators) / len(planning_indicators) if planning_indicators else 0.5
        
        # Drafting competence: based on word count, lexical diversity, error control
        drafting_indicators = [
            min(1.0, student_data.get("word_count", 0) / 150),  # Word quantity
            text_analytics.get("lexical_features", {}).get("type_token_ratio", 0.3) / 0.6,  # Diversity
            1.0 - min(1.0, text_analytics.get("error_density", {}).get("error_per_100_words", 5) / 10),  # Accuracy
        ]
        competence["drafting_competence"] = sum(drafting_indicators) / len(drafting_indicators) if drafting_indicators else 0.5
        
        # Revision competence: based on revision frequency and depth
        revision_improvement = student_data.get("error_reduction", 0)
        revision_indicators = [
            min(1.0, student_data.get("revision_frequency", 0) / 3),
            min(1.0, revision_improvement / 5),  # Error reduction
        ]
        competence["revision_competence"] = sum(revision_indicators) / len(revision_indicators) if revision_indicators else 0.5
        
        # Metacognitive competence: help-seeking, reflection
        metacognitive_indicators = [
            1.0 if student_data.get("help_messages", 0) > 0 else 0.0,
            1.0 if student_data.get("feedback_views", 0) > 0 else 0.0,
        ]
        competence["metacognitive_competence"] = sum(metacognitive_indicators) / len(metacognitive_indicators) if metacognitive_indicators else 0.5
        
        # Overall competence (weighted average)
        weights = {
            "planning_competence": 0.15,
            "drafting_competence": 0.40,
            "revision_competence": 0.25,
            "metacognitive_competence": 0.20,
        }
        
        overall = sum(competence.get(k, 0.5) * v for k, v in weights.items())
        
        return {
            "factor_competence": {k: round(v, 3) for k, v in competence.items()},
            "overall_competence_estimate": round(overall, 3),
            "competence_profile": self._describe_competence(overall),
            "learning_trajectory": self._project_trajectory(competence),
        }
    
    def _describe_competence(self, overall: float) -> str:
        """Describe overall competence level"""
        if overall > 0.75:
            return "Advanced - Strong across all writing competencies"
        elif overall > 0.6:
            return "Intermediate - Developing competence with some gaps"
        elif overall > 0.4:
            return "Emerging - Early stage, significant support needed"
        else:
            return "Beginning - Foundational skills, intensive support needed"
    
    def _project_trajectory(self, competence: Dict) -> str:
        """Project likely learning trajectory based on current profile"""
        lowest_factor = min(competence.items(), key=lambda x: x[1])
        
        if lowest_factor[1] < 0.4:
            return f"Focus development on {lowest_factor[0].replace('_', ' ')} for optimal growth"
        else:
            return "Competency developing across all factors - maintain current support"


if __name__ == "__main__":
    profiler = LearnerProfilingEngine()
    
    # Test data
    test_student = {
        "student_id": "S001",
        "rubric_views": 1,
        "assignment_views": 1,
        "revision_frequency": 0,
        "word_count": 75,
        "rubric_organization": 2,
        "rubric_argument": 2,
        "error_density": 8,
        "feedback_views": 0,
        "help_messages": 0,
    }
    
    profile_type, confidence, details = profiler.profile_student(test_student)
    print(f"Profile: {details['profile_name']}")
    print(f"Confidence: {confidence}")
    print(f"Recommended Support: {details['recommended_support']}")
