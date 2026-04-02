const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const dbLayer = require('./db');

const CONFIG_DIR = path.resolve(__dirname, '../adaptive_writing_system/config');

const CLUSTER_LABELS = {
  0: 'Disengaged / low-participation learner',
  1: 'Efficient but fragile regulator',
  2: 'Effortful but struggling writer',
  3: 'Engaged or strategic writer',
};

function loadYamlConfig(filename) {
  const fullPath = path.join(CONFIG_DIR, filename);
  if (fs.existsSync(fullPath)) {
     try {
       return yaml.load(fs.readFileSync(fullPath, 'utf8'));
     } catch (e) {
       console.error(`Failed to parse YAML file ${filename}:`, e);
       return null;
     }
  }
  return null;
}

function flattenComprehensiveTemplates(node, out = {}) {
  if (!node || typeof node !== 'object') {
    return out;
  }

  for (const [key, value] of Object.entries(node)) {
    if (typeof value === 'string') {
      out[key] = value;
      continue;
    }

    if (value && typeof value === 'object') {
      flattenComprehensiveTemplates(value, out);
    }
  }

  return out;
}

function loadMergedTemplateMap() {
  const legacyTemplates = loadYamlConfig('feedback_templates.yaml')?.feedback_templates || {};

  const comprehensive = loadYamlConfig('feedback_templates_comprehensive.yaml');
  const comprehensiveTemplates = comprehensive
    ? Object.entries(comprehensive)
      .filter(([section]) => section !== 'metadata')
      .reduce((acc, [, sectionValue]) => flattenComprehensiveTemplates(sectionValue, acc), {})
    : {};

  return {
    ...legacyTemplates,
    ...comprehensiveTemplates,
  };
}

function normalizeAdaptiveRule(rule) {
  const actions = rule.actions || {};
  const templateList = Array.isArray(actions.feedback_templates)
    ? actions.feedback_templates
    : (rule.feedback_type ? [rule.feedback_type] : (rule.response_template ? [rule.response_template] : []));
  const interventionList = Array.isArray(actions.onsite_interventions)
    ? actions.onsite_interventions
    : (Array.isArray(rule.onsite_intervention) ? rule.onsite_intervention : (rule.onsite_intervention ? [rule.onsite_intervention] : []));

  return {
    rule_id: rule.rule_id,
    category: rule.category || 'general',
    priority: Number(rule.priority || 0),
    condition: JSON.stringify(rule.conditions || {}),
    ai_state_required: rule.display?.ai_learner_state_output || rule.display_label || rule.name || '',
    interpretation: rule.interpretation || rule.display?.pedagogical_interpretation || rule.pedagogical_claim || '',
    feedback_template: templateList.join('; '),
    onsite_intervention: interventionList.join('; '),
    theory_note: rule.justification || rule.display?.theoretical_justification || rule.theoretical_justification || '',
    enabled: rule.enabled === false ? 0 : 1,
  };
}

function loadRulesForSync() {
  const adaptiveRulebook = loadYamlConfig('adaptive_rulebook.yaml');
  if (adaptiveRulebook && Array.isArray(adaptiveRulebook.feedback_rules) && adaptiveRulebook.feedback_rules.length > 0) {
    return adaptiveRulebook.feedback_rules
      .filter((rule) => rule && rule.rule_id)
      .map(normalizeAdaptiveRule);
  }

  const legacy = loadYamlConfig('rules.yaml') || { rules: [] };
  return (legacy.rules || []).map((rule) => ({
    rule_id: rule.rule_id,
    category: rule.category || 'general',
    priority: Number(rule.priority || 0),
    condition: JSON.stringify(rule.conditions || {}),
    ai_state_required: rule.name || '',
    interpretation: rule.interpretation || '',
    feedback_template: rule.feedback_type || '',
    onsite_intervention: rule.onsite_intervention || '',
    theory_note: rule.justification || '',
    enabled: rule.enabled === false ? 0 : 1,
  }));
}

function syncToDb() {
  const db = dbLayer.db;
  
  // Ensure fresh sync for doctoral research integrity
  db.prepare('DELETE FROM rules').run();
  db.prepare('DELETE FROM feedback_templates').run();

  const mergedTemplates = loadMergedTemplateMap();
  if (Object.keys(mergedTemplates).length > 0) {
    const insertTpl = db.prepare('INSERT INTO feedback_templates (template_id, category, template_text) VALUES (?, ?, ?)');
    const insertMany = db.transaction((tpls) => {
      for (const [key, text] of Object.entries(tpls)) {
        insertTpl.run(key, 'general', text);
      }
    });
    insertMany(mergedTemplates);
  }

  // Sync Rules
  const normalizedRules = loadRulesForSync();
  if (normalizedRules.length > 0) {
    const insertRule = db.prepare(`
      INSERT INTO rules (rule_id, category, priority, condition, ai_state_required, interpretation, feedback_template, onsite_intervention, theory_note, enabled)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertMany = db.transaction((rules) => {
      for (const rule of rules) {
        insertRule.run(
          rule.rule_id,
          rule.category,
          rule.priority,
          rule.condition,
          rule.ai_state_required,
          rule.interpretation,
          rule.feedback_template,
          rule.onsite_intervention,
          rule.theory_note,
          rule.enabled
        );
      }
    });
    insertMany(normalizedRules);
  }
}

// Run sync on boot
try {
  syncToDb();
} catch (e) {
  console.error('Failed to sync rules to DB:', e);
}

function loadRulebook() {
  const adaptiveRulebook = loadYamlConfig('adaptive_rulebook.yaml');
  if (adaptiveRulebook && Array.isArray(adaptiveRulebook.feedback_rules)) {
    return {
      metadata: adaptiveRulebook.metadata || {
        title: 'WriteLens Master Alignment Rulebook',
        version: '2026 Edition',
      },
      profile_rules: Array.isArray(adaptiveRulebook.profile_rules) ? adaptiveRulebook.profile_rules : [],
      feedback_rules: adaptiveRulebook.feedback_rules,
      rules: adaptiveRulebook.feedback_rules,
    };
  }

  const yamlRules = loadYamlConfig('rules.yaml') || { rules: [] };

  return {
    metadata: {
      title: 'WriteLens Master Alignment Rulebook',
      version: '2026 Edition',
    },
    profile_rules: [],
    feedback_rules: yamlRules.rules || [],
    rules: yamlRules.rules || [],
  };
}

function loadFeedbackTemplates() {
  const templates = dbLayer.db.prepare('SELECT * FROM feedback_templates').all();
  const result = {};
  templates.forEach(t => {
    result[t.template_id] = t.template_text;
  });
  return result;
}

function buildRuleDefinitions() {
  const definitions = {};
  const rulebook = loadRulebook();
  const rules = (rulebook.feedback_rules && rulebook.feedback_rules.length > 0)
    ? rulebook.feedback_rules
    : (rulebook.rules || []);
  
  for (const rule of rules) {
    const actions = rule.actions || {};
    definitions[rule.rule_id] = {
      category: rule.category,
      priority: rule.priority,
      enabled: rule.enabled !== false,
      interpretation: rule.interpretation || rule.display?.pedagogical_interpretation,
      onsite_intervention: rule.onsite_intervention || actions.onsite_interventions,
      conditions: rule.conditions || {},
      feedback_type: rule.feedback_type || actions.feedback_templates,
    };
  }

  return definitions;
}

function getClusterLabelDescription(label) {
  return CLUSTER_LABELS[label] ?? CLUSTER_LABELS[3];
}

function buildStrongRuleRows() {
  const rulebook = loadRulebook();
  const rows = (rulebook.feedback_rules && rulebook.feedback_rules.length > 0)
    ? rulebook.feedback_rules
    : (rulebook.rules || []);

  return rows
    .sort((left, right) => right.priority - left.priority || left.rule_id.localeCompare(right.rule_id))
    .map((rule) => ({
      rule_id: rule.rule_id,
      name: rule.name || rule.display?.ai_learner_state_output || rule.display?.pedagogical_interpretation || rule.rule_id,
      category: rule.category,
      priority: rule.priority,
      enabled: rule.enabled !== false,
      conditions: rule.conditions,
      interpretation: rule.interpretation || rule.display?.pedagogical_interpretation,
      feedback_type: rule.feedback_type || rule.actions?.feedback_templates,
      onsite_intervention: rule.onsite_intervention || rule.actions?.onsite_interventions,
      justification: rule.justification || rule.display?.theoretical_justification,
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
