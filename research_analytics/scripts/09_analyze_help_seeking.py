#!/usr/bin/env python3
"""
WriteLens Help-Seeking Analysis & Bayesian Competence Integration
Purpose: Process help-seeking behavior data and integrate into Bayesian competence inference
Framework: Newman & Schwager (1995) + Zimmerman (2000) SRL
Version: 1.0
"""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple
import json
import yaml

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent.parent
DATA_DIR = PROJECT_ROOT / "data"
OUTPUTS_DIR = PROJECT_ROOT / "outputs"
CONFIG_DIR = PROJECT_ROOT / "adaptive_writing_system" / "config"

def load_config(filename: str) -> Dict:
    """Load YAML configuration file"""
    with open(CONFIG_DIR / filename, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def classify_help_seeking(message: str, task_description: str = "") -> Dict:
    """
    Classify a help-seeking message into level, content, and timing.
    Returns dict with classification codes.
    
    Returns:
        {
            'level': 'HS_NONE' | 'HS_PRESENT' | 'HS_ADAPTIVE',
            'content': 'HC_PLAN' | 'HC_ARG' | 'HC_COH' | 'HC_GRAM' | ...,
            'keywords_found': [...]
        }
    """
    
    message_lower = message.lower()
    
    # Content classification keywords
    content_keywords = {
        'HC_PLAN': ['plan', 'outline', 'structure', 'organize', 'start', 'how do i begin'],
        'HC_ARG': ['argument', 'claim', 'evidence', 'prove', 'support', 'develop idea', 'strengthen point'],
        'HC_COH': ['transition', 'flow', 'connect', 'smooth', 'cohesion', 'link', 'sentence order'],
        'HC_GRAM': ['grammar', 'tense', 'correct', 'sentence', 'verb', 'error', 'spelling'],
        'HC_VOC': ['word', 'vocabulary', 'synonym', 'academic', 'better word', 'replace'],
        'HC_RUB': ['rubric', 'criteria', 'expectation', 'what means', 'what is'],
        'HC_EX': ['example', 'model', 'show me', 'like this', 'demonstration'],
        'HC_REV': ['revise', 'revision', 'change', 'improve draft', 'next draft'],
        'HC_FEEDBACK': ['feedback', 'you said', 'what you mean', 'explain']
    }
    
    # Classify content
    classified_content = None
    keywords_found = []
    
    for code, keywords in content_keywords.items():
        for keyword in keywords:
            if keyword in message_lower:
                classified_content = code
                keywords_found.append(keyword)
                break
        if classified_content:
            break
    
    if not classified_content:
        classified_content = 'HC_OTHER'
    
    # Classify level
    # Level indicators
    contains_question = '?' in message
    vague_indicators = ['better', 'how do i', 'help', 'how can i'] if contains_question else []
    specific_indicators = [
        'my sentence', 'my paragraph', 'my evidence', 'my argument',
        'this', 'sentence 1', 'sentence 2', 'line',
        'specific', 'example', 'exactly'
    ]
    
    attempted_first = any([
        'i tried', 'i added', 'i changed', 'revised', 'attempted', 'here\'s what i got',
        'is this better', 'after i',
        'first i'
    ] for phrase in message_lower.split())
    
    # Heuristic classification to Level
    vague_score = sum(1 for vague in vague_indicators if vague in message_lower)
    specific_score = sum(1 for spec in specific_indicators if spec in message_lower)
    
    if not contains_question:
        level = 'HS_NONE'
    elif specific_score > vague_score and (attempted_first or 'before i' in message_lower):
        level = 'HS_ADAPTIVE'
    elif vague_score > specific_score or (not attempted_first):
        level = 'HS_PRESENT'
    else:
        level = 'HS_ADAPTIVE' if specific_score >= 2 else 'HS_PRESENT'
    
    return {
        'level': level,
        'content': classified_content,
        'keywords_found': keywords_found,
        'is_question': contains_question,
        'attempted_first': attempted_first
    }

def compute_help_seeking_statistics(help_seeking_df: pd.DataFrame) -> Dict:
    """
    Compute aggregate statistics on help-seeking behavior
    
    Returns:
        {
            'total_messages': int,
            'level_distribution': {'HS_NONE': int, 'HS_PRESENT': int, 'HS_ADAPTIVE': int},
            'content_distribution': {...},
            'average_per_student': float,
            'adaptive_seekers_count': int,
            'top_content_topics': [(topic, count), ...]
        }
    """
    
    total = len(help_seeking_df)
    
    level_dist = help_seeking_df['help_seeking_level'].value_counts().to_dict()
    
    content_dist = help_seeking_df['help_content_code'].value_counts().to_dict()
    
    per_student = help_seeking_df.groupby('student_id').size().mean()
    
    adaptive_count = len(help_seeking_df[help_seeking_df['help_seeking_level'] == 'HS_ADAPTIVE']['student_id'].unique())
    
    # Top topics
    top_topics = content_dist.copy()
    top_topics = sorted(top_topics.items(), key=lambda x: x[1], reverse=True)[:5]
    
    return {
        'total_messages': total,
        'level_distribution': level_dist,
        'content_distribution': content_dist,
        'average_per_student': per_student,
        'adaptive_seekers_count': adaptive_count,
        'top_content_topics': top_topics
    }

def update_bayesian_priors_with_help_seeking(
    student_id: str,
    help_seeking_evidence: Dict,
    current_priors: Dict
) -> Dict:
    """
    Update Bayesian competence priors based on help-seeking evidence.
    
    Args:
        student_id: Student identifier
        help_seeking_evidence: {
            'total_hs_messages': int,
            'adaptive_hs_count': int,
            'present_hs_count': int,
            'none_hs_count': int
        }
        current_priors: Current Bayesian posteriors for the student
    
    Returns:
        Updated posteriors incorporating help-seeking evidence
    """
    
    # Likelihood: P(help-seeking_observation | Self-Regulated Revision Competence = High/Medium/Low)
    
    total_msg = help_seeking_evidence.get('total_hs_messages', 0)
    adaptive_count = help_seeking_evidence.get('adaptive_hs_count', 0)
    
    # Compute evidence weight (0 to 1)
    if total_msg == 0:
        # No help-seeking could mean independent or no monitoring
        self_reg_likelihood = {'Low': 0.4, 'Medium': 0.5, 'High': 0.3}
    else:
        # Proportion of help-seeking that is adaptive
        adaptive_proportion = adaptive_count / max(total_msg, 1)
        
        if adaptive_proportion >= 0.7:
            # High adaptive help-seeking -> strong SRL evidence
            self_reg_likelihood = {'Low': 0.1, 'Medium': 0.4, 'High': 0.85}
        elif adaptive_proportion >= 0.4:
            # Mixed help-seeking -> moderate SRL evidence
            self_reg_likelihood = {'Low': 0.3, 'Medium': 0.6, 'High': 0.6}
        else:
            # Mostly unstructured help-seeking -> emerging SRL
            self_reg_likelihood = {'Low': 0.5, 'Medium': 0.5, 'High': 0.3}
    
    # Update using Bayes' rule (simplified approximate)
    # P(SRL_High | help-seeking) ∝ P(help-seeking | SRL_High) * P(SRL_High)
    
    prior_srl_high = current_priors.get('self_regulated_revision', {}).get('High', 0.5)
    prior_srl_medium = current_priors.get('self_regulated_revision', {}).get('Medium', 0.3)
    prior_srl_low = current_priors.get('self_regulated_revision', {}).get('Low', 0.2)
    
    # Likelihood * Prior (unnormalized)
    likelihood_weight_high = self_reg_likelihood['High'] * prior_srl_high
    likelihood_weight_medium = self_reg_likelihood['Medium'] * prior_srl_medium
    likelihood_weight_low = self_reg_likelihood['Low'] * prior_srl_low
    
    # Normalize
    z = likelihood_weight_high + likelihood_weight_medium + likelihood_weight_low
    if z > 0:
        posterior_high = likelihood_weight_high / z
        posterior_medium = likelihood_weight_medium / z
        posterior_low = likelihood_weight_low / z
    else:
        posterior_high = prior_srl_high
        posterior_medium = prior_srl_medium
        posterior_low = prior_srl_low
    
    return {
        'self_regulated_revision_updated': {
            'High': round(posterior_high, 3),
            'Medium': round(posterior_medium, 3),
            'Low': round(posterior_low, 3)
        },
        'help_seeking_evidence_weight': adaptive_proportion if total_msg > 0 else 0,
        'explanation': f"Student had {total_msg} help-seeking messages, {adaptive_count} adaptive. Updated SRL_High posterior to {posterior_high:.2%}"
    }

def generate_help_seeking_report(
    student_help_seeking_df: pd.DataFrame,
    all_stats: Dict,
    output_file: Path
) -> None:
    """
    Generate comprehensive Help-Seeking Analysis report.
    """
    
    report = []
    report.append("=" * 80)
    report.append("WriteLens Help-Seeking Behavior Analysis Report")
    report.append("=" * 80)
    report.append("")
    
    # Summary statistics
    report.append("OVERALL STATISTICS")
    report.append("-" * 40)
    report.append(f"Total help-seeking messages: {all_stats['total_messages']}")
    report.append(f"Average per student: {all_stats['average_per_student']:.2f}")
    report.append(f"Students with adaptive help-seeking: {all_stats['adaptive_seekers_count']}")
    report.append("")
    
    # Level distribution
    report.append("HELP-SEEKING LEVEL DISTRIBUTION")
    report.append("-" * 40)
    for level, count in all_stats['level_distribution'].items():
        pct = 100 * count / all_stats['total_messages']
        report.append(f"{level:20s} : {count:4d} messages ({pct:5.1f}%)")
    report.append("")
    
    # Content distribution
    report.append("HELP-SEEKING CONTENT (What students ask about)")
    report.append("-" * 40)
    for content_code, count in sorted(
        all_stats['content_distribution'].items(),
        key=lambda x: x[1],
        reverse=True
    ):
        pct = 100 * count / all_stats['total_messages']
        report.append(f"{content_code:20s} : {count:4d} messages ({pct:5.1f}%)")
    report.append("")
    
    # Top topics
    report.append("TOP CONTENT TOPICS")
    report.append("-" * 40)
    for i, (topic, count) in enumerate(all_stats['top_content_topics'], 1):
        report.append(f"{i}. {topic:20s} : {count} messages")
    report.append("")
    
    # Pedagogical insights
    report.append("PEDAGOGICAL INSIGHTS & RECOMMENDATIONS")
    report.append("-" * 40)
    
    adaptive_pct = 100 * all_stats['level_distribution'].get('HS_ADAPTIVE', 0) / all_stats['total_messages']
    if adaptive_pct >= 60:
        report.append("✓ EXCELLENT: Most students are asking strategic, targeted questions.")
        report.append("  Recommendation: Deepen metacognitive training; introduce advanced challenges.")
    elif adaptive_pct >= 30:
        report.append("△ MODERATE: Mixed help-seeking quality.")
        report.append("  Recommendation: Coach students on asking specific, targeted questions.")
    else:
        report.append("! CONCERN: Most help-seeking is vague or absent.")
        report.append("  Recommendation: Normalize help-seeking; teach 'how to ask for help' explicitly.")
    report.append("")
    
    # Topic-specific insights
    top_topic = all_stats['top_content_topics'][0][0] if all_stats['top_content_topics'] else None
    if top_topic:
        report.append(f"Students most frequently asked about: {top_topic}")
        report.append("  Recommendation: Pre-teach this content area more thoroughly next time.")
    report.append("")
    
    # Write to file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(report))
    
    print(f"Help-seeking report saved to: {output_file}")

def main():
    """
    Main pipeline: Load help-seeking data, analyze, update Bayesian Model
    """
    
    print("=" * 80)
    print("WriteLens Help-Seeking Analysis Pipeline")
    print("=" * 80)
    
    # Load help-seeking log (simulated for now)
    # In production, this would load from database
    print("\n[1/4] Loading help-seeking data...")
    
    help_seeking_example_data = [
        {'student_id': 'student1', 'help_seeking_level': 'HS_ADAPTIVE', 'help_content_code': 'HC_ARG',
         'message': 'My argument in sentence 3 feels weak. How do I add stronger evidence?'},
        {'student_id': 'student1', 'help_seeking_level': 'HS_ADAPTIVE', 'help_content_code': 'HC_COH',
         'message': 'I revised my paragraph. Do the transitions flow better now?'},
        {'student_id': 'student2', 'help_seeking_level': 'HS_PRESENT', 'help_content_code': 'HC_GRAM',
         'message': 'Is this grammar right?'},
        {'student_id': 'student3', 'help_seeking_level': 'HS_NONE', 'help_content_code': 'HC_OTHER',
         'message': '[No help-seeking message]'},
        {'student_id': 'student4', 'help_seeking_level': 'HS_ADAPTIVE', 'help_content_code': 'HC_PLAN',
         'message': 'Before I start, can I ask about how to outline?'},
    ]
    
    help_seeking_df = pd.DataFrame(help_seeking_example_data)
    
    print(f"Loaded {len(help_seeking_df)} help-seeking records")
    
    # Compute statistics
    print("\n[2/4] Computing help-seeking statistics...")
    all_stats = compute_help_seeking_statistics(help_seeking_df)
    
    for key, value in all_stats.items():
        if not isinstance(value, list):
            print(f"  {key}: {value}")
    
    # Update Bayesian model with help-seeking evidence
    print("\n[3/4] Updating Bayesian priors with help-seeking evidence...")
    
    # Example: update for one student
    sample_student_hs = help_seeking_df[help_seeking_df['student_id'] == 'student1']
    student1_evidence = {
        'total_hs_messages': len(sample_student_hs),
        'adaptive_hs_count': len(sample_student_hs[sample_student_hs['help_seeking_level'] == 'HS_ADAPTIVE']),
        'present_hs_count': len(sample_student_hs[sample_student_hs['help_seeking_level'] == 'HS_PRESENT']),
        'none_hs_count': 0
    }
    
    current_priors = {
        'self_regulated_revision': {'High': 0.5, 'Medium': 0.3, 'Low': 0.2}
    }
    
    updated_posteriors = update_bayesian_priors_with_help_seeking(
        'student1', student1_evidence, current_priors
    )
    
    print(f"\n  Student 1:")
    print(f"    Help-seeking evidence: {student1_evidence}")
    print(f"    Updated SRL posteriors: {updated_posteriors['self_regulated_revision_updated']}")
    print(f"    Explanation: {updated_posteriors['explanation']}")
    
    # Generate report
    print("\n[4/4] Generating comprehensive help-seeking report...")
    
    report_file = OUTPUTS_DIR / "help_seeking_analysis_report.txt"
    report_file.parent.mkdir(parents=True, exist_ok=True)
    
    generate_help_seeking_report(help_seeking_df, all_stats, report_file)
    
    # Save processed data
    output_csv = OUTPUTS_DIR / "help_seeking_processed.csv"
    help_seeking_df.to_csv(output_csv, index=False)
    print(f"\nProcessed help-seeking data saved to: {output_csv}")
    
    print("\n" + "=" * 80)
    print("Help-Seeking Analysis Complete!")
    print("=" * 80)

if __name__ == '__main__':
    main()
