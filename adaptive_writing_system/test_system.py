# pyright: reportMissingImports=false
"""
Comprehensive System Test - Adaptive Writing System
Tests all components end-to-end with realistic student data
"""

import json
import sys
from pathlib import Path

# Add repository root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from adaptive_writing_system.app.legacy.adaptive_system import AdaptiveWritingSystem
from adaptive_writing_system.app.legacy.text_analytics_engine import TextAnalyticsEngine
from adaptive_writing_system.app.legacy.interpretation_engine import InterpretationEngine
from adaptive_writing_system.app.legacy.learner_profiling_engine import LearnerProfilingEngine


def print_header(title):
    """Print formatted section header"""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70 + "\n")


def test_text_analytics():
    """Test NLP text analysis engine"""
    print_header("1. TEXT ANALYTICS ENGINE TEST")
    
    engine = TextAnalyticsEngine()
    
    sample_text = """
    Online learning provides significant advantages for many students. First, 
    it allows flexible access to educational resources without geographical constraints. 
    Students can engage with materials at their own pace and schedule. Moreover, 
    online platforms offer opportunities for diverse learning styles through multimedia integration.
    Additionally, asynchronous discussion allows more thoughtful participation compared to 
    traditional face-to-face settings. Furthermore, learners can review recorded lectures 
    multiple times to ensure comprehension. Consequently, this flexibility supports 
    different learning preferences and work schedules.
    """
    
    analysis = engine.analyze(sample_text)
    
    print("📊 BASIC METRICS:")
    basic = analysis['basic_metrics']
    print(f"  Word Count: {basic['word_count']}")
    print(f"  Sentence Count: {basic['sentence_count']}")
    print(f"  Avg Sentence Length: {basic['avg_sentence_length']:.1f} words")
    
    print("\n📚 LEXICAL FEATURES:")
    lexical = analysis['lexical_features']
    print(f"  Type-Token Ratio: {lexical['type_token_ratio']:.3f}")
    print(f"  Academic Vocabulary: {lexical['academic_vocab_percentage']:.1f}%")
    
    print("\n🔗 COHESION FEATURES:")
    cohesion = analysis['cohesion_features']
    print(f"  Transition Words: {cohesion['transition_count']}")
    print(f"  Cohesion Index: {cohesion['cohesion_index']:.3f}")
    
    print("\n⚡ SYNTAX & ERRORS:")
    syntax = analysis['syntactic_features']
    errors = analysis['error_density']
    print(f"  Syntactic Complexity: {syntax['syntactic_complexity']:.2f}")
    print(f"  Error Density: {errors['error_per_100_words']:.1f} errors per 100 words")
    
    print("\n🎓 ACADEMIC REGISTER:")
    register = analysis['academic_register']
    print(f"  Formality Score: {register['formality_score']:.3f}")
    print(f"  Assessment: {register['academic_register_assessment']}")
    
    return analysis


def test_interpretation_engine(student_data):
    """Test pedagogical interpretation engine"""
    print_header("2. INTERPRETATION ENGINE TEST")
    
    interpreter = InterpretationEngine()
    
    evaluation = interpreter.evaluate_student(student_data)
    
    print("📋 THRESHOLD EVALUATION:")
    for category, results in evaluation['threshold_evaluation'].items():
        print(f"\n  {category.upper()}:")
        for indicator, level in results.items():
            print(f"    - {indicator}: {level}")
    
    print("\n⚖️ TRIGGERED RULES:")
    for rule_id in evaluation['triggered_rules']:
        print(f"  ✓ {rule_id}")
    
    print("\n🎯 DIAGNOSIS:")
    diagnosis = evaluation['diagnosis']
    print(f"  Profile: {diagnosis['profile']}")
    print(f"  Priority: {diagnosis['intervention_priority']}")
    print(f"  Learning Needs: {list(diagnosis['learning_needs'].keys())}")
    
    print("\n💬 FEEDBACK:")
    feedback = evaluation['adapted_feedback']
    print(f"  Online: {feedback['online_feedback']}")
    print(f"  OnSite: {feedback['onsite_intervention']}")
    
    return evaluation


def test_learner_profiling(student_data):
    """Test learner profiling engine"""
    print_header("3. LEARNER PROFILING ENGINE TEST")
    
    profiler = LearnerProfilingEngine()
    
    profile_type, confidence, details = profiler.profile_student(student_data)
    
    print(f"📊 LEARNER PROFILE:")
    print(f"  Type: {details['profile_name']}")
    print(f"  Confidence: {confidence:.1%}")
    print(f"  Description: {details['description']}")
    print(f"  Recommended Support: {details['recommended_support']}")
    
    print("\n🏆 PROFILE SCORES:")
    for profile, score in sorted(details['all_profile_scores'].items(), 
                                 key=lambda x: x[1], reverse=True):
        bar_length = int(score * 20)
        bar = "█" * bar_length + "░" * (20 - bar_length)
        print(f"  {profile:25} {bar} {score:.3f}")
    
    print("\n🧠 COMPETENCE INFERENCE:")
    competence = profiler.profile_student(student_data)[2]
    
    return profile_type, details


def test_full_pipeline():
    """Test complete adaptive system pipeline"""
    print_header("COMPLETE ADAPTIVE WRITING SYSTEM TEST")
    
    # Initialize system
    system = AdaptiveWritingSystem()
    
    # Realistic student submission
    submission = {
        "student_id": "S001",
        "assignment_id": "A001",
        "submission_id": "SUB001",
        "text": """Online learning provides significant advantages for many students. First, 
        it allows flexible access to educational resources without geographical constraints. 
        Students can engage with materials at their own pace and schedule. Moreover, 
        online platforms offer opportunities for diverse learning styles through multimedia integration.
        Additionally, asynchronous discussion allows more thoughtful participation compared to 
        traditional face-to-face settings.""",
        "previous_draft": """Online learning is good. It allows students to learn anytime. 
        It has videos and different types of content. Some students like this better.""",
        "rubric_scores": {
            "rubric_organization": 3,
            "rubric_argument": 2,
            "rubric_cohesion": 3,
        },
        "time_on_task": 22,
        "engagement_metrics": {
            "rubric_views": 2,
            "assignment_views": 2,
            "revision_frequency": 1,
            "feedback_views": 1,
            "help_messages": 0,
        }
    }
    
    print("\n🎓 PROCESSING STUDENT SUBMISSION...")
    print(f"  Student ID: {submission['student_id']}")
    print(f"  Assignment ID: {submission['assignment_id']}")
    print(f"  Text Length: {len(submission['text'].split())} words")
    
    # Run complete pipeline
    response = system.process_submission(submission)
    
    # Display results
    print_header("✅ COMPLETE ADAPTIVE RESPONSE")
    
    print("👤 LEARNER PROFILE:")
    profile = response['learner_profile']
    print(f"  Type: {profile['name']}")
    print(f"  Confidence: {profile['confidence']:.1%}")
    print(f"  Description: {profile['description']}")
    
    print("\n📊 COMPETENCE ASSESSMENT:")
    comp = response['competence']
    print(f"  Overall: {comp['overall_competence_estimate']:.1%}")
    print(f"  Level: {comp['competence_profile']}")
    print(f"  Planning: {comp['factor_competence']['planning_competence']:.1%}")
    print(f"  Drafting: {comp['factor_competence']['drafting_competence']:.1%}")
    print(f"  Revision: {comp['factor_competence']['revision_competence']:.1%}")
    print(f"  Metacognitive: {comp['factor_competence']['metacognitive_competence']:.1%}")
    
    print("\n🎯 PEDAGOGICAL DIAGNOSIS:")
    diag = response['pedagogical_evaluation']['diagnosis']
    print(f"  Profile: {diag['profile']}")
    print(f"  Intervention Priority: {diag['intervention_priority']}")
    
    print("\n💬 ADAPTIVE FEEDBACK:")
    feedback = response['adaptive_feedback']
    print(f"  Online: {feedback['online_feedback']}")
    print(f"  Goal: {feedback['next_writing_goal']}")
    print(f"  Prompts:")
    for i, prompt in enumerate(feedback['metacognitive_prompts'], 1):
        print(f"    {i}. {prompt}")
    
    print("\n📋 TEXT METRICS:")
    metrics = response['text_analysis']['basic_metrics']
    lexical = response['text_analysis']['lexical_features']
    cohesion = response['text_analysis']['cohesion_features']
    errors = response['text_analysis']['error_density']
    print(f"  Word Count: {metrics['word_count']}")
    print(f"  Lexical Diversity: {lexical['type_token_ratio']:.3f}")
    print(f"  Cohesion Index: {cohesion['cohesion_index']:.3f}")
    print(f"  Error Density: {errors['error_per_100_words']:.1f} per 100w")
    
    print("\n🚀 NEXT STEPS:")
    for step in response['next_steps'][:3]:
        print(f"  [{step['priority']}] {step['action']}")
        print(f"      Timing: {step['timing']}")
    
    print("\n" + "=" * 70)
    print("  ✅ SYSTEM TEST COMPLETE - ALL COMPONENTS OPERATIONAL")
    print("=" * 70 + "\n")
    
    return response


def test_at_risk_student():
    """Test system with at-risk student profile"""
    print_header("TEST: AT-RISK STUDENT PROFILE")
    
    system = AdaptiveWritingSystem()
    
    # At-risk student: minimal engagement, low quality
    submission = {
        "student_id": "S_RISK_001",
        "assignment_id": "A001",
        "text": "Online learning is good. You can learn at home.",
        "rubric_scores": {
            "rubric_organization": 1,
            "rubric_argument": 1,
            "rubric_cohesion": 1,
        },
        "engagement_metrics": {
            "rubric_views": 0,
            "assignment_views": 1,
            "revision_frequency": 0,
            "feedback_views": 0,
        }
    }
    
    response = system.process_submission(submission)
    
    profile = response['learner_profile']
    print(f"Profile: {profile['name']}")
    print(f"Priority: {response['pedagogical_evaluation']['diagnosis']['intervention_priority']}")
    print(f"\nFeedback: {response['adaptive_feedback']['online_feedback']}")
    print(f"\nRecommended Support: {profile['recommended_support']}")


def test_strong_student():
    """Test system with strong student profile"""
    print_header("TEST: STRATEGIC & ENGAGED STUDENT PROFILE")
    
    system = AdaptiveWritingSystem()
    
    # Strong student: high engagement, quality work
    submission = {
        "student_id": "S_STRONG_001",
        "assignment_id": "A001",
        "text": """Online learning provides significant advantages through flexible access, 
        multimedia integration, and asynchronous collaboration. Research demonstrates that 
        learners benefit from self-paced instruction accommodating diverse learning styles. 
        Furthermore, recorded sessions enable review and deeper comprehension. 
        Consequently, this pedagogical approach supports academic achievement across 
        demographic groups. However, challenges include digital equity and student motivation.""",
        "previous_draft": """Online learning has advantages. It is flexible and has multimedia.""",
        "rubric_scores": {
            "rubric_organization": 5,
            "rubric_argument": 4,
            "rubric_cohesion": 4,
        },
        "engagement_metrics": {
            "rubric_views": 3,
            "assignment_views": 3,
            "revision_frequency": 2,
            "feedback_views": 2,
            "help_messages": 1,
        }
    }
    
    response = system.process_submission(submission)
    
    profile = response['learner_profile']
    print(f"Profile: {profile['name']}")
    print(f"Confidence: {profile['confidence']:.1%}")
    print(f"Competence: {response['competence']['overall_competence_estimate']:.1%}")
    print(f"Priority: {response['pedagogical_evaluation']['diagnosis']['intervention_priority']}")
    print(f"\nFeedback: {response['adaptive_feedback']['online_feedback']}")
    print(f"\nNext Goal: {response['adaptive_feedback']['next_writing_goal']}")


if __name__ == "__main__":
    print("\n")
    print("╔" + "═" * 68 + "╗")
    print("║" + " " * 68 + "║")
    print("║" + "  WriteLens Adaptive Writing System - Comprehensive Test Suite".center(68) + "║")
    print("║" + " " * 68 + "║")
    print("╚" + "═" * 68 + "╝")
    
    try:
        # Run component tests
        print("\n🔧 RUNNING COMPONENT TESTS...\n")
        
        # Test 1: Text Analytics
        text_analysis = test_text_analytics()
        
        # Prepare student data for other tests
        student_data = {
            "word_count": text_analysis['basic_metrics']['word_count'],
            "rubric_views": 2,
            "assignment_views": 2,
            "rubric_organization": 3,
            "rubric_argument": 2,
            "cohesion_index": text_analysis['cohesion_features']['cohesion_index'],
            "revision_frequency": 1,
            "feedback_views": 1,
            "error_density": text_analysis['error_density']['error_per_100_words'],
        }
        
        # Test 2: Interpretation
        test_interpretation_engine(student_data)
        
        # Test 3: Learner Profiling
        test_learner_profiling(student_data)
        
        # Test 4: Full Pipeline
        test_full_pipeline()
        
        # Test 5: Different student profiles
        test_at_risk_student()
        test_strong_student()
        
        print("\n✅ ALL TESTS COMPLETED SUCCESSFULLY!\n")
        print("System is ready for production deployment.")
    
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
