"""
Threshold Configuration System
Defines pedagogical decision cut-points for writing analysis
Thresholds are task-sensitive and pilot-calibrated, not universal
"""

from typing import Dict, List
from dataclasses import dataclass
from enum import Enum

class PerformanceLevel(Enum):
    """Writing performance levels"""
    LOW = "low"
    DEVELOPING = "developing"
    PROFICIENT = "proficient"
    ADVANCED = "advanced"

@dataclass
class Threshold:
    """Single threshold definition with pedagogical interpretation"""
    indicator: str
    low_bound: float
    medium_bound: float
    high_bound: float
    interpretation_low: str
    interpretation_medium: str
    interpretation_high: str
    task_context: str
    theoretical_basis: str

class ThresholdConfiguration:
    """Complete threshold system for body paragraph argumentative writing"""
    
    def __init__(self):
        """Initialize thresholds calibrated for body paragraph essay tasks"""
        self.task_type = "argumentative_essay_body_paragraph"
        self.word_count_expectation = "200-350 words"
        
        # Process engagement thresholds
        self.assignment_views = Threshold(
            indicator="assignment_views",
            low_bound=0,
            medium_bound=2,
            high_bound=4,
            interpretation_low="Minimal task engagement; possible procrastination",
            interpretation_medium="Adequate task awareness; moderate planning",
            interpretation_high="High criteria awareness; evidence of metacognition",
            task_context="Body paragraph typically requires 1-2 planning sessions",
            theoretical_basis="Zimmerman (2000) - forethought phase engagement"
        )
        
        self.rubric_views = Threshold(
            indicator="rubric_views",
            low_bound=0,
            medium_bound=1,
            high_bound=3,
            interpretation_low="No visible rubric consultation => low assessment literacy",
            interpretation_medium="Limited rubric use => partial criteria understanding",
            interpretation_high="Frequent consultation => strong assessment literacy",
            task_context="For body paragraph: expect 2-4 rubric views before/during writing",
            theoretical_basis="Paris & Paris (2001) - assessment literacy in SRL"
        )
        
        self.time_on_task = Threshold(
            indicator="time_on_task_minutes",
            low_bound=0,
            medium_bound=15,
            high_bound=40,
            interpretation_low="< 15 min: insufficient development time, rushing",
            interpretation_medium="15-40 min: reasonable engagement for task",
            interpretation_high="> 40 min: extended engagement (may indicate struggle)",
            task_context="Body paragraph: expect 20-30 minutes for quality work",
            theoretical_basis="Flower & Hayes (1981) - writing process time allocation"
        )
        
        self.revision_frequency = Threshold(
            indicator="revision_frequency",
            low_bound=0,
            medium_bound=1,
            high_bound=3,
            interpretation_low="No revisions: product-oriented approach, weak monitoring",
            interpretation_medium="1 revision: some self-regulation, basic monitoring",
            interpretation_high="2+ revisions: strong revision behavior, performance monitoring",
            task_context="For body paragraph: expect 1-2 major revisions",
            theoretical_basis="Bereiter & Scardamalia (1987) - revision as cognitive control"
        )
        
        self.feedback_views = Threshold(
            indicator="feedback_views",
            low_bound=0,
            medium_bound=1,
            high_bound=2,
            interpretation_low="No feedback review: weak feedback uptake",
            interpretation_medium="Single view: basic feedback engagement",
            interpretation_high="Multiple views: deep feedback processing",
            task_context="Expect view + revision cycle after feedback",
            theoretical_basis="Carless & Boud (2018) - feedback uptake and action"
        )
        
        # Writing product thresholds (rubric-based, 1-5 scale)
        self.rubric_organization = Threshold(
            indicator="rubric_organization_score",
            low_bound=1,
            medium_bound=3,
            high_bound=4,
            interpretation_low="Score 1-2: weak organization, unclear paragraph structure",
            interpretation_medium="Score 3: moderate organization, some clarity issues",
            interpretation_high="Score 4-5: clear organization, strong paragraph structure",
            task_context="Body paragraph rubric: clear topic, support, conclusion",
            theoretical_basis="Weigle (2002) - analytic writing assessment"
        )
        
        self.rubric_argumentation = Threshold(
            indicator="rubric_argumentation_score",
            low_bound=1,
            medium_bound=3,
            high_bound=4,
            interpretation_low="Score 1-2: weak argument development, limited supporting detail",
            interpretation_medium="Score 3: adequate argument, some development",
            interpretation_high="Score 4-5: strong argument, well-developed support",
            task_context="Argument = clear claim + specific evidence + reasoning",
            theoretical_basis="Hyland (2019) - discourse-oriented writing pedagogy"
        )
        
        self.rubric_cohesion = Threshold(
            indicator="rubric_cohesion_score",
            low_bound=1,
            medium_bound=3,
            high_bound=4,
            interpretation_low="Score 1-2: weak connection between ideas, choppy",
            interpretation_medium="Score 3: adequate cohesion, mostly clear relationships",
            interpretation_high="Score 4-5: strong cohesion, smooth flow",
            task_context="Cohesion: transitions, pronoun reference, logical sequencing",
            theoretical_basis="Halliday & Hasan (1976) - cohesion in English"
        )
        
        self.rubric_grammar = Threshold(
            indicator="rubric_grammar_score",
            low_bound=1,
            medium_bound=3,
            high_bound=4,
            interpretation_low="Score 1-2: frequent grammatical errors affecting clarity",
            interpretation_medium="Score 3: minor errors, mostly understandable",
            interpretation_high="Score 4-5: minimal errors, strong control",
            task_context="Grammar affects academic credibility and clarity",
            theoretical_basis="Weigle (2002) - grammatical accuracy in writing"
        )
        
        # Text analytics thresholds
        self.word_count = Threshold(
            indicator="word_count",
            low_bound=80,
            medium_bound=150,
            high_bound=350,
            interpretation_low="< 80 words: underdeveloped, insufficient content",
            interpretation_medium="80-150: minimal development, thin support",
            interpretation_high="> 150: adequate development for body paragraph",
            task_context="Body paragraph target: 200-350 words",
            theoretical_basis="Task design expectations for argumentative paragraphs"
        )
        
        self.lexical_diversity = Threshold(
            indicator="ttl_type_token_ratio",
            low_bound=0.4,
            medium_bound=0.55,
            high_bound=0.7,
            interpretation_low="< 0.40: high repetition, limited vocabulary range",
            interpretation_medium="0.40-0.55: moderate diversity, some repetition",
            interpretation_high="> 0.55: strong lexical diversity, varied word choice",
            task_context="Academic writing: expect TTR > 0.50",
            theoretical_basis="Crossley & McNamara (2009) - computational discourse analysis"
        )
        
        self.academic_vocabulary = Threshold(
            indicator="academic_vocab_ratio",
            low_bound=0.02,
            medium_bound=0.05,
            high_bound=0.12,
            interpretation_low="< 2%: minimal academic register",
            interpretation_medium="2-5%: adequate academic language",
            interpretation_high="> 5%: strong academic vocabulary use",
            task_context="Argumentative writing: expect 4-8% academic vocab",
            theoretical_basis="Hyland (2005) - academic writing register"
        )
        
        self.cohesion_index = Threshold(
            indicator="cohesion_index_score",
            low_bound=1.0,
            medium_bound=2.5,
            high_bound=4.0,
            interpretation_low="< 1.0: weak text cohesion, unclear relationships",
            interpretation_medium="1.0-2.5: moderate cohesion, some gaps",
            interpretation_high="> 2.5: strong cohesion, clear connections",
            task_context="Measured through transitions, pronouns, reference chains",
            theoretical_basis="Halliday & Hasan (1976)"
        )
        
        self.error_density = Threshold(
            indicator="error_density",
            low_bound=5.0,
            medium_bound=2.0,
            high_bound=0.5,
            interpretation_low="> 5 errors/100: significant error burden",
            interpretation_medium="2-5 errors/100: manageable error level",
            interpretation_high="< 2 errors/100: strong control",
            task_context="Academic writing: expect < 2 errors per 100 words",
            theoretical_basis="Weigle (2002) - error analysis in composition"
        )
        
        self.syntactic_complexity = Threshold(
            indicator="syntactic_complexity_score",
            low_bound=1.0,
            medium_bound=2.5,
            high_bound=4.5,
            interpretation_low="< 1.0: simple sentences, no embedded clauses",
            interpretation_medium="1.0-2.5: some clause complexity, developing control",
            interpretation_high="> 2.5: sophisticated syntax, multiple embedded clauses",
            task_context="Academic writing expects varied sentence structures",
            theoretical_basis="Ortega (2003) - syntactic complexity measures"
        )
    
    def classify_indicator(self, indicator_name: str, value: float) -> PerformanceLevel:
        """Classify an indicator value into performance level"""
        threshold = getattr(self, indicator_name)
        
        if value <= threshold.low_bound:
            return PerformanceLevel.LOW
        elif value <= threshold.medium_bound:
            return PerformanceLevel.DEVELOPING
        elif value <= threshold.high_bound:
            return PerformanceLevel.PROFICIENT
        else:
            return PerformanceLevel.ADVANCED
    
    def get_interpretation(self, indicator_name: str, value: float) -> str:
        """Get pedagogical interpretation for an indicator value"""
        level = self.classify_indicator(indicator_name, value)
        threshold = getattr(self, indicator_name)
        
        if level == PerformanceLevel.LOW:
            return threshold.interpretation_low
        elif level == PerformanceLevel.DEVELOPING:
            return threshold.interpretation_medium
        else:
            return threshold.interpretation_high
    
    def get_all_thresholds(self) -> Dict:
        """Export all thresholds for configuration"""
        thresholds = {}
        for attr_name in dir(self):
            attr = getattr(self, attr_name)
            if isinstance(attr, Threshold):
                thresholds[attr_name] = {
                    'indicator': attr.indicator,
                    'bounds': {
                        'low': attr.low_bound,
                        'medium': attr.medium_bound,
                        'high': attr.high_bound
                    },
                    'interpretations': {
                        'low': attr.interpretation_low,
                        'medium': attr.interpretation_medium,
                        'high': attr.interpretation_high
                    },
                    'task_context': attr.task_context,
                    'theoretical_basis': attr.theoretical_basis
                }
        return thresholds


def create_threshold_config() -> ThresholdConfiguration:
    """Factory function for threshold configuration"""
    return ThresholdConfiguration()
