const fs = require('node:fs');
const path = require('node:path');

const CONFIG_DIR = path.resolve(__dirname, '../adaptive_writing_system/config');

const CLUSTER_LABELS = {
  0: 'Disengaged / low-participation learner',
  1: 'Efficient but fragile regulator',
  2: 'Effortful but struggling writer',
  3: 'Engaged or strategic writer',
};

let cachedRulebook = null;
let cachedTemplateConfig = null;

function loadJsonConfig(filename) {
  const fullPath = path.join(CONFIG_DIR, filename);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function loadRulebook() {
  if (!cachedRulebook) {
    cachedRulebook = loadJsonConfig('adaptive_rulebook.yaml');
  }

  return cachedRulebook;
}

function loadFeedbackTemplateConfig() {
  if (!cachedTemplateConfig) {
    cachedTemplateConfig = loadJsonConfig('feedback_templates.yaml');
  }

  return cachedTemplateConfig;
}

function loadFeedbackTemplates() {
  return loadFeedbackTemplateConfig().feedback_templates;
}

function buildRuleDefinitions() {
  const definitions = {};
  for (const rule of loadRulebook().feedback_rules) {
    definitions[rule.rule_id] = {
      category: rule.category,
      priority: rule.priority,
      enabled: rule.enabled !== false,
      interpretation: rule.display.pedagogical_interpretation,
      onsite_intervention: (rule.actions.onsite_interventions ?? []).join('; '),
      raw_data_condition: rule.display.raw_data_condition,
      ai_learner_state_output: rule.display.ai_learner_state_output,
      adaptive_feedback_type: rule.display.adaptive_feedback_type,
      feedback_message_focus: rule.display.feedback_message_focus,
      theoretical_justification: rule.display.theoretical_justification,
      feedback_templates: [...(rule.actions.feedback_templates ?? [])],
      onsite_interventions: [...(rule.actions.onsite_interventions ?? [])],
      focus_statement: rule.actions.focus_statement ?? '',
    };
  }

  return definitions;
}

function getClusterLabelDescription(label) {
  return CLUSTER_LABELS[label] ?? CLUSTER_LABELS[3];
}

function buildStrongRuleRows() {
  const templates = loadFeedbackTemplates();
  return [...loadRulebook().feedback_rules]
    .sort((left, right) => right.priority - left.priority || left.rule_id.localeCompare(right.rule_id))
    .map((rule) => ({
      rule_id: rule.rule_id,
      category: rule.category,
      priority: rule.priority,
      enabled: rule.enabled !== false,
      raw_data_condition: rule.display.raw_data_condition,
      ai_learner_state_output: rule.display.ai_learner_state_output,
      pedagogical_interpretation: rule.display.pedagogical_interpretation,
      adaptive_feedback_type: rule.display.adaptive_feedback_type,
      feedback_message_focus: rule.display.feedback_message_focus,
      theoretical_justification: rule.display.theoretical_justification,
      feedback_templates: [...(rule.actions.feedback_templates ?? [])],
      onsite_interventions: [...(rule.actions.onsite_interventions ?? [])],
      feedback_messages: (rule.actions.feedback_templates ?? []).map((templateId) => templates[templateId] ?? ''),
    }));
}

module.exports = {
  CLUSTER_LABELS,
  loadRulebook,
  loadFeedbackTemplates,
  buildRuleDefinitions,
  buildStrongRuleRows,
  getClusterLabelDescription,
};
