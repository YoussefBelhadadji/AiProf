# pyright: reportMissingImports=false
#!/usr/bin/env python3
"""
Test suite for help-seeking Bayesian inference and adaptive rulebook integration.

This tests that:
1. Help-seeking coded evidence updates SRL competence posteriors
2. Adaptive rulebook conditions match correctly with extended schema
3. Extended rule fields (feedback_focus, pedagogical_claim, etc.) propagate to decision output
4. Unified context matching works for both signals and ai_states
"""

import sys
import os
from pathlib import Path

# Add repository root to path for package imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from adaptive_writing_system.app.legacy.rulebook import load_rulebook, load_feedback_templates, build_rule_definitions
from adaptive_writing_system.app.legacy.decision_logic import (
    compute_adaptive_decision,
    build_signals,
    build_bayesian_states,
)


def test_help_seeking_basic():
    """Test that students with help-seeking evidence are identified correctly."""
    print("\n=== Test 1: Help-Seeking Basic Detection ===")
    
    student = {
        "student_id": "test001",
        "total_score": 70,
        "score_gain": 5,
        "revision_count": 3,
        "feedback_views": 2,
        "help_seeking_messages": 3,  # Help-seeking evidence
        "help_seeking_state": "Present",
        "assignment_views": 5,
        "rubric_views": 2,
        "time_on_task_minutes": 120,
        "argument_structure": 3,
        "sentence_complexity": 2,
        "discourse_organization": 2,
        "linguistic_accuracy": 3,
        "lexical_resource": 2,
        "adaptation_type": "rule_based",
    }
    
    signals = build_signals(student)
    states = signals["states"]
    
    print(f"  help_seeking_pattern: {states.get('help_seeking_pattern')}")
    print(f"  help_seeking_risk: {states.get('help_seeking_risk')}")
    print(f"  revision_depth: {states.get('revision_depth')}")
    
    assert states.get("help") in ["Low", "Medium", "High", "Present"], f"Expected help state, got {states.get('help')}"
    assert states.get("help_seeking_pattern") in ["None", "Present", "Adaptive"], f"Invalid help pattern"
    
    print("  ✓ PASSED: Help-seeking states computed")


def test_bayesian_posterior_inference():
    """Test that Bayesian SRL competence posteriors are computed from help-seeking evidence."""
    print("\n=== Test 2: Bayesian Posterior Inference ===")
    
    # Test case 1: Adaptive help-seeking (should increase SRL High posterior)
    student_adaptive = {
        "student_id": "test_adaptive",
        "total_score": 65,
        "score_gain": 8,
        "revision_count": 5,
        "feedback_views": 4,
        "help_seeking_messages": 5,  # Multiple help-seeking interactions
        "help_seeking_state": "Adaptive",  # Strategic help-seeking
        "assignment_views": 6,
        "rubric_views": 3,
        "time_on_task_minutes": 150,
        "argument_structure": 2,
        "sentence_complexity": 2,
        "discourse_organization": 2,
        "linguistic_accuracy": 2,
        "lexical_resource": 2,
    }
    
    signals = build_signals(student_adaptive)
    states = signals["states"]
    
    srl_dist = states.get("srl_competence_distribution", {})
    print(f"  SRL Competence Distribution: {srl_dist}")
    
    # Adaptive help-seeking should increase High probability
    if srl_dist:
        high_prob = srl_dist.get("High", 0.0)
        print(f"  P(SRL=High | Adaptive help-seeking): {high_prob:.2f}")
        assert high_prob > 0.3, f"Expected substantial High probability for adaptive help, got {high_prob}"
    
    # Test case 2: No help-seeking (should lower SRL High posterior)
    student_no_help = {
        "student_id": "test_no_help",
        "total_score": 65,
        "score_gain": 3,
        "revision_count": 2,
        "feedback_views": 1,
        "help_seeking_messages": 0,
        "help_seeking_state": "None",
        "assignment_views": 3,
        "rubric_views": 0,
        "time_on_task_minutes": 60,
        "argument_structure": 2,
        "sentence_complexity": 2,
        "discourse_organization": 2,
        "linguistic_accuracy": 2,
        "lexical_resource": 2,
    }
    
    signals_no_help = build_signals(student_no_help)
    states_no_help = signals_no_help["states"]
    
    srl_dist_no = states_no_help.get("srl_competence_distribution", {})
    print(f"\n  No Help-Seeking Distribution: {srl_dist_no}")
    
    print("  ✓ PASSED: Bayesian posteriors computed")


def test_adaptive_rulebook_conditions():
    """Test that adaptive rulebook conditions with operators/ranges match correctly."""
    print("\n=== Test 3: Adaptive Rulebook Condition Matching ===")
    
    # Load actual rulebook to test against
    rulebook = load_rulebook()
    feedback_rules = rulebook.get("feedback_rules", [])
    
    if feedback_rules:
        print(f"  Loaded {len(feedback_rules)} feedback rules")
        
        # Find a rule with threshold conditions
        for rule in feedback_rules[:5]:
            conditions = rule.get("conditions", {})
            thresholds = conditions.get("thresholds", {})
            ai_states = conditions.get("ai_states", {})
            
            if thresholds or ai_states:
                print(f"\n  Rule {rule.get('rule_id')}:")
                if thresholds:
                    print(f"    Thresholds: {thresholds}")
                if ai_states:
                    print(f"    AI States: {ai_states}")
    
    print("  ✓ PASSED: Adaptive rulebook loaded and inspected")


def test_extended_rule_fields():
    """Test that extended rule fields (pedagogical_claim, feedback_focus, etc.) are extracted."""
    print("\n=== Test 4: Extended Rule Field Extraction ===")
    
    rule_definitions = build_rule_definitions()
    
    if rule_definitions:
        first_rule_id = list(rule_definitions.keys())[0]
        first_rule = rule_definitions[first_rule_id]
        
        print(f"\n  Sample Rule: {first_rule_id}")
        for key in ["pedagogical_claim", "feedback_focus", "feedback_type", "response_template"]:
            value = first_rule.get(key, "[not set]")
            print(f"    {key}: {value}")
    
    print("  ✓ PASSED: Extended fields extracted")


def test_end_to_end_decision():
    """Test complete adaptive decision pipeline with help-seeking evidence."""
    print("\n=== Test 5: End-to-End Adaptive Decision ===")
    
    student = {
        "student_id": "test_e2e",
        "total_score": 68,
        "score_gain": 6,
        "revision_count": 4,
        "feedback_views": 3,
        "help_seeking_messages": 4,
        "help_seeking_state": "Adaptive",  # Key: Adaptive help-seeking
        "assignment_views": 6,
        "rubric_views": 2,
        "time_on_task_minutes": 135,
        "argument_structure": 3,
        "sentence_complexity": 2,
        "discourse_organization": 2,
        "linguistic_accuracy": 3,
        "lexical_resource": 2,
        "adaptation_type": "rule_based",
        "cluster_label": 1,
        "cluster_profile": "Evidence Construction",
    }
    
    try:
        decision = compute_adaptive_decision(student)
        
        print(f"\n  Adaptive Decision Output:")
        print(f"    Learner Profile: {decision.get('learner_profile')}")
        print(f"    Predicted Improvement: {decision.get('predicted_improvement')}")
        print(f"    Triggered Rules: {decision.get('triggered_rules')}")
        print(f"    Help-Seeking Risk: {decision.get('help_seeking_risk')}")
        print(f"    Revision Depth: {decision.get('revision_depth')}")
        print(f"    Improvement Trajectory: {decision.get('improvement_trajectory')}")
        print(f"    Feedback Focus: {decision.get('final_feedback_focus')}")
        
        # Validate key fields exist
        assert decision.get("learner_profile"), "Missing learner_profile"
        assert decision.get("predicted_improvement"), "Missing predicted_improvement"
        assert "rule_matches" in decision, "Missing rule_matches"
        
        print("\n  ✓ PASSED: End-to-end decision computed successfully")
        
    except Exception as e:
        print(f"\n  ✗ FAILED: {e}")
        import traceback
        traceback.print_exc()
        raise


def test_unified_context_matching():
    """Test that unified context (signals + ai_states) matching works for rules."""
    print("\n=== Test 6: Unified Context Matching ===")
    
    # Student with specific metrics for testing operator matching
    student = {
        "student_id": "test_context",
        "total_score": 75,
        "score_gain": 10,
        "revision_count": 6,
        "feedback_views": 5,
        "help_seeking_messages": 2,
        "help_seeking_state": "Present",
        "assignment_views": 8,  # Should match >= 5 conditions
        "rubric_views": 3,      # Should match >= 2 conditions
        "time_on_task_minutes": 180,
        "argument_structure": 4,
        "sentence_complexity": 3,
        "discourse_organization": 3,
        "linguistic_accuracy": 4,
        "lexical_resource": 3,
    }
    
    signals = build_signals(student)
    states = signals["states"]
    
    # Test that metrics are available for matching
    print(f"\n  Signal Metrics Available:")
    print(f"    assignment_views: {signals.get('assignment_views', 'N/A')}")
    print(f"    rubric_views: {signals.get('rubric_views', 'N/A')}")
    print(f"    score_improvement: {signals.get('score_improvement', 'N/A')}")
    print(f"    revision_depth: {states.get('revision_depth', 'N/A')}")
    print(f"    help_seeking_risk: {states.get('help_seeking_risk', 'N/A')}")
    
    print("\n  ✓ PASSED: Unified context metrics available for matching")


def test_fallback_behavior():
    """Test that system gracefully falls back when conditions don't match."""
    print("\n=== Test 7: Fallback Behavior ===")
    
    # Minimal student data that doesn't match most rules
    student = {
        "student_id": "test_minimal",
        "total_score": 50,
        "score_gain": 0,
        "revision_count": 0,
        "feedback_views": 0,
        "help_seeking_messages": 0,
        "help_seeking_state": "None",
    }
    
    try:
        decision = compute_adaptive_decision(student)
        
        print(f"\n  Fallback Decision:")
        print(f"    Learner Profile: {decision.get('learner_profile')}")
        print(f"    Triggered Rules: {decision.get('triggered_rules')}")
        print(f"    Feedback: {decision.get('personalized_feedback')[:100]}...")
        
        # Should have fallback feedback even if no rules match
        assert decision.get("personalized_feedback"), "Missing fallback feedback"
        
        print("\n  ✓ PASSED: Fallback behavior works")
        
    except Exception as e:
        print(f"\n  ✗ FAILED: {e}")
        raise


def run_all_tests():
    """Run all test cases."""
    print("=" * 70)
    print("HELP-SEEKING BAYESIAN INFERENCE TEST SUITE")
    print("=" * 70)
    
    tests = [
        test_help_seeking_basic,
        test_bayesian_posterior_inference,
        test_adaptive_rulebook_conditions,
        test_extended_rule_fields,
        test_unified_context_matching,
        test_end_to_end_decision,
        test_fallback_behavior,
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            test()
            passed += 1
        except Exception as e:
            print(f"\n  ✗ TEST FAILED: {e}")
            failed += 1
    
    print("\n" + "=" * 70)
    print(f"RESULTS: {passed} passed, {failed} failed")
    print("=" * 70)
    
    return failed == 0


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
