const {
  CLUSTER_LABELS,
  buildRuleDefinitions,
  getClusterLabelDescription,
  loadFeedbackTemplates,
  loadRulebook,
} = require('./rulebook');

const RULEBOOK = loadRulebook();
const FEEDBACK_TEMPLATES = loadFeedbackTemplates();
const RULE_DEFINITIONS = buildRuleDefinitions();
const PROFILE_RULES = [...RULEBOOK.profile_rules];
const FEEDBACK_RULES = [...RULEBOOK.feedback_rules];
const PROFILE_RULES_BY_ID = Object.fromEntries(PROFILE_RULES.map((rule) => [rule.profile_id, rule]));
const FEEDBACK_RULES_BY_ID = Object.fromEntries(FEEDBACK_RULES.map((rule) => [rule.rule_id, rule]));

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function average(values) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function toDelimited(values) {
  return unique(values).join('; ');
}

function toNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function sortRules(items, idKey) {
  return [...items].sort((left, right) => {
    const priorityDelta = Number(right.priority ?? 0) - Number(left.priority ?? 0);
    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return String(left[idKey] ?? '').localeCompare(String(right[idKey] ?? ''));
  });
}

function matchExpected(actual, expected) {
  if (Array.isArray(expected)) {
    return expected.includes(actual);
  }

  return actual === expected;
}

function matchMap(source, expectedMap = {}) {
  return Object.entries(expectedMap).every(([key, expected]) => matchExpected(source[key], expected));
}

function matchConditionGroup(source, group = {}) {
  const allConditions = group.all ?? {};
  const anyConditions = group.any ?? [];

  if (!matchMap(source, allConditions)) {
    return false;
  }

  if (anyConditions.length === 0) {
    return true;
  }

  return anyConditions.some((block) => matchMap(source, block));
}

function buildBayesianStates(student, options = {}) {
  const vocabularyHelpCount = Number(options.vocabularyHelpCount ?? 0);
  const forethought =
    student.rubric_views === 0 && student.time_on_task < 30 && student.word_count < 120
      ? 'Low'
      : student.rubric_views <= 1 || student.time_on_task < 60 || student.word_count < 150
        ? 'Medium'
        : 'High';
  const argument =
    student.argumentation < 3
      ? 'Low'
      : student.argumentation < 3.8
        ? 'Medium'
        : 'High';
  const cohesion =
    student.cohesion_index <= 2 || student.cohesion < 3
      ? 'Low'
      : student.cohesion_index <= 4 || student.cohesion < 4
        ? 'Medium'
        : 'High';
  const revision =
    student.revision_frequency === 0
      ? 'Low'
      : student.revision_frequency <= 2
        ? 'Medium'
        : 'High';
  const feedback =
    student.feedback_views >= 2 && student.revision_frequency >= 2
      ? 'High'
      : student.feedback_views >= 1 && student.revision_frequency >= 1
        ? 'Medium'
        : 'Low';
  const linguistic =
    student.grammar_accuracy < 3 || student.error_density >= 4
      ? 'Low'
      : student.grammar_accuracy < 3.8 || student.error_density >= 2.8
        ? 'Medium'
        : 'High';
  const lexical =
    student.lexical_resource < 3 || student.ttr < 0.45
      ? 'Low'
      : student.lexical_resource < 3.9 || student.ttr < 0.54
        ? 'Medium'
        : 'High';
  const help =
    student.help_seeking_messages >= 1
      ? vocabularyHelpCount > 0
        ? 'Adaptive'
        : 'Present'
      : 'None';

  return {
    forethought,
    argument,
    cohesion,
    revision,
    feedback,
    linguistic,
    lexical,
    help,
  };
}

function buildSignals(student, options = {}) {
  const totalQuality = average([
    Number(student.argumentation ?? 0),
    Number(student.cohesion ?? 0),
    Number(student.grammar_accuracy ?? 0),
    Number(student.lexical_resource ?? 0),
  ]);
  const vocabularyHelpCount = Number(options.vocabularyHelpCount ?? 0);
  const states = buildBayesianStates(student, options);

  const lowGrammar = student.grammar_accuracy < 3 || student.error_density >= 4;
  const strongWriting = totalQuality >= 4 && student.total_score >= 21.5;

  return {
    states,
    vocabularyHelpCount,
    totalQuality,
    lowEngagement:
      student.time_on_task < 40 &&
      student.resource_access_count < 3 &&
      student.feedback_views === 0,
    highEngagement:
      student.time_on_task >= 90 &&
      student.resource_access_count >= 5 &&
      student.assignment_views >= 10,
    strongPlanning:
      student.rubric_views >= 3 && Number(student.first_access_delay_minutes ?? 0) <= 30,
    lowPlanning:
      student.rubric_views === 0 && Number(student.first_access_delay_minutes ?? 0) > 30,
    lowWordCount: student.word_count < 120,
    adequateWordCount: student.word_count >= 150,
    weakArgument: student.argumentation < 3.6,
    veryWeakArgument: student.argumentation < 3,
    acceptableArgument: student.argumentation >= 3.2,
    lowCohesion: student.cohesion_index <= 2 || student.cohesion < 3,
    strongCohesion: student.cohesion_index >= 4 && student.cohesion >= 4,
    lowGrammar,
    persistentGrammarProblems:
      (student.grammar_accuracy < 3.2 || student.error_density >= 3.5) &&
      student.feedback_views >= 1 &&
      student.revision_frequency >= 2,
    lowLexical: student.lexical_resource < 3 || student.ttr < 0.45,
    noRevision: student.revision_frequency === 0,
    limitedRevision: student.revision_frequency <= 1,
    moderateRevision: student.revision_frequency >= 1 && student.revision_frequency <= 2,
    strongRevision: student.revision_frequency >= 3,
    helpNone: student.help_seeking_messages === 0,
    helpPresent: student.help_seeking_messages >= 1,
    feedbackViewedNotUsed: student.feedback_views >= 1 && student.revision_frequency === 0,
    feedbackResponsive:
      student.feedback_views >= 2 &&
      student.revision_frequency >= 2 &&
      Number(student.score_gain ?? 0) >= 2,
    strongWriting,
    acceptableWriting: totalQuality >= 3.2 && student.total_score >= 18,
    weakWriting: totalQuality < 3.2 || student.total_score < 17,
    improvementVisible: Number(student.score_gain ?? 0) >= 2,
    repeatedDifficulty:
      student.total_score < 17 ||
      (student.argumentation < 3.1 && student.cohesion < 3.1) ||
      student.error_density >= 4,
    lowTimeOnTask: student.time_on_task < 30,
    highAssignmentViews: student.assignment_views >= 10,
    vocabularyHelpAvailable: vocabularyHelpCount > 0,
    grammarStable: !lowGrammar,
    writingNotStrong: !strongWriting,
  };
}

function buildSignalContext(signals) {
  return {
    low_engagement: signals.lowEngagement,
    high_engagement: signals.highEngagement,
    strong_planning: signals.strongPlanning,
    low_planning: signals.lowPlanning,
    low_word_count: signals.lowWordCount,
    adequate_word_count: signals.adequateWordCount,
    weak_argument: signals.weakArgument,
    very_weak_argument: signals.veryWeakArgument,
    acceptable_argument: signals.acceptableArgument,
    low_cohesion: signals.lowCohesion,
    strong_cohesion: signals.strongCohesion,
    low_grammar: signals.lowGrammar,
    persistent_grammar_problems: signals.persistentGrammarProblems,
    low_lexical: signals.lowLexical,
    moderate_revision: signals.moderateRevision,
    no_revision: signals.noRevision,
    limited_revision: signals.limitedRevision,
    strong_revision: signals.strongRevision,
    help_none: signals.helpNone,
    help_present: signals.helpPresent,
    feedback_viewed_not_used: signals.feedbackViewedNotUsed,
    feedback_responsive: signals.feedbackResponsive,
    strong_writing: signals.strongWriting,
    acceptable_writing: signals.acceptableWriting,
    weak_writing: signals.weakWriting,
    improvement_visible: signals.improvementVisible,
    repeated_difficulty: signals.repeatedDifficulty,
    low_time_on_task: signals.lowTimeOnTask,
    high_assignment_views: signals.highAssignmentViews,
    vocabulary_help_available: signals.vocabularyHelpAvailable,
    grammar_stable: signals.grammarStable,
    writing_not_strong: signals.writingNotStrong,
  };
}

function buildAiContext(states, extra = {}) {
  return {
    ai_forethought_state: states.forethought,
    ai_argument_state: states.argument,
    ai_cohesion_state: states.cohesion,
    ai_revision_state: states.revision,
    ai_feedback_state: states.feedback,
    ai_linguistic_state: states.linguistic,
    ai_lexical_state: states.lexical,
    ai_help_state: states.help,
    ...extra,
  };
}

function selectProfileRule(signalContext, aiContext) {
  for (const rule of sortRules(PROFILE_RULES, 'profile_id')) {
    const conditions = rule.conditions ?? {};
    if (
      matchConditionGroup(signalContext, conditions.thresholds ?? {}) &&
      matchConditionGroup(aiContext, conditions.ai_states ?? {})
    ) {
      return rule;
    }
  }

  return PROFILE_RULES_BY_ID.engaged_but_developing;
}

function matchFeedbackRules(signalContext, aiContext) {
  return sortRules(FEEDBACK_RULES, 'rule_id').filter((rule) => {
    if (rule.enabled === false) {
      return false;
    }

    const conditions = rule.conditions ?? {};
    return (
      matchConditionGroup(signalContext, conditions.thresholds ?? {}) &&
      matchConditionGroup(aiContext, conditions.ai_states ?? {})
    );
  });
}

function buildRuleMatch(rule) {
  const templateIds = [...(rule.actions.feedback_templates ?? [])];
  return {
    rule_id: rule.rule_id,
    category: rule.category,
    priority: rule.priority,
    raw_data_condition: rule.display.raw_data_condition,
    ai_learner_state_output: rule.display.ai_learner_state_output,
    pedagogical_interpretation: rule.display.pedagogical_interpretation,
    adaptive_feedback_type: rule.display.adaptive_feedback_type,
    feedback_message_focus: rule.display.feedback_message_focus,
    theoretical_justification: rule.display.theoretical_justification,
    feedback_templates: templateIds,
    feedback_messages: templateIds.map((templateId) => FEEDBACK_TEMPLATES[templateId]).filter(Boolean),
    onsite_interventions: [...(rule.actions.onsite_interventions ?? [])],
  };
}

function fallbackFeedbackRules() {
  return [FEEDBACK_RULES_BY_ID.B2, FEEDBACK_RULES_BY_ID.C2];
}

function estimatePredictedScore(student, predictedImprovement) {
  const gainMultiplier =
    predictedImprovement === 'High'
      ? 1.2
      : predictedImprovement === 'Moderate-High'
        ? 1.05
        : predictedImprovement === 'Moderate'
          ? 0.9
          : predictedImprovement === 'Low-Moderate'
            ? 0.75
            : 0.6;
  const projected = Number(student.total_score ?? 0) + Number(student.score_gain ?? 0) * gainMultiplier;
  return round(projected, 1);
}

function resolveClusterLabel(student, profileRule) {
  for (const key of ['cluster_label', 'cluster_id']) {
    const rawValue = student[key];
    if (rawValue === undefined || rawValue === null || rawValue === '') {
      continue;
    }

    const label = Number(rawValue);
    if (Number.isInteger(label) && CLUSTER_LABELS[label]) {
      return label;
    }
  }

  return Number(profileRule.cluster_label_hint ?? 3);
}

function resolveClusterProfile(student, clusterLabel, profileRule) {
  const direct = typeof student.cluster_profile === 'string' ? student.cluster_profile.trim() : '';
  if (direct) {
    return direct;
  }

  return profileRule.cluster_profile_hint || getClusterLabelDescription(clusterLabel);
}

function buildTeacherValidationPrompt(finalFeedbackFocus) {
  return `Teacher validation required: confirm that the main focus should be "${finalFeedbackFocus}" before releasing the student-facing message.`;
}

function evaluateAdaptiveDecision(student, options = {}) {
  const states = buildBayesianStates(student, options);
  const signals = buildSignals(student, options);
  const signalContext = buildSignalContext(signals);
  const baseAiContext = buildAiContext(states);
  const profileRule = selectProfileRule(signalContext, baseAiContext);
  const aiContext = buildAiContext(states, {
    profile_id: profileRule.profile_id,
    predicted_improvement: profileRule.predicted_improvement,
  });

  let matchedRules = matchFeedbackRules(signalContext, aiContext);
  if (matchedRules.length === 0) {
    matchedRules = fallbackFeedbackRules();
  }

  const ruleIds = unique(matchedRules.map((rule) => rule.rule_id));
  const templates = unique(
    matchedRules.flatMap((rule) => [...(rule.actions.feedback_templates ?? [])])
  );
  const interventions = unique(
    matchedRules.flatMap((rule) => [...(rule.actions.onsite_interventions ?? [])])
  );
  const interpretations = unique(
    matchedRules.map((rule) => rule.display.pedagogical_interpretation)
  );
  const feedbackParts = templates.map((templateId) => FEEDBACK_TEMPLATES[templateId]).filter(Boolean);
  const focusCandidates = unique([
    profileRule.default_focus_statement ?? '',
    ...matchedRules.map((rule) => rule.actions.focus_statement ?? ''),
  ]);
  const finalFeedbackFocus =
    focusCandidates[0] ||
    'Support the next revision at the level of reasoning, organization, and explanation rather than surface correction alone.';
  const clusterLabel = resolveClusterLabel(student, profileRule);
  const clusterProfile = resolveClusterProfile(student, clusterLabel, profileRule);
  const personalizedFeedback =
    feedbackParts.length > 0
      ? feedbackParts.join(' ')
      : 'No specific writing needs detected. Continue following the task guidelines.';

  return {
    learner_profile: profileRule.display_label,
    profile_rule_id: profileRule.profile_id,
    cluster_profile: clusterProfile,
    clustering_output: clusterProfile,
    cluster_label: clusterLabel,
    predicted_improvement: profileRule.predicted_improvement,
    random_forest_output: profileRule.random_forest_summary,
    bayesian_output: profileRule.bayesian_summary,
    ai_forethought_state: states.forethought,
    ai_argument_state: states.argument,
    ai_cohesion_state: states.cohesion,
    ai_revision_state: states.revision,
    ai_feedback_state: states.feedback,
    ai_linguistic_state: states.linguistic,
    ai_lexical_state: states.lexical,
    ai_help_state: states.help,
    triggered_rules: toDelimited(ruleIds),
    triggered_rule_ids: toDelimited(ruleIds),
    interpretations: toDelimited(interpretations),
    feedback_types: toDelimited(templates),
    feedback_templates_selected: toDelimited(templates),
    onsite_interventions: toDelimited(interventions),
    final_feedback_focus: finalFeedbackFocus,
    teacher_validation_prompt: buildTeacherValidationPrompt(finalFeedbackFocus),
    personalized_feedback: personalizedFeedback,
    final_feedback_message: personalizedFeedback,
    predicted_score: estimatePredictedScore(student, profileRule.predicted_improvement),
    rule_matches: matchedRules.map(buildRuleMatch),
  };
}

module.exports = {
  FEEDBACK_TEMPLATES,
  RULE_DEFINITIONS,
  CLUSTER_LABELS,
  evaluateAdaptiveDecision,
  buildBayesianStates,
  getClusterLabelDescription,
};
