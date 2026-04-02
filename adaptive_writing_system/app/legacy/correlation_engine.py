"""
Correlation Analysis Engine
======================
Computes Spearman and Pearson correlations between process and product variables.
This module is the research-validation layer of the adaptive writing system.

It connects learning analytics evidence to research questions by computing associations
between self-regulated learning behaviours (process variables) and writing quality (product variables).

Theory:
--------
Spearman correlation is the primary method for educational data where:
- Variables are ordinal or count-based
- Data are not perfectly normal
- Sample size is small-to-moderate
- Relationship direction matters but causation is not assumed

Used in the pipeline as:
    raw data → data cleaning → correlation analysis → clustering/ML → AI outputs → rules → feedback

Output: correlation_results.csv for research reporting and feature importance assessment
"""

import pandas as pd
import numpy as np
from scipy.stats import spearmanr, pearsonr
import logging
from pathlib import Path
from typing import Dict, List, Tuple, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class CorrelationEngine:
    """
    Computes correlations between process and product indicators in writing development.
    
    Process variables (SRL indicators from Moodle):
    - Planning and forethought: rubric views, time-on-task, early output
    - Engagement: assignment views, resource access, submission frequency
    - Revision regulation: revision frequency, draft improvements
    - Feedback uptake: feedback views, revision alignment
    - Help-seeking: message count and type
    
    Product variables (Writing quality from analytics + rubric):
    - Total rubric score, argumentation, cohesion, lexical resource, grammar accuracy
    - Score gain, cohesion index, error density
    """
    
    def __init__(self, data: pd.DataFrame):
        """
        Initialize with a merged student dataset.
        
        Args:
            data (pd.DataFrame): One row per student; columns are all process and product indicators
        """
        self.data = data
        self.results = None
        logger.info(f"CorrelationEngine initialized with {len(data)} students, {len(data.columns)} indicators")
    
    # ========================
    # PROCESS VARIABLES
    # ========================
    
    PROCESS_VARIABLES = {
        # Forethought Phase (Planning and criteria awareness)
        "rubric_views": {"category": "forethought", "type": "count", "justification": "Criteria engagement"},
        "time_on_task": {"category": "forethought", "type": "continuous", "justification": "Planning durationy"},
        "first_access_delay_minutes": {"category": "forethought", "type": "continuous", "justification": "Procrastination indicator"},
        "word_count_at_first_save": {"category": "forethought", "type": "continuous", "justification": "Early productivity"},
        
        # Engagement & Participation
        "assignment_views": {"category": "engagement", "type": "count", "justification": "Task re-engagement"},
        "resource_access_count": {"category": "engagement", "type": "count", "justification": "Help-seeking through resources"},
        "submission_activity_frequency": {"category": "engagement", "type": "count", "justification": "Persistence"},
        "days_active_in_assignment": {"category": "engagement", "type": "continuous", "justification": "Temporal engagement"},
        
        # Performance Phase (Revision; SRL Monitoring)
        "revision_frequency": {"category": "revision", "type": "count", "justification": "Self-monitoring behaviour"},
        "score_gain": {"category": "revision", "type": "continuous", "justification": "Improvement outcome"},
        "draft_comparison_score": {"category": "revision", "type": "continuous", "justification": "Substantiveness of revision"},
        
        # Feedback Uptake & Literacy
        "feedback_views": {"category": "feedback_uptake", "type": "count", "justification": "Feedback engagement"},
        "revision_after_feedback": {"category": "feedback_uptake", "type": "binary", "justification": "Feedback use"},
        "feedback_alignment_score": {"category": "feedback_uptake", "type": "continuous", "justification": "Quality of feedback response"},
        
        # Help-seeking & Metacognition
        "help_seeking_message_count": {"category": "help_seeking", "type": "count", "justification": "Help-seeking frequency"},
        "adaptive_help_seeking_ratio": {"category": "help_seeking", "type": "continuous", "justification": "Help quality (content vs. procedural)"},
    }
    
    # ========================
    # PRODUCT VARIABLES
    # ========================
    
    PRODUCT_VARIABLES = {
        # Analytic Rubric Scores (1-5 scale)
        "argumentation_score": {"category": "argument", "rubric": True, "justification": "Claim-evidence-explanation"},
        "organization_score": {"category": "discourse", "rubric": True, "justification": "Paragraph/essay structure"},
        "cohesion_score": {"category": "discourse", "rubric": True, "justification": "Linking and transitions"},
        "grammar_accuracy_score": {"category": "language", "rubric": True, "justification": "Form accuracy"},
        "lexical_resource_score": {"category": "lexical", "rubric": True, "justification": "Vocabulary range"},
        
        # Total Score & Growth
        "total_rubric_score": {"category": "overall", "type": "continuous", "justification": "Composite quality"},
        "score_gain": {"category": "growth", "type": "continuous", "justification": "Improvement between drafts"},
        
        # Text Analytics (Objective measures)
        "error_density": {"category": "language", "type": "continuous", "justification": "Error frequency per 100 words"},
        "cohesion_index": {"category": "discourse", "type": "continuous", "justification": "Discourse transition density"},
        "type_token_ratio": {"category": "lexical", "type": "continuous", "justification": "Vocabulary variation"},
        "avg_sentence_length": {"category": "sentence", "type": "continuous", "justification": "Structural complexity"},
        "word_count": {"category": "volume", "type": "continuous", "justification": "Text length"},
        
        # Growth Metrics
        "cohesion_gain": {"category": "growth", "type": "continuous", "justification": "Discourse improvement"},
        "error_reduction": {"category": "growth", "type": "continuous", "justification": "Accuracy improvement"},
        "lexical_gain": {"category": "growth", "type": "continuous", "justification": "Vocabulary improvement"},
    }
    
    def run_correlations(
        self,
        process_vars: Optional[List[str]] = None,
        product_vars: Optional[List[str]] = None,
        method: str = "spearman",
        significance_threshold: float = 0.05
    ) -> pd.DataFrame:
        """
        Run correlation analysis between process and product variables.
        
        Args:
            process_vars (List[str], optional): Specific process variables to correlate.
                                               Defaults to all if None.
            product_vars (List[str], optional): Specific product variables to correlate.
                                               Defaults to all if None.
            method (str): 'spearman' or 'pearson'. Default: 'spearman' (recommended for educational data)
            significance_threshold (float): p-value cutoff for "significant" flag. Default: 0.05
        
        Returns:
            pd.DataFrame: Columns: process_variable, product_variable, correlation, p_value, 
                                   significant, effect_size, theoretical_connection
        """
        
        # Use defaults if not specified
        if process_vars is None:
            process_vars = list(self.PROCESS_VARIABLES.keys())
        if product_vars is None:
            product_vars = list(self.PRODUCT_VARIABLES.keys())
        
        # Filter to available columns
        process_vars = [v for v in process_vars if v in self.data.columns]
        product_vars = [v for v in product_vars if v in self.data.columns]
        
        logger.info(f"Running {method.upper()} correlations: {len(process_vars)} process × {len(product_vars)} product variables")
        
        results = []
        
        for p_var in process_vars:
            for prod_var in product_vars:
                # Get paired data, remove NaN
                subset = self.data[[p_var, prod_var]].dropna()
                
                if len(subset) <= 2:
                    logger.debug(f"Skipping {p_var} ↔ {prod_var}: insufficient data (n={len(subset)})")
                    continue
                
                # Compute correlation based on method
                if method.lower() == "spearman":
                    corr, p_val = spearmanr(subset[p_var], subset[prod_var])
                elif method.lower() == "pearson":
                    corr, p_val = pearsonr(subset[p_var], subset[prod_var])
                else:
                    raise ValueError(f"Unknown correlation method: {method}")
                
                # Interpret effect size
                abs_corr = abs(corr)
                if abs_corr < 0.10:
                    effect_size = "negligible"
                elif abs_corr < 0.30:
                    effect_size = "weak"
                elif abs_corr < 0.50:
                    effect_size = "moderate"
                else:
                    effect_size = "strong"
                
                # Theoretical connection (pedagogically meaningful pairs)
                theoretical_connection = self._get_theoretical_meaning(p_var, prod_var)
                
                results.append({
                    "process_variable": p_var,
                    "product_variable": prod_var,
                    "correlation": round(corr, 3),
                    "p_value": round(p_val, 4),
                    "significant": p_val < significance_threshold,
                    "effect_size": effect_size,
                    "n": len(subset),
                    "theoretical_connection": theoretical_connection,
                    "direction": "positive" if corr > 0 else "negative",
                })
        
        self.results = pd.DataFrame(results)
        logger.info(f"Computed {len(self.results)} correlations. {(self.results['significant']).sum()} significant (p<{significance_threshold})")
        
        return self.results
    
    def _get_theoretical_meaning(self, process_var: str, product_var: str) -> str:
        """
        Return pedagogical interpretation of a process–product relationship.
        
        This helps justify which correlations matter for the thesis.
        """
        
        # Key pedagogically meaningful pairs grounded in theory
        meaningful_pairs = {
            ("revision_frequency", "score_gain"): "Higher revision frequency should relate to writing improvement (SRL performance phase)",
            ("revision_frequency", "total_rubric_score"): "Revision is associated with overall writing quality",
            ("feedback_views", "score_gain"): "Viewing feedback is associated with improvement (feedback literacy uptake)",
            ("feedback_views", "revision_frequency"): "Feedback engagement correlates with revision activity",
            ("resource_access_count", "cohesion_score"): "Accessing discourse resources relates to discourse competence",
            ("resource_access_count", "lexical_resource_score"): "Vocabulary resource use relates to lexical development",
            ("rubric_views", "total_rubric_score"): "Criteria consultation should relate to meeting criteria (assessment literacy)",
            ("rubric_views", "argumentation_score"): "Consulting rubric on argument should relate to argument quality",
            ("time_on_task", "total_rubric_score"): "More planning time should relate to better outcomes",
            ("assignment_views", "revision_frequency"): "Re-engagement with task relates to revision activity",
            ("help_seeking_message_count", "lexical_resource_score"): "Help-seeking (especially language-focused) relates to vocabulary",
            ("help_seeking_message_count", "grammar_accuracy_score"): "Language-focused help-seeking relates to grammar improvement",
            ("score_gain", "learner_motivation"): "Improvement triggers motivation (positive feedback loop)",
        }
        
        key = (process_var, product_var)
        if key in meaningful_pairs:
            return meaningful_pairs[key]
        
        # Otherwise return category-level connection
        process_cat = self.PROCESS_VARIABLES.get(process_var, {}).get("category", "unknown")
        product_cat = self.PRODUCT_VARIABLES.get(product_var, {}).get("category", "unknown")
        return f"{process_cat.title()} behaviour ↔ {product_cat.title()} competence"
    
    def get_significant_only(self, p_threshold: float = 0.05) -> pd.DataFrame:
        """Return only statistically significant correlations."""
        if self.results is None:
            raise ValueError("Run correlations first")
        return self.results[self.results["p_value"] < p_threshold].sort_values("correlation", ascending=False)
    
    def get_by_effect_size(self, min_effect: str = "moderate") -> pd.DataFrame:
        """
        Return correlations above a minimum effect size.
        
        Args:
            min_effect (str): 'weak', 'moderate', or 'strong'
        
        Returns:
            pd.DataFrame: Filtered results
        """
        if self.results is None:
            raise ValueError("Run correlations first")
        
        effect_order = {"negligible": 0, "weak": 1, "moderate": 2, "strong": 3}
        min_level = effect_order.get(min_effect, 2)
        
        effect_levels = self.results["effect_size"].map(effect_order)
        return self.results[effect_levels >= min_level].sort_values("correlation", ascending=False)
    
    def save_results(self, output_path: str) -> None:
        """Save correlation results to CSV."""
        if self.results is None:
            raise ValueError("Run correlations first")
        
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        self.results.to_csv(output_path, index=False)
        logger.info(f"Correlation results saved to {output_path}")
    
    def report_summary(self) -> str:
        """Generate a text summary of correlation findings."""
        if self.results is None:
            return "No correlations computed yet."
        
        sig_results = self.results[self.results["significant"]]
        
        summary = f"""
CORRELATION ANALYSIS SUMMARY
==============================
Total correlations computed: {len(self.results)}
Statistically significant (p < .05): {len(sig_results)}

TOP POSITIVE CORRELATIONS:
{sig_results.nlargest(3, 'correlation')[['process_variable', 'product_variable', 'correlation', 'p_value']].to_string()}

TOP NEGATIVE CORRELATIONS:
{sig_results.nsmallest(3, 'correlation')[['process_variable', 'product_variable', 'correlation', 'p_value']].to_string()}

STRONGEST EFFECTS (p < .05):
{sig_results.nlargest(5, 'effect_size')[['process_variable', 'product_variable', 'effect_size', 'p_value']].to_string()}
        """
        return summary

    def academic_report(self) -> str:
        """Generate APA-formatted results for thesis reporting."""
        if self.results is None:
            return "No correlations computed yet."
        
        sig_results = self.results[self.results["significant"]]
        
        report = "ACADEMIC REPORTING FORMAT (APA)\n"
        report += "=" * 60 + "\n\n"
        
        for _, row in sig_results.iterrows():
            rho = row["correlation"]
            p = row["p_value"]
            direction = "positively" if rho > 0 else "negatively"
            
            report += f"A statistically significant {direction} correlation was found between "
            report += f"{row['process_variable']} and {row['product_variable']} "
            report += f"(Spearman's rho = {rho:.2f}, p = {p:.4f}, n = {row['n']}).\n"
            report += f"Interpretation: {row['theoretical_connection']}\n\n"
        
        return report

    def run_correlation_analysis(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Compute Spearman correlations between process and product variables.
        :param df: Cleaned dataset with process and product variables
        :return: DataFrame with correlation results
        """
        process_vars = [
            "assignment_views",
            "rubric_views",
            "resource_access_count",
            "time_on_task",
            "revision_frequency",
            "feedback_views",
            "help_seeking_messages"
        ]

        product_vars = [
            "total_score",
            "argumentation",
            "cohesion",
            "lexical_resource",
            "grammar_accuracy",
            "score_gain",
            "cohesion_index",
            "error_density",
            "word_count",
            "ttr"
        ]

        results = []

        for p_var in process_vars:
            for pr_var in product_vars:
                subset = df[[p_var, pr_var]].dropna()
                if len(subset) > 2:
                    corr, p_val = spearmanr(subset[p_var], subset[pr_var])
                    results.append({
                        "process_variable": p_var,
                        "product_variable": pr_var,
                        "spearman_rho": round(corr, 3),
                        "p_value": round(p_val, 4)
                    })

        return pd.DataFrame(results)


# ========================
# USAGE EXAMPLE
# ========================

if __name__ == "__main__":
    # Example usage (requires actual data)
    print("Correlation Engine - Example")
    print("=" * 60)
    print("""
    To use this engine:
    
    1. Prepare a merged dataset with process and product variables:
       df = pd.read_csv('student_dataset.csv')
    
    2. Initialize engine and run correlations:
       engine = CorrelationEngine(df)
       results = engine.run_correlations(method='spearman')
    
    3. Save and report:
       engine.save_results('outputs/correlation_results.csv')
       print(engine.academic_report())
    
    See CorrelationEngine class for documentation.
    """)
