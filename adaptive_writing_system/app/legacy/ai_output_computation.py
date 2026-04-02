"""
AI Output Computation Engine
=============================
Transforms raw data indicators and analytics results into AI learner-state outputs.

This module implements the system's core logic:
    raw indicators → thresholds → AI outputs → rule interpretations → feedback selection

AI outputs are the diagnostic states that represent:
- Self-regulated learning phases (forethought_risk, revision_depth, feedback_uptake_state, help_seeking_state)
- Writing competence dimensions (argumentation_state, discourse_state, linguistic_accuracy_state, lexical_state)
- Learner profiles (from clustering)
- Predictive states (from Random Forest)
- Probabilistic competence states (from Bayesian models)

These outputs are then interpreted through pedagogical rules to select feedback templates.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Union
from dataclasses import dataclass, asdict
import logging
from datetime import datetime
import yaml

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class AIOutput:
    """Represents one computed AI output state for a student."""
    student_id: str
    output_name: str
    state: str  # e.g. "low", "medium", "high", "adaptive", "none"
    confidence_score: float  # 0-1, how confident is the diagnosis
    evidence: List[str]  # List of indicators that drove this output
    reasoning: str  # Human-readable explanation
    timestamp: str = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now().isoformat()


class AIOutputComputer:
    """
    Computes AI learner-state outputs based on thresholds and indicators.
    
    Loads threshold configuration from YAML and applies threshold logic to raw data
    to produce AI outputs that represent learner states.
    """
    
    def __init__(self, thresholds_config: Optional[Dict] = None):
        """
        Initialize with threshold configuration.
        
        Args:
            thresholds_config (Dict, optional): Loaded YAML config with thresholds.
                                              If None, uses defaults.
        """
        self.thresholds = thresholds_config or self._load_default_thresholds()
        self.ai_outputs_by_student = {}
        logger.info("AIOutputComputer initialized")
    
    def _load_default_thresholds(self) -> Dict:
        """Load default thresholds (in practice, would load from YAML)."""
        # This would load from thresholds_expanded.yaml in production
        return {
            "raw_indicators": {
                "word_count": {"low_risk": 80, "developing_min": 80, "developing_max": 119, "satisfactory_min": 120},
                "time_on_task": {"low_risk_minutes": 15, "developing_min": 15, "developing_max": 29, "satisfactory_min": 30},
                "rubric_views": {"low_risk": 0, "developing": 1, "satisfactory": 2},
                "revision_frequency": {"low_risk": 0, "developing": 1, "satisfactory": 2},
                "error_density": {"high_risk": 8.1, "watch": 4.0, "satisfactory": 4.0},
                "cohesion_index": {"low_risk": 2, "developing": 3, "satisfactory": 4},
                "type_token_ratio": {"low_risk": 0.4, "developing_min": 0.4, "developing_max": 0.65, "satisfactory_min": 0.65},
            }
        }
    
    # ========================
    # FORETHOUGHT RISK
    # ========================
    
    def compute_forethought_risk(self, student_data: Dict) -> AIOutput:
        """
        Compute forethought_risk output.
        
        High risk: No rubric views AND short time AND low early output
        Low risk: Multiple rubric views AND adequate time
        
        Represents SRL forethought phase engagement and criteria awareness.
        """
        rubric_views = student_data.get("rubric_views", 0)
        time_on_task = student_data.get("time_on_task", 0)
        word_count = student_data.get("word_count", 0)
        
        evidence = []
        score = 0
        
        # Rubric views (0.4 weight)
        if rubric_views == 0:
            score += 0.4
            evidence.append(f"No rubric consultation (rubric_views={rubric_views})")
        elif rubric_views == 1:
            score += 0.15
            evidence.append(f"Minimal rubric engagement (rubric_views={rubric_views})")
        
        # Time on task (0.35 weight)
        if time_on_task < 15:
            score += 0.35
            evidence.append(f"Very short planning/drafting time ({time_on_task} min)")
        elif time_on_task < 30:
            score += 0.15
            evidence.append(f"Moderate planning time ({time_on_task} min)")
        
        # Early output volume (0.25 weight)
        if word_count < 80:
            score += 0.25
            evidence.append(f"Minimal early output ({word_count} words)")
        elif word_count < 120:
            score += 0.1
            evidence.append(f"Developing early output ({word_count} words)")
        
        # Determine state
        if score >= 0.6:
            state = "high"
            reasoning = "Weak planning signals: no rubric consultation, short time, minimal output"
        elif score >= 0.3:
            state = "medium"
            reasoning = "Some planning activity but incomplete or inconsistent"
        else:
            state = "low"
            reasoning = "Strong forethought: active rubric engagement and adequate planning time"
        
        confidence = min(1.0, 0.6 + (len(evidence) * 0.1))
        
        return AIOutput(
            student_id=student_data.get("student_id", "unknown"),
            output_name="forethought_risk",
            state=state,
            confidence_score=confidence,
            evidence=evidence,
            reasoning=reasoning
        )
    
    # ========================
    # ENGAGEMENT RISK
    # ========================
    
    def compute_engagement_risk(self, student_data: Dict) -> AIOutput:
        """
        Compute engagement_risk output.
        
        High risk: Minimal views across assignment, resources, feedback
        Low risk: Repeated engagement across all systems
        """
        assignment_views = student_data.get("assignment_views", 0)
        resource_access = student_data.get("resource_access_count", 0)
        feedback_views = student_data.get("feedback_views", 0)
        
        evidence = []
        risk_indicators = 0
        
        if assignment_views <= 1:
            risk_indicators += 1
            evidence.append(f"Very low assignment re-engagement ({assignment_views} view)")
        elif assignment_views <= 2:
            evidence.append(f"Low assignment re-engagement ({assignment_views} views)")
        
        if resource_access == 0:
            risk_indicators += 1
            evidence.append("No resource access (no help-seeking materials)")
        elif resource_access <= 1:
            evidence.append(f"Minimal resource use ({resource_access} access)")
        
        if feedback_views == 0:
            risk_indicators += 1
            evidence.append("No feedback engagement")
        elif feedback_views <= 1:
            evidence.append(f"Minimal feedback engagement ({feedback_views} view)")
        
        # Determine state based on risk indicators
        if risk_indicators >= 2:
            state = "high"
            reasoning = "Critical disengagement indicators: low participation across multiple systems"
        elif risk_indicators == 1 or (assignment_views + resource_access + feedback_views) <= 3:
            state = "medium"
            reasoning = "Variable engagement: some participation but inconsistent or uneven"
        else:
            state = "low"
            reasoning = "Consistent, sustained engagement across systems"
        
        confidence = min(1.0, 0.5 + (len(evidence) * 0.15))
        
        return AIOutput(
            student_id=student_data.get("student_id", "unknown"),
            output_name="engagement_risk",
            state=state,
            confidence_score=confidence,
            evidence=evidence,
            reasoning=reasoning
        )
    
    # ========================
    # REVISION DEPTH
    # ========================
    
    def compute_revision_depth(self, student_data: Dict) -> AIOutput:
        """
        Compute revision_depth output.
        
        High risk: Zero revisions (no self-monitoring)
        Medium: One revision with limited improvement
        Low: Multiple revisions or substantive improvement
        """
        revision_frequency = student_data.get("revision_frequency", 0)
        score_gain = student_data.get("score_gain", 0)
        draft_quality_diff = student_data.get("draft_comparison_score", 0)
        
        evidence = []
        
        if revision_frequency == 0:
            state = "high"
            reasoning = "No revision cycle; work submitted without self-monitoring or improvement attempts"
            evidence.append(f"Zero revisions (revision_frequency={revision_frequency})")
        elif revision_frequency == 1:
            # Check if revision was substantive
            if score_gain >= 2 or draft_quality_diff >= 0.6:
                state = "low"
                reasoning = "Single revision but with meaningful improvement; effective self-monitoring"
                evidence.append(f"One substantive revision with gain of {score_gain} points")
            else:
                state = "medium"
                reasoning = "Single revision with limited improvement; surface-level changes only"
                evidence.append(f"One revision but minimal gain ({score_gain} points)")
        else:  # revision_frequency >= 2
            state = "low"
            reasoning = "Multiple revisions indicate strong self-regulated performance phase monitoring"
            evidence.append(f"Multiple revisions ({revision_frequency}); evidence of iterative improvement")
        
        confidence = 0.85
        
        return AIOutput(
            student_id=student_data.get("student_id", "unknown"),
            output_name="revision_depth",
            state=state,
            confidence_score=confidence,
            evidence=evidence,
            reasoning=reasoning
        )
    
    # ========================
    # FEEDBACK UPTAKE STATE
    # ========================
    
    def compute_feedback_uptake_state(self, student_data: Dict) -> AIOutput:
        """
        Compute feedback_uptake_state output.
        
        Grounded in feedback literacy (Carless & Boud).
        Requires: access, understanding, and action on feedback.
        """
        feedback_views = student_data.get("feedback_views", 0)
        revision_after_feedback = student_data.get("revision_after_feedback", False)
        feedback_alignment_score = student_data.get("feedback_alignment_score", 0)
        
        evidence = []
        
        # High risk: no feedback access or access but no action
        if feedback_views == 0:
            state = "high"
            reasoning = "Feedback not accessed; no opportunity for uptake"
            evidence.append("Feedback viewed zero times")
        elif feedback_views >= 1 and not revision_after_feedback:
            state = "high"
            reasoning = "Feedback accessed but not acted upon; weak feedback literacy"
            evidence.append(f"Feedback viewed ({feedback_views}×) but no revision follow-up")
        # Medium: feedback accessed and some revision, but alignment unclear
        elif feedback_views >= 1 and revision_after_feedback and feedback_alignment_score < 0.6:
            state = "medium"
            reasoning = "Revision occurred but alignment with feedback is partial; needs guidance"
            evidence.append(f"Feedback viewed and revision occurred, but alignment score={feedback_alignment_score:.2f}")
        # Low: clear evidence of feedback uptake
        else:
            state = "low"
            reasoning = "Strong feedback literacy: accessed, understood, and applied to revision"
            evidence.append(f"Multiple feedback views ({feedback_views}), revision aligned (alignment={feedback_alignment_score:.2f})")
        
        confidence = 0.80
        
        return AIOutput(
            student_id=student_data.get("student_id", "unknown"),
            output_name="feedback_uptake_state",
            state=state,
            confidence_score=confidence,
            evidence=evidence,
            reasoning=reasoning
        )
    
    # ========================
    # HELP-SEEKING STATE
    # ========================
    
    def compute_help_seeking_state(self, student_data: Dict) -> AIOutput:
        """
        Compute help_seeking_state output.
        
        Categorizes help-seeking as: none, procedural, or adaptive (metacognitive).
        """
        help_messages = student_data.get("help_seeking_message_count", 0)
        help_type_distribution = student_data.get("help_message_types", {})  # {procedural: 0.6, adaptive: 0.4}
        total_rubric_score = student_data.get("total_rubric_score", 12)
        
        evidence = []
        
        if help_messages == 0:
            # Check if this is appropriate (if student is doing well) or concerning
            if total_rubric_score >= 15:
                state = "none"
                reasoning = "No help-seeking (appropriate for high-performing student)"
                evidence.append("No help-seeking messages (but strong performance)")
            else:
                state = "none"
                reasoning = "No help-seeking despite weak product; suggests hidden difficulty or passivity"
                evidence.append(f"No help-seeking despite low score ({total_rubric_score})")
        else:
            # Classify by help type
            procedural_ratio = help_type_distribution.get("procedural", 0.5)
            adaptive_ratio = help_type_distribution.get("adaptive", 0.5)
            
            if adaptive_ratio > procedural_ratio:
                state = "adaptive"
                reasoning = "Active metacognitive regulation; content-focused help-seeking (argument, language, understanding)"
                evidence.append(f"Help-seeking focused on content/strategy ({adaptive_ratio:.0%})")
            else:
                state = "procedural"
                reasoning = "Instrumental help-seeking; focused on task format and system use"
                evidence.append(f"Help-seeking mostly procedural ({procedural_ratio:.0%})")
        
        confidence = 0.75
        
        return AIOutput(
            student_id=student_data.get("student_id", "unknown"),
            output_name="help_seeking_state",
            state=state,
            confidence_score=confidence,
            evidence=evidence,
            reasoning=reasoning
        )
    
    # ========================
    # WRITING COMPETENCE OUTPUTS
    # ========================
    
    def compute_argumentation_state(self, student_data: Dict) -> AIOutput:
        """Compute argumentation_state from rubric score."""
        arg_score = student_data.get("argumentation_score", 2)
        evidence = [f"Rubric argumentation score: {arg_score}/5"]
        
        if arg_score <= 2:
            state = "high"
            reasoning = "Weak claim–evidence–reasoning structure; argument is missing or unsupported"
        elif arg_score == 3:
            state = "medium"
            reasoning = "Argument present with basic support; explanation could be deeper"
        else:
            state = "low"
            reasoning = "Strong argumentative competence with clear claim, evidence, and explanation"
        
        return AIOutput(
            student_id=student_data.get("student_id", "unknown"),
            output_name="argumentation_state",
            state=state,
            confidence_score=0.95,  # Rubric scores are reliable
            evidence=evidence,
            reasoning=reasoning
        )
    
    def compute_discourse_state(self, student_data: Dict) -> AIOutput:
        """Compute discourse_state from organization, cohesion, and analytics."""
        org_score = student_data.get("organization_score", 2)
        cohesion_index = student_data.get("cohesion_index", 2)
        evidence = [f"Organization score: {org_score}/5", f"Cohesion index: {cohesion_index}"]
        
        if org_score <= 2 and cohesion_index < 2:
            state = "high"
            reasoning = "Discourse organization problem: disjointed structure, abrupt transitions"
        elif org_score == 3 or cohesion_index < 3:
            state = "medium"
            reasoning = "Partial organization; transitions present but inconsistent"
        else:
            state = "low"
            reasoning = "Strong discourse competence: clear organization and smooth transitions"
        
        return AIOutput(
            student_id=student_data.get("student_id", "unknown"),
            output_name="discourse_state",
            state=state,
            confidence_score=0.90,
            evidence=evidence,
            reasoning=reasoning
        )
    
    def compute_linguistic_accuracy_state(self, student_data: Dict) -> AIOutput:
        """Compute linguistic_accuracy_state from grammar score and error density."""
        gram_score = student_data.get("grammar_accuracy_score", 2)
        error_density = student_data.get("error_density", 8)
        evidence = [f"Grammar score: {gram_score}/5", f"Error density: {error_density:.1f} per 100 words"]
        
        if gram_score <= 2 and error_density > 8:
            state = "high"
            reasoning = "Persistent linguistic accuracy problem: high error frequency with weak control"
        elif gram_score == 3 and error_density >= 4:
            state = "medium"
            reasoning = "Developing grammatical control; moderate, pattern-based errors"
        else:
            state = "low"
            reasoning = "Strong linguistic accuracy: low error frequency and controlled structures"
        
        return AIOutput(
            student_id=student_data.get("student_id", "unknown"),
            output_name="linguistic_accuracy_state",
            state=state,
            confidence_score=0.92,
            evidence=evidence,
            reasoning=reasoning
        )
    
    def compute_lexical_state(self, student_data: Dict) -> AIOutput:
        """Compute lexical_state from vocabulary score and TTR."""
        lex_score = student_data.get("lexical_resource_score", 2)
        ttr = student_data.get("type_token_ratio", 0.4)
        evidence = [f"Lexical score: {lex_score}/5", f"Type-token ratio: {ttr:.2f}"]
        
        if lex_score <= 2 and ttr < 0.5:
            state = "high"
            reasoning = "Restricted lexical repertoire: basic vocabulary with heavy repetition"
        elif lex_score == 3 and ttr < 0.65:
            state = "medium"
            reasoning = "Developing lexical precision: vocabulary variety present but not yet academic"
        else:
            state = "low"
            reasoning = "Strong lexical competence: academic vocabulary used precisely and variedly"
        
        return AIOutput(
            student_id=student_data.get("student_id", "unknown"),
            output_name="lexical_state",
            state=state,
            confidence_score=0.90,
            evidence=evidence,
            reasoning=reasoning
        )
    
    # ========================
    # COMPUTE ALL OUTPUTS
    # ========================
    
    def compute_all_outputs(self, student_data: Dict) -> List[AIOutput]:
        """
        Compute all AI outputs for a student.
        
        Args:
            student_data (Dict): All available indicators for one student.
                                Keys should match indicator names from thresholds/configs.
        
        Returns:
            List[AIOutput]: All computed AI outputs for this student.
        """
        student_id = student_data.get("student_id", "unknown")
        logger.info(f"Computing AI outputs for student {student_id}")
        
        outputs = [
            self.compute_forethought_risk(student_data),
            self.compute_engagement_risk(student_data),
            self.compute_revision_depth(student_data),
            self.compute_feedback_uptake_state(student_data),
            self.compute_help_seeking_state(student_data),
            self.compute_argumentation_state(student_data),
            self.compute_discourse_state(student_data),
            self.compute_linguistic_accuracy_state(student_data),
            self.compute_lexical_state(student_data),
        ]
        
        self.ai_outputs_by_student[student_id] = outputs
        return outputs
    
    def compute_for_cohort(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Compute AI outputs for all students in a cohort.
        
        Args:
            df (pd.DataFrame): One row per student; columns are all indicators.
        
        Returns:
            pd.DataFrame: One row per (student, ai_output) pair.
        """
        results = []
        
        for idx, row in df.iterrows():
            student_data = row.to_dict()
            outputs = self.compute_all_outputs(student_data)
            
            for output in outputs:
                results.append(asdict(output))
        
        return pd.DataFrame(results)
    
    def get_student_outputs(self, student_id: str) -> Dict[str, AIOutput]:
        """Return all AI outputs for one student as a dict keyed by output name."""
        outputs = self.ai_outputs_by_student.get(student_id, [])
        return {o.output_name: o for o in outputs}


# ========================
# USAGE EXAMPLE
# ========================

if __name__ == "__main__":
    print("AI Output Computer - Example")
    print("=" * 60)
    print("""
    To use this module:
    
    1. Prepare student data with required indicators:
       student_data = {
           'student_id': 'S001',
           'rubric_views': 1,
           'time_on_task': 25,
           'word_count': 95,
           'revision_frequency': 1,
           'score_gain': 3,
           'argumentation_score': 3,
           'organization_score': 2,
           'cohesion_index': 2.5,
           'grammar_accuracy_score': 3,
           'error_density': 6,
           'lexical_resource_score': 2,
           'type_token_ratio': 0.48,
           ... (all other indicators)
       }
    
    2. Initialize and compute:
       computer = AIOutputComputer()
       outputs = computer.compute_all_outputs(student_data)
    
    3. Access results:
       for output in outputs:
           print(f"{output.output_name}: {output.state}")
    
    For cohorts:
       df = pd.read_csv('cohort_data.csv')
       results = computer.compute_for_cohort(df)
       results.to_csv('outputs/ai_outputs.csv')
    """)
