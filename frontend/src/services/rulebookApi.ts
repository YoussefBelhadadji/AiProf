const DEFAULT_API_BASE = import.meta.env.DEV ? 'http://127.0.0.1:5000' : '';
const API_BASE = (import.meta.env.VITE_API_URL ?? DEFAULT_API_BASE).replace(/\/$/, '');

export interface RulebookMetadata {
  title: string;
  preface: string;
  strong_rule_table_columns: string[];
}

export interface StrongRuleRow {
  rule_id: string;
  category: string;
  priority: number;
  enabled: boolean;
  raw_data_condition: string;
  ai_learner_state_output: string;
  pedagogical_interpretation: string;
  adaptive_feedback_type: string;
  feedback_message_focus: string;
  theoretical_justification: string;
  feedback_templates: string[];
  onsite_interventions: string[];
  feedback_messages: string[];
}

export interface RulebookResponse {
  metadata: RulebookMetadata;
  strong_rule_table: StrongRuleRow[];
}

export async function fetchRulebook(): Promise<RulebookResponse> {
  const response = await fetch(`${API_BASE}/api/rulebook`);

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({ error: 'Failed to load the canonical rulebook.' }));
    throw new Error(errorPayload.error ?? 'Failed to load the canonical rulebook.');
  }

  return response.json();
}
