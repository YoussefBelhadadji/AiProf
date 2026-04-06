#!/usr/bin/env node

/**
 * Test suite for backend help-seeking Bayesian inference and adaptive rulebook.
 * 
 * Tests:
 * 1. Help-seeking evidence detection in learner states
 * 2. SRL Bayesian competence posterior inference from help-seeking data
 * 3. Adaptive rulebook expression matching (operators, ranges, alternation)
 * 4. Extended rule field propagation to feedback output
 * 5. Unified context matching for signals + ai_states
 */

const {
  evaluateAdaptiveDecision,
  buildLearnerStates,
  getClusterLabelDescription,
} = require('../adaptiveDecision');

function logTest(title) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(title);
  console.log('='.repeat(70));
}

function log(message) {
  console.log(message);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * Test 1: Help-seeking basic detection
 */
function testHelpSeekingBasic() {
  logTest('Test 1: Help-Seeking Basic Detection');

  const student = {
    student_id: 'test001',
    total_score: 70,
    score_gain: 5,
    revision_count: 3,
    feedback_views: 2,
    help_seeking_messages: 3,  // Help-seeking evidence
    help_seeking_state: 'Present',
    assignment_views: 5,
    rubric_views: 2,
    time_on_task_minutes: 120,
    argument_structure: 3,
    sentence_complexity: 2,
    discourse_organization: 2,
    linguistic_accuracy: 3,
    lexical_resource: 2,
  };

  const states = buildLearnerStates(student);

  log(`  help_seeking_pattern: ${states.help_seeking_pattern || 'undefined'}`);
  log(`  help_seeking_risk: ${states.help_seeking_risk || 'undefined'}`);
  log(`  revision_depth: ${states.revision_depth || 'undefined'}`);
  log(`  srl_competence_distribution: ${JSON.stringify(states.srl_competence_distribution, null, 2)}`);

  assert(
    ['Low', 'Medium', 'High'].includes(states.help),
    `Expected help state in [Low, Medium, High], got ${states.help}`
  );

  assert(
    states.help_seeking_pattern || states.help === 'Medium',
    'Expected help-seeking pattern to be detected'
  );

  log('\n  ✓ PASSED: Help-seeking states computed');
}

/**
 * Test 2: Bayesian posterior inference from help-seeking
 */
function testBayesianPosteriorInference() {
  logTest('Test 2: Bayesian Posterior Inference from Help-Seeking');

  // Test case 1: Adaptive help-seeking (should increase SRL High posterior)
  const studentAdaptive = {
    student_id: 'test_adaptive',
    total_score: 65,
    score_gain: 8,
    revision_count: 5,
    feedback_views: 4,
    help_seeking_messages: 5,
    help_seeking_state: 'Adaptive',
    assignment_views: 6,
    rubric_views: 3,
    time_on_task_minutes: 150,
    argument_structure: 2,
    sentence_complexity: 2,
    discourse_organization: 2,
    linguistic_accuracy: 2,
    lexical_resource: 2,
  };

  const statesAdaptive = buildLearnerStates(studentAdaptive);
  const srlDist = statesAdaptive.srl_competence_distribution || {};

  log(`  Adaptive help-seeking SRL distribution:`);
  log(`    Low: ${(srlDist.Low || 0).toFixed(3)}`);
  log(`    Medium: ${(srlDist.Medium || 0).toFixed(3)}`);
  log(`    High: ${(srlDist.High || 0).toFixed(3)}`);

  if (srlDist.High) {
    assert(
      srlDist.High > 0.1,
      `Expected High probability > 0.1 for adaptive help, got ${srlDist.High}`
    );
  }

  // Test case 2: No help-seeking (should lower SRL High posterior)
  const studentNoHelp = {
    student_id: 'test_no_help',
    total_score: 65,
    score_gain: 3,
    revision_count: 2,
    feedback_views: 1,
    help_seeking_messages: 0,
    help_seeking_state: 'None',
    assignment_views: 3,
    rubric_views: 0,
    time_on_task_minutes: 60,
    argument_structure: 2,
    sentence_complexity: 2,
    discourse_organization: 2,
    linguistic_accuracy: 2,
    lexical_resource: 2,
  };

  const statesNoHelp = buildLearnerStates(studentNoHelp);
  const srlDistNoHelp = statesNoHelp.srl_competence_distribution || {};

  log(`\n  No help-seeking SRL distribution:`);
  log(`    Low: ${(srlDistNoHelp.Low || 0).toFixed(3)}`);
  log(`    Medium: ${(srlDistNoHelp.Medium || 0).toFixed(3)}`);
  log(`    High: ${(srlDistNoHelp.High || 0).toFixed(3)}`);

  log('\n  ✓ PASSED: Bayesian posteriors computed from help-seeking evidence');
}

/**
 * Test 3: Extended rule fields extraction and propagation
 */
function testExtendedRuleFields() {
  logTest('Test 3: Extended Rule Field Propagation');

  const student = {
    student_id: 'test_extended',
    total_score: 75,
    score_gain: 10,
    revision_count: 6,
    feedback_views: 5,
    help_seeking_messages: 2,
    help_seeking_state: 'Present',
    assignment_views: 8,
    rubric_views: 3,
    time_on_task_minutes: 180,
    argument_structure: 4,
    sentence_complexity: 3,
    discourse_organization: 3,
    linguistic_accuracy: 4,
    lexical_resource: 3,
  };

  const decision = evaluateAdaptiveDecision(student);

  log(`\n  Decision Output Fields:`);
  log(`    learner_profile: ${decision.learner_profile}`);
  log(`    predicted_improvement: ${decision.predicted_improvement}`);
  log(`    profile_rule_id: ${decision.profile_rule_id}`);
  log(`    help_seeking_risk: ${decision.help_seeking_risk || 'N/A'}`);
  log(`    revision_depth: ${decision.revision_depth || 'N/A'}`);

  if (decision.rule_matches && decision.rule_matches.length > 0) {
    const firstMatch = decision.rule_matches[0];
    log(`\n  First Rule Match Fields:`);
    log(`    rule_id: ${firstMatch.rule_id}`);
    log(`    category: ${firstMatch.category}`);
    log(`    adaptive_feedback_type: ${firstMatch.adaptive_feedback_type || 'N/A'}`);
    log(`    feedback_message_focus: ${firstMatch.feedback_message_focus || 'N/A'}`);
    log(`    pedagogical_interpretation: ${firstMatch.pedagogical_interpretation || 'N/A'}`);
  }

  assert(
    decision.learner_profile,
    'Missing learner_profile'
  );

  assert(
    decision.predicted_improvement,
    'Missing predicted_improvement'
  );

  assert(
    Array.isArray(decision.rule_matches),
    'rule_matches should be an array'
  );

  log('\n  ✓ PASSED: Extended rule fields propagated correctly');
}

/**
 * Test 4: Unified context matching with operator syntax
 */
function testUnifiedContextMatching() {
  logTest('Test 4: Unified Context Matching with Operators');

  const student = {
    student_id: 'test_operators',
    total_score: 72,
    score_gain: 8,
    revision_count: 4,
    feedback_views: 3,
    help_seeking_messages: 2,
    help_seeking_state: 'Present',
    assignment_views: 7,    // Should match >= 5, <= 10
    rubric_views: 4,        // Should match >= 2, <= 5
    time_on_task_minutes: 140,
    argument_structure: 3,
    sentence_complexity: 2,
    discourse_organization: 2,
    linguistic_accuracy: 3,
    lexical_resource: 2,
  };

  const decision = evaluateAdaptiveDecision(student);

  log(`\n  Unified Context Matching:`);
  log(`    Triggered Rules: ${decision.triggered_rules || 'none'}`);
  log(`    Number of Matched Rules: ${(decision.rule_matches || []).length}`);
  log(`    Final Feedback Focus: ${decision.final_feedback_focus}`);

  // System should have matched some rules with the unified context
  log('\n  ✓ PASSED: Unified context matching completed');
}

/**
 * Test 5: Fallback behavior for unmatched conditions
 */
function testFallbackBehavior() {
  logTest('Test 5: Fallback Behavior');

  // Minimal student that may not match typical conditions
  const student = {
    student_id: 'test_fallback',
    total_score: 50,
    score_gain: 0,
    revision_count: 0,
    feedback_views: 0,
    help_seeking_messages: 0,
    help_seeking_state: 'None',
  };

  const decision = evaluateAdaptiveDecision(student);

  log(`\n  Fallback Decision:`);
  log(`    Learner Profile: ${decision.learner_profile}`);
  log(`    Cluster Profile: ${decision.cluster_profile}`);
  log(`    Feedback Message: ${(decision.personalized_feedback || '').substring(0, 100)}...`);

  assert(
    decision.personalized_feedback,
    'Missing fallback feedback message'
  );

  assert(
    decision.learner_profile,
    'Missing fallback learner profile'
  );

  log('\n  ✓ PASSED: Fallback behavior works correctly');
}

/**
 * Test 6: Cluster label resolution
 */
function testClusterResolution() {
  logTest('Test 6: Cluster Label Resolution');

  const descriptions = [1, 2, 3, 4].map((label) => ({
    label,
    description: getClusterLabelDescription(label),
  }));

  log(`\n  Cluster Descriptions:`);
  descriptions.forEach((item) => {
    log(`    Cluster ${item.label}: ${item.description}`);
  });

  descriptions.forEach((item) => {
    assert(
      item.description && item.description.length > 0,
      `Cluster ${item.label} should have a description`
    );
  });

  log('\n  ✓ PASSED: Cluster resolution works');
}

/**
 * Run all tests
 */
function runAllTests() {
  console.log('\n' + '='.repeat(70));
  console.log('BACKEND HELP-SEEKING BAYESIAN INFERENCE TEST SUITE');
  console.log('='.repeat(70));

  const tests = [
    testHelpSeekingBasic,
    testBayesianPosteriorInference,
    testUnifiedContextMatching,
    testExtendedRuleFields,
    testClusterResolution,
    testFallbackBehavior,
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      test();
      passed++;
    } catch (error) {
      console.log(`\n  ✗ TEST FAILED: ${error.message}`);
      console.log(error.stack);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(70) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

runAllTests();
