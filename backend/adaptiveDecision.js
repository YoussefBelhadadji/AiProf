const {
  CLUSTER_LABELS,
  buildRuleDefinitions,
  getClusterLabelDescription,
  loadFeedbackTemplates,
  loadRulebook,
} = require('./rulebook');

const path = require('node:path');
const fs = require('node:fs');
const yaml = require('js-yaml');

const CONFIG_DIR = path.resolve(__dirname, '../adaptive_writing_system/config');

function loadYamlConfig(filename) {
  const fullPath = path.join(CONFIG_DIR, filename);
  if (fs.existsSync(fullPath)) {
    try {
      return yaml.load(fs.readFileSync(fullPath, 'utf8'));
    } catch (error) {
      console.error(`Failed to parse YAML config ${filename}:`, error.message);
      return null;
    }
  }
  return null;
}

const THRESHOLDS = loadYamlConfig('thresholds.yaml')?.thresholds || {};
const COMPETENCE_MODEL = loadYamlConfig('competence_model_enhanced.yaml') || loadYamlConfig('competence_model.yaml') || {};
const RULEBOOK = loadRulebook();
const FEEDBACK_TEMPLATES = loadFeedbackTemplates();
const RULE_DEFINITIONS = buildRuleDefinitions();
const PROFILE_RULES = Array.isArray(RULEBOOK.profile_rules) ? RULEBOOK.profile_rules : [];
const FEEDBACK_RULES = Array.isArray(RULEBOOK.feedback_rules)
  ? RULEBOOK.feedback_rules
  : (Array.isArray(RULEBOOK.rules) ? RULEBOOK.rules : []);
const FEEDBACK_RULES_BY_ID = Object.fromEntries(FEEDBACK_RULES.map((rule) => [rule.rule_id, rule]));
const FIELD_ALIASES = {
  first_access_timing: 'first_access_delay_minutes',
  argumentation_score: 'argumentation',
  grammar_accuracy_score: 'grammar_accuracy',
  lexical_resource_score: 'lexical_resource',
  performance_total: 'total_score',
  score_improvement: 'score_gain',
  type_token_ratio: 'ttr',
};

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

function resolveValue(source, field) {
  if (Object.prototype.hasOwnProperty.call(source, field)) {
    return source[field];
  }

  const alias = FIELD_ALIASES[field];
  if (alias && Object.prototype.hasOwnProperty.call(source, alias)) {
    return source[alias];
  }

  return undefined;
}

function normalizeBlocks(blocks) {
  if (!blocks) {
    return [];
  }

  if (Array.isArray(blocks)) {
    return blocks.flatMap((entry) => normalizeBlocks(entry));
  }

  if (typeof blocks === 'object') {
    return [blocks];
  }

  return [];
}

function normalizeConditionGroup(group = {}) {
  if (!group) {
    return { all: [], any: [] };
  }

  if (Array.isArray(group)) {
    return { all: normalizeBlocks(group), any: [] };
  }

  if (typeof group !== 'object') {
    return { all: [], any: [] };
  }

  const hasAllAny = Object.prototype.hasOwnProperty.call(group, 'all')
    || Object.prototype.hasOwnProperty.call(group, 'any');

  if (!hasAllAny) {
    return { all: normalizeBlocks(group), any: [] };
  }

  const normalized = {
    all: normalizeBlocks(group.all),
    any: [],
  };

  if (Array.isArray(group.any)) {
    normalized.any = group.any.flatMap((entry) => {
      if (entry && typeof entry === 'object') {
        const nested = normalizeConditionGroup(entry);
        if (nested.all.length > 0) {
          return nested.all;
        }
        if (nested.any.length > 0) {
          return nested.any;
        }
      }
      return normalizeBlocks(entry);
    });
  } else if (group.any && typeof group.any === 'object') {
    normalized.any = normalizeBlocks(group.any);
  }

  return normalized;
}

function matchExpected(actual, expected) {
  if (Array.isArray(expected)) {
    return expected.some((item) => matchExpected(actual, item));
  }

  if (expected === undefined || expected === null) {
    return actual === expected;
  }

  if (typeof expected === 'number') {
    const actualNum = Number(actual);
    return Number.isFinite(actualNum) ? actualNum === expected : actual === expected;
  }

  if (typeof expected === 'boolean') {
    return Boolean(actual) === expected;
  }

  if (typeof expected !== 'string') {
    return actual === expected;
  }

  const expression = expected.trim();
  if (!expression) {
    return actual === expression;
  }

  const actualNumber = Number(actual);
  const hasActualNumber = Number.isFinite(actualNumber);
  const operatorMatch = expression.match(/^(<=|>=|<|>|==|!=)\s*(-?\d+(?:\.\d+)?)$/);
  if (operatorMatch && hasActualNumber) {
    const operator = operatorMatch[1];
    const threshold = Number(operatorMatch[2]);
    if (operator === '<=') return actualNumber <= threshold;
    if (operator === '>=') return actualNumber >= threshold;
    if (operator === '<') return actualNumber < threshold;
    if (operator === '>') return actualNumber > threshold;
    if (operator === '==') return actualNumber === threshold;
    if (operator === '!=') return actualNumber !== threshold;
  }

  const numericRangeMatch = expression.match(/^(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)$/);
  if (numericRangeMatch && hasActualNumber) {
    const lower = Number(numericRangeMatch[1]);
    const upper = Number(numericRangeMatch[2]);
    return actualNumber >= Math.min(lower, upper) && actualNumber <= Math.max(lower, upper);
  }

  const textualRangeMatch = expression.match(/^([A-Za-z][A-Za-z\s-]+)\s+to\s+([A-Za-z][A-Za-z\s-]+)$/i);
  if (textualRangeMatch) {
    return matchExpected(actual, textualRangeMatch[1].trim()) || matchExpected(actual, textualRangeMatch[2].trim());
  }

  if (/[|/]/.test(expression)) {
    return expression.split(/[|/]/).some((part) => matchExpected(actual, part.trim()));
  }

  if (expression.includes(',') && !expression.includes('.')) {
    return expression.split(',').some((part) => matchExpected(actual, part.trim()));
  }

  const expectedNumber = Number(expression);
  if (hasActualNumber && Number.isFinite(expectedNumber)) {
    return actualNumber === expectedNumber;
  }

  if (typeof actual === 'string') {
    return actual.trim().toLowerCase() === expression.toLowerCase();
  }

  return String(actual).toLowerCase() === expression.toLowerCase();
}

function matchMap(source, expectedMap = {}) {
  return Object.entries(expectedMap).every(([key, expected]) => {
    const actual = resolveValue(source, key);
    return matchExpected(actual, expected);
  });
}

function matchConditionGroup(source, group = {}) {
  const normalized = normalizeConditionGroup(group);
  const allConditions = normalized.all;
  const anyConditions = normalized.any;

  if (allConditions.some((block) => !matchMap(source, block))) {
    return false;
  }

  if (anyConditions.length === 0) {
    return true;
  }

  return anyConditions.some((block) => matchMap(source, block));
}

function getBand(value, bands) {
  if (!bands || typeof bands !== 'object') {
    return 'Medium';
  }

  const v = toNumber(value);
  for (const [label, range] of Object.entries(bands)) {
    if (Array.isArray(range) && v >= range[0] && v <= range[1]) {
      return label.charAt(0).toUpperCase() + label.slice(1);
    }
  }
  return 'Medium';
}

function inferSrlPosteriorFromHelpSeeking(helpState) {
  const competencyNodes = Array.isArray(COMPETENCE_MODEL.latent_competencies)
    ? COMPETENCE_MODEL.latent_competencies
    : [];
  const srlNode = competencyNodes.find((node) => node.competency_id === 'self_regulated_revision');

  const helpNodes = Array.isArray(COMPETENCE_MODEL?.observable_evidence?.help_seeking_indicators)
    ? COMPETENCE_MODEL.observable_evidence.help_seeking_indicators
    : [];
  const helpNode = helpNodes.find((node) => node.variable_id === 'help_seeking_level');

  const priors = srlNode?.prior_probability;
  const likelihoods = helpNode?.likelihood_table?.conditional_probabilities;

  if (!priors || !likelihoods) {
    return null;
  }

  const evidenceKey = helpState === 'Adaptive'
    ? 'Adaptive (Strategic)'
    : (helpState === 'Present' ? 'Present (Unstructured)' : 'None');

  const states = ['Low', 'Medium', 'High'];
  const weights = {};
  let normalizer = 0;

  for (const state of states) {
    const prior = Number(priors[state]);
    const likelihood = Number(likelihoods[state]?.[evidenceKey]);
    if (!Number.isFinite(prior) || !Number.isFinite(likelihood)) {
      return null;
    }

    const weight = prior * likelihood;
    weights[state] = weight;
    normalizer += weight;
  }

  if (normalizer <= 0) {
    return null;
  }

  return {
    Low: weights.Low / normalizer,
    Medium: weights.Medium / normalizer,
    High: weights.High / normalizer,
  };
}

function buildLearnerStates(student, options = {}) {
  const vocabularyHelpCount = Number(options.vocabularyHelpCount ?? 0);

  const rubricViews = toNumber(student.rubric_views);
  const timeOnTask = toNumber(student.time_on_task);
  const wordCount = toNumber(student.word_count);
  const argumentation = toNumber(student.argumentation);
  const cohesionIndex = toNumber(student.cohesion_index);
  const cohesion = toNumber(student.cohesion);
  const revisionFrequency = toNumber(student.revision_frequency);
  const feedbackViews = toNumber(student.feedback_views);
  const grammarAccuracy = toNumber(student.grammar_accuracy);
  const errorDensity = toNumber(student.error_density);
  const lexicalResource = toNumber(student.lexical_resource);
  const ttr = toNumber(student.ttr);
  const helpMessages = toNumber(student.help_seeking_messages);
  const firstAccessDelay = toNumber(student.first_access_delay_minutes);
  const assignmentViews = toNumber(student.assignment_views);
  const resourceAccessCount = toNumber(student.resource_access_count);
  const organizationScore = toNumber(student.organization);
  const scoreGain = toNumber(student.score_gain);

  // Forethought Phase (Self-Regulated Learning - Zimmerman)
  const forethought =
    rubricViews === 0 && timeOnTask < 30 && wordCount < 120
      ? 'Low'
      : (rubricViews <= 1 || timeOnTask < 60 || wordCount < 150 ? 'Medium' : 'High');
  
  // Argumentation/Claim-Evidence-Reasoning competence state
  const argument = argumentation < 2.4 ? 'Low' : (argumentation < 3.7 ? 'Medium' : 'High');
  
  // Discourse/Cohesion state (Halliday & Hasan framework)
  const discourse = (cohesionIndex <= 2 || cohesion < 3)
    ? 'Low'
    : (cohesionIndex <= 4 || cohesion < 4 ? 'Medium' : 'High');
  
  // Revision depth - Self-monitoring & Evaluation phases
  const revision = revisionFrequency === 0 ? 'Low' : (revisionFrequency <= 2 ? 'Moderate' : 'High');
  
  // Feedback integration - Responsiveness to external input
  const feedback = (feedbackViews >= 2 && revisionFrequency >= 2 && scoreGain >= 1)
    ? 'High'
    : (feedbackViews >= 1 && revisionFrequency >= 1 ? 'Medium' : 'Low');
  
  // Linguistic accuracy & error patterns
  const linguistic = (grammarAccuracy < 3 || errorDensity >= 4)
    ? 'Low'
    : (grammarAccuracy < 3.8 || errorDensity >= 2.8 ? 'Medium' : 'High');
  
  // Lexical range & academic register
  const lexical = (lexicalResource < 3 || ttr < 0.45)
    ? 'Low'
    : (lexicalResource < 3.9 || ttr < 0.54 ? 'Medium' : 'High');
  
  // Help-seeking pattern (Newman & Schwager framework)
  const helpState = helpMessages >= 1 && vocabularyHelpCount > 0
    ? 'Adaptive'
    : (helpMessages >= 1 ? 'Present' : 'None');

  // Engagement risk band (Siemens learning analytics)
  const engagementRisk = (timeOnTask < 15 && assignmentViews < 5)
    ? 'High'
    : (timeOnTask < 30 || assignmentViews < 3 ? 'Moderate' : 'Low');

  // Procrastination risk (Steel 2007)
  const procrastinationRisk = firstAccessDelay > 36 && timeOnTask < 30 ? 'High' : 'Low';
  const improvementTrajectory = scoreGain >= 1 ? 'Positive' : 'Flat';

  const helpSeekingRisk = helpState === 'Adaptive'
    ? 'Adaptive Help-Seeking'
    : (helpState === 'Present' ? 'Emerging Adaptive Help-Seeking' : 'Low Adaptive Help-Seeking');

  // Bayesian-style competence probability estimates (prior + likelihood framework)
  const argumentCompetenceProb = argumentation >= 3.7 ? 0.8 : (argumentation >= 2.4 ? 0.5 : 0.2);
  const cohesionCompetenceProb = cohesionIndex >= 3.5 ? 0.8 : (cohesionIndex >= 2.0 ? 0.5 : 0.2);
  const linguisticCompetenceProb = grammarAccuracy >= 4 && errorDensity <= 4 ? 0.8 : (grammarAccuracy >= 3 ? 0.5 : 0.2);
  const srlPosterior = inferSrlPosteriorFromHelpSeeking(helpState);
  const fallbackSrlHigh = revisionFrequency >= 3 && scoreGain >= 1 ? 0.8 : (revisionFrequency >= 1 ? 0.5 : 0.1);
  const srlRevisionCompetenceProb = srlPosterior ? round(srlPosterior.High, 4) : fallbackSrlHigh;

  return {
    forethought,
    forethought_risk: forethought === 'Low' ? 'High' : (forethought === 'Medium' ? 'Medium' : 'Low'),
    argument,
    argument_competence_prob: argumentCompetenceProb,
    argumentation_state: argument,
    argumentation_weakness: argumentation < 3 ? 'High' : (argumentation < 3.6 ? 'Moderate' : 'Low'),
    discourse,
    discourse_competence: discourse,
    revision,
    revision_depth: revisionFrequency >= 3 ? 'Deep' : (revisionFrequency >= 1 ? 'Low' : 'None'),
    feedback,
    feedback_uptake_risk: feedbackViews >= 2 && revisionFrequency === 0 ? 'High' : 'Low',
    linguistic,
    linguistic_accuracy_risk: (grammarAccuracy < 3 || errorDensity >= 8) ? 'High' : 'Low',
    lexical,
    help: helpState,
    help_seeking_pattern: helpState,
    help_seeking_risk: helpSeekingRisk,
    question_specificity: helpState === 'Adaptive' ? 'High' : 'Low',
    engagement_risk: engagementRisk,
    procrastination_risk: procrastinationRisk,
    improvement_trajectory: improvementTrajectory,
    
    // Competence probability distributions (Bayesian)
    argument_competence_prob: argumentCompetenceProb,
    cohesion_competence_prob: cohesionCompetenceProb,
    linguistic_competence_prob: linguisticCompetenceProb,
    srl_revision_competence_prob: srlRevisionCompetenceProb,
    srl_competence_distribution: srlPosterior || null,
  };
}

function buildSignals(student, options = {}) {
  const states = buildLearnerStates(student, options);

  const assignmentViews = toNumber(student.assignment_views);
  const resourceAccessCount = toNumber(student.resource_access_count);
  const timeOnTask = toNumber(student.time_on_task);
  const rubricViews = toNumber(student.rubric_views);
  const firstAccessDelay = toNumber(student.first_access_delay_minutes);
  const wordCount = toNumber(student.word_count);
  const argumentation = toNumber(student.argumentation);
  const cohesionIndex = toNumber(student.cohesion_index);
  const cohesion = toNumber(student.cohesion);
  const grammarAccuracy = toNumber(student.grammar_accuracy);
  const errorDensity = toNumber(student.error_density);
  const lexicalResource = toNumber(student.lexical_resource);
  const ttr = toNumber(student.ttr);
  const revisionFrequency = toNumber(student.revision_frequency);
  const helpMessages = toNumber(student.help_seeking_messages);
  const feedbackViews = toNumber(student.feedback_views);
  const totalScore = toNumber(student.total_score);
  const scoreGain = toNumber(student.score_gain);
  const organizationScore = toNumber(student.organization);

  const totalQuality = average([argumentation, cohesion, grammarAccuracy, lexicalResource]);
  const lowGrammar = grammarAccuracy < 3 || errorDensity >= 4;
  const strongWriting = totalQuality >= 4 && totalScore >= 21.5;

  // Threshold band classifications (Evidence-Centered Design)
  const wordCountBand = wordCount < 80 ? 'Low' : (wordCount < 150 ? 'Moderate' : 'Strong');
  const timeOnTaskBand = timeOnTask < 15 ? 'Low' : (timeOnTask < 45 ? 'Moderate' : 'Strong');
  const errorDensityBand = errorDensity >= 8 ? 'High' : (errorDensity >= 4 ? 'Moderate' : 'Low');
  const revisionFrequencyBand = revisionFrequency === 0 ? 'Low' : (revisionFrequency <= 2 ? 'Moderate' : 'Strong');
  const finalScoreBand = totalScore < 17 ? 'Low' : (totalScore < 21 ? 'Moderate' : 'Strong');
  const coherenceCheckBand = cohesionIndex <= 2 ? 'Low' : (cohesionIndex <= 3.4 ? 'Moderate' : 'Strong');

  return {
    states,
    assignment_views: assignmentViews,
    resource_access_count: resourceAccessCount,
    rubric_views: rubricViews,
    first_access_delay_minutes: firstAccessDelay,
    first_access_timing: firstAccessDelay,
    total_quality: totalQuality,
    word_count: wordCount,
    word_count_band: wordCountBand,
    time_on_task: timeOnTask,
    time_on_task_band: timeOnTaskBand,
    argumentation: argumentation,
    argumentation_score: argumentation,
    organization_score: organizationScore,
    cohesion_index: cohesionIndex,
    cohesion: cohesion,
    grammar_accuracy: grammarAccuracy,
    grammar_accuracy_score: grammarAccuracy,
    lexical_resource: lexicalResource,
    lexical_resource_score: lexicalResource,
    ttr: ttr,
    type_token_ratio: ttr,
    revision_frequency: revisionFrequency,
    revision_frequency_band: revisionFrequencyBand,
    feedback_views: feedbackViews,
    help_seeking_messages: helpMessages,
    score_gain: scoreGain,
    score_improvement: scoreGain,
    performance_total: totalScore,
    error_density: errorDensity,
    error_density_band: errorDensityBand,
    final_score: totalScore,
    final_score_band: finalScoreBand,
    improvement_trajectory: scoreGain >= 1 ? 'Positive' : 'Flat',
    
    // Key behavioral thresholds
    low_engagement: timeOnTask < 40 && resourceAccessCount < 3 && feedbackViews === 0,
    high_engagement: timeOnTask >= 90 && resourceAccessCount >= 5 && assignmentViews >= 10,
    strong_planning: rubricViews >= 3 && firstAccessDelay <= 30,
    low_planning: rubricViews === 0 && firstAccessDelay > 30,
    
    // Word count indicators
    low_word_count: wordCount < 80,
    moderate_word_count: wordCount >= 80 && wordCount < 150,
    adequate_word_count: wordCount >= 150,
    
    // Argumentation indicators
    weak_argument: argumentation < 2.4,
    very_weak_argument: argumentation < 2.0,
    developing_argument: argumentation >= 2.4 && argumentation < 3.7,
    acceptable_argument: argumentation >= 3.2,
    strong_argument: argumentation >= 3.7,
    
    // Cohesion/Organization indicators
    low_cohesion: cohesionIndex <= 2 || cohesion < 3,
    weak_organization: organizationScore <= 2,
    adequate_organization: organizationScore === 3,
    strong_cohesion: cohesionIndex >= 3.5 && cohesion >= 4,
    strong_organization: organizationScore >= 4,
    
    // Grammar/Accuracy indicators
    low_grammar: lowGrammar,
    persistent_grammar_problems: (grammarAccuracy < 3.2 || errorDensity >= 3.5) && feedbackViews >= 1 && revisionFrequency >= 2,
    strong_grammar: grammarAccuracy >= 4,
    high_error_density: errorDensity >= 8,
    
    // Vocabulary indicators
    low_lexical: lexicalResource < 3 || ttr < 0.45,
    restricted_vocabulary: ttr < 0.45,
    strong_vocabulary: lexicalResource >= 3.8 && ttr >= 0.55,
    
    // Revision behavior indicators
    no_revision: revisionFrequency === 0,
    limited_revision: revisionFrequency >= 1 && revisionFrequency <= 2,
    moderate_revision: revisionFrequency >= 1 && revisionFrequency <= 2,
    strong_revision: revisionFrequency >= 3,
    
    // Help-seeking indicators
    help_none: helpMessages === 0,
    help_present: helpMessages >= 1,
    adaptive_help_seeking: helpMessages >= 3,
    
    // Feedback engagement indicators
    feedback_viewed_not_used: feedbackViews >= 1 && revisionFrequency === 0,
    feedback_viewed_minimal_use: feedbackViews >= 1 && revisionFrequency === 1,
    feedback_responsive: feedbackViews >= 2 && revisionFrequency >= 2 && scoreGain >= 2,
    multiple_feedback_views: feedbackViews >= 2,
    
    // Overall quality indicators
    strong_writing: strongWriting,
    acceptable_writing: totalQuality >= 3.2 && totalScore >= 18,
    weak_writing: totalQuality < 3.2 || totalScore < 17,
    developing_writer: totalScore >= 17 && totalScore < 21,
    proficient_writer: totalScore >= 21 && totalScore < 26,
    advanced_writer: totalScore >= 26,
    
    // Growth/Improvement indicators
    improvement_visible: scoreGain >= 2,
    modest_improvement: scoreGain >= 1 && scoreGain < 2,
    no_improvement: scoreGain <= 0,
    repeated_difficulty: totalScore < 17 || (argumentation < 3.1 && cohesion < 3.1) || errorDensity >= 4,
    positive_growth_trajectory: scoreGain >= 1 && revisionFrequency >= 2,
    
    // Timing/Procrastination indicators
    low_time_on_task: timeOnTask < 15,
    minimal_time_on_task: timeOnTask < 30,
    moderate_time_on_task: timeOnTask >= 15 && timeOnTask < 45,
    sustained_time_on_task: timeOnTask >= 45,
    high_assignment_views: assignmentViews >= 10,
    early_access: firstAccessDelay <= 12,
    late_access: firstAccessDelay > 36,
    significant_delay: firstAccessDelay > 36 && timeOnTask < 30,
    
    // Stability indicators
    grammar_stable: !lowGrammar,
    writing_not_strong: !strongWriting,
  };
}

function buildAiContext(states, extra = {}) {
  return {
    // Zimmerman Self-Regulated Learning phases
    ai_forethought_state: states.forethought,
    forethought_risk: states.forethought_risk,
    
    // Content competence states
    ai_argument_state: states.argument,
    argumentation_state: states.argumentation_state,
    argumentation_weakness: states.argumentation_weakness,
    ai_cohesion_state: states.discourse,
    discourse_competence: states.discourse_competence,
    
    // Process competence states
    ai_revision_state: states.revision,
    revision_depth: states.revision_depth,
    ai_feedback_state: states.feedback,
    feedback_uptake_risk: states.feedback_uptake_risk,
    
    // Accuracy & proficiency states
    ai_linguistic_state: states.linguistic,
    linguistic_accuracy_risk: states.linguistic_accuracy_risk,
    ai_lexical_state: states.lexical,
    
    // Behavioral/engagement states
    ai_help_state: states.help,
    help_seeking_pattern: states.help_seeking_pattern,
    help_seeking_risk: states.help_seeking_risk,
    question_specificity: states.question_specificity,
    engagement_risk: states.engagement_risk,
    procrastination_risk: states.procrastination_risk,
    improvement_trajectory: states.improvement_trajectory,
    
    // Bayesian competence probability distributions
    argument_competence_prob: states.argument_competence_prob,
    cohesion_competence_prob: states.cohesion_competence_prob,
    linguistic_competence_prob: states.linguistic_competence_prob,
    srl_revision_competence_prob: states.srl_revision_competence_prob,
    srl_competence_distribution: states.srl_competence_distribution,
    
    ...extra,
  };
}

function compareRuleValue(actual, expression) {
  return matchExpected(actual, expression);
}

function matchFeedbackRules(context) {
  const unifiedContext = { ...context.signals, ...context.aiContext };

  return FEEDBACK_RULES.filter((rule) => {
    if (rule.enabled === false) return false;

    const conditions = rule.conditions || {};
    const hasAdaptiveSchema = typeof conditions === 'object' && (conditions.ai_states || conditions.thresholds);
    if (hasAdaptiveSchema) {
      return matchConditionGroup(unifiedContext, conditions.thresholds || {})
        && matchConditionGroup(unifiedContext, conditions.ai_states || {});
    }

    return Object.entries(conditions).every(([field, expr]) => {
      const actual = resolveValue(unifiedContext, field);
      return compareRuleValue(actual, expr);
    });
  });
}

function selectProfileRule(signals, aiContext) {
  const unifiedContext = { ...signals, ...aiContext };
  const candidates = sortRules(PROFILE_RULES, 'profile_id');
  for (const rule of candidates) {
    const conditions = rule.conditions || {};
    if (
      matchConditionGroup(unifiedContext, conditions.thresholds || {})
      && matchConditionGroup(unifiedContext, conditions.ai_states || {})
    ) {
      return rule;
    }
  }

  return {
    profile_id: 'default_profile',
    display_label: signals.low_engagement ? 'Disengaged learner' : 'Developing learner',
    cluster_label_hint: signals.low_engagement ? 0 : 3,
  };
}

function buildRuleMatch(rule, aiContext, student) {
  const actions = rule.actions || {};
  const display = rule.display || {};
  const templateIds = Array.isArray(actions.feedback_templates)
    ? actions.feedback_templates
    : (rule.feedback_type ? [rule.feedback_type] : (rule.response_template ? [rule.response_template] : []));
  const interventionIds = Array.isArray(actions.onsite_interventions)
    ? actions.onsite_interventions
    : (Array.isArray(rule.onsite_intervention) ? rule.onsite_intervention : (rule.onsite_intervention ? [rule.onsite_intervention] : []));

  const evidence = Object.entries(rule.conditions || {})
    .map(([key, val]) => `${key}=${JSON.stringify(val)}`)
    .join(' AND ');

  return {
    rule_id: rule.rule_id,
    category: rule.category,
    interpretation: rule.interpretation || display.pedagogical_interpretation || rule.pedagogical_claim || rule.display_label,
    feedback_type: rule.feedback_type || display.adaptive_feedback_type || rule.adaptive_feedback_type,
    onsite_intervention: interventionIds,
    theoretical_justification: rule.justification || display.theoretical_justification || rule.theoretical_justification || '',
    feedback_templates: templateIds,
    feedback_messages: templateIds.map((templateId) => FEEDBACK_TEMPLATES[templateId]).filter(Boolean),
    mathematical_derivation: `Threshold Bridge: Rule ${rule.rule_id} triggered via ${evidence}`,
    empirical_evidence: `Student Metrics: Argument=${student.argumentation}, Revision=${student.revision_frequency}`,
  };
}

function fallbackFeedbackRules() {
  const defaults = sortRules(FEEDBACK_RULES, 'rule_id').slice(0, 2);
  return defaults.length > 0 ? defaults : Object.values(FEEDBACK_RULES_BY_ID).slice(0, 2);
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
  const signals = buildSignals(student, options);
  const states = signals.states;

  const predictedImprovement = signals.total_quality >= 4
    ? 'High'
    : (signals.total_quality >= 3 ? 'Moderate' : 'Low');

  const aiContext = buildAiContext(states, {
    predicted_improvement: predictedImprovement,
    time_on_task_band: signals.time_on_task_band,
    final_score_band: signals.final_score_band,
    revision_frequency_band: signals.revision_frequency_band,
    rubric_views: signals.rubric_views,
    first_access_timing: signals.first_access_timing,
    score_improvement: signals.score_improvement,
  });

  const profileRule = selectProfileRule(signals, aiContext);
  const matchingContext = { signals, aiContext: { ...aiContext, profile_id: profileRule.profile_id } };

  let matchedRules = matchFeedbackRules(matchingContext);
  if (matchedRules.length === 0) {
    matchedRules = fallbackFeedbackRules();
  }

  const ruleIds = unique(matchedRules.map((rule) => rule.rule_id));
  const templates = unique(
    matchedRules.flatMap((rule) => {
      if (Array.isArray(rule.actions?.feedback_templates)) {
        return rule.actions.feedback_templates;
      }
      if (rule.feedback_type) {
        return [rule.feedback_type];
      }
      if (rule.response_template) {
        return [rule.response_template];
      }
      return [];
    }).filter(Boolean)
  );
  const focusCandidates = unique(
    matchedRules
      .map((rule) => (
        rule.display?.feedback_message_focus
        || rule.feedback_focus
        || rule.pedagogical_claim
        || rule.interpretation
        || rule.display_label
      ))
      .filter(Boolean)
  );

  const feedbackParts = templates.map((templateId) => FEEDBACK_TEMPLATES[templateId]).filter(Boolean);
  const personalizedFeedback = feedbackParts.length > 0
    ? feedbackParts.join(' ')
    : 'Continue working on your draft.';

  const clusterLabel = resolveClusterLabel(student, profileRule);
  const clusterProfile = resolveClusterProfile(student, clusterLabel, profileRule);
  const clusteringOutput = getClusterLabelDescription(clusterLabel);
  const ruleMatches = matchedRules.map((rule) => buildRuleMatch(rule, aiContext, student));

  return {
    learner_profile: profileRule.display_label || profileRule.profile_id || 'Developing learner',
    profile_rule_id: profileRule.profile_id || 'default_profile',
    cluster_profile: clusterProfile,
    cluster_label: clusterLabel,
    clustering_output: clusteringOutput,
    predicted_improvement: predictedImprovement,
    predicted_score: estimatePredictedScore(student, predictedImprovement),
    
    ...aiContext,

    triggered_rules: toDelimited(ruleIds),
    interpretations: toDelimited(focusCandidates),
    onsite_interventions: toDelimited(ruleMatches.flatMap((r) => r.onsite_intervention || [])),
    personalized_feedback: personalizedFeedback,
    final_feedback_focus: focusCandidates[0] || 'Support deeper revision and argument quality.',
    teacher_validation_prompt: buildTeacherValidationPrompt(
      focusCandidates[0] || 'Support deeper revision and argument quality.'
    ),
    rule_matches: ruleMatches,
  };
}

module.exports = {
  FEEDBACK_TEMPLATES,
  RULE_DEFINITIONS,
  CLUSTER_LABELS,
  evaluateAdaptiveDecision,
  buildLearnerStates,
  getClusterLabelDescription,
};
