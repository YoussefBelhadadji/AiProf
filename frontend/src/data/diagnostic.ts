import { clamp } from '../utils/utils';

export type ClusterName = string;

export interface RuleMatch {
  rule_id: string;
  category: string;
  priority: number;
  raw_data_condition: string;
  ai_learner_state_output: string;
  pedagogical_interpretation: string;
  adaptive_feedback_type: string;
  feedback_message_focus: string;
  theoretical_justification: string;
  feedback_templates: string[];
  feedback_messages: string[];
  onsite_interventions: string[];
}

export interface StudentRecord {
  student_id: string;
  name: string;
  email: string;
  assignment_views: number;
  resource_access_count: number;
  rubric_views: number;
  time_on_task: number;
  revision_frequency: number;
  feedback_views: number;
  help_seeking_messages: number;
  word_count: number;
  error_density: number;
  cohesion_index: number;
  cohesion: number;
  ttr: number;
  argumentation: number;
  grammar_accuracy: number;
  lexical_resource: number;
  total_score: number;
  score_gain: number;
  first_access_delay_minutes: number;
  sample_text: string;
  triggered_rule_ids: string;
  interpretations: string;
  feedback_types: string;
  onsite_interventions: string;
  cluster_label: number;
  predicted_score: number | null;
  personalized_feedback: string;
  learner_profile?: string;
  cluster_profile?: string;
  clustering_output?: string;
  predicted_improvement?: string;
  predicted_score_estimate?: number | null;
  random_forest_output?: string;
  bayesian_output?: string;
  feedback_templates_selected?: string;
  final_feedback_focus?: string;
  teacher_validation_prompt?: string;
  ai_forethought_state?: string;
  ai_argument_state?: string;
  ai_cohesion_state?: string;
  ai_revision_state?: string;
  ai_feedback_state?: string;
  ai_linguistic_state?: string;
  ai_lexical_state?: string;
  ai_help_state?: string;
  profile_rule_id?: string;
  rule_matches?: RuleMatch[];
  rf_feature_impacts?: { feature: string; impact: number }[];
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface ClusterCentroid {
  time_on_task: number;
  revision_frequency: number;
  feedback_views: number;
  rubric_views: number;
  help_seeking_messages: number;
  total_score: number;
  ttr: number;
  cohesion_index: number;
  word_count: number;
  cluster_label: number;
  cluster_profile?: string;
}

export interface RfMetrics {
  mae: number;
  r2: number;
}

export interface DiagnosticData {
  students: StudentRecord[];
  metrics: {
    rf_metrics: RfMetrics;
    rf_importance: FeatureImportance[];
    cluster_centroids: ClusterCentroid[];
  };
}

export interface CaseStudyMeta {
  workbookPath: string;
  studentName: string;
  userId: string;
  courseTitle: string;
  courseId: string;
  institution: string;
  instructor: string;
  reportGenerated: string;
  periodCovered: string;
  totalAssignmentsSubmitted: number;
  gradedAssignments: number;
  ungradedAssignments: number;
  forumPosts: number;
  activityLogEntries: number;
  chatMessages: number;
  feedbackViewedAt: string;
  introGrade: string;
  finalWordCount: number;
  dominantNeed: string;
}

export interface WorkspaceStudent {
  id: string;
  name: string;
  archetype: 'engaged-developing' | 'efficient' | 'struggling' | 'at-risk';
  risk: 'low' | 'monitor' | 'critical';
  preScore: number;
  postScore: number;
  gain: number;
  engagement: number;
  drafts: number;
  feedbackViewed: number;
  ruleTriggered: string;
  helpSeeking: number;
  lastActive: string;
  active: boolean;
  moodle: Record<string, number>;
  rubric: Array<{ subject: string; A: number; fullMark: number }>;
  nlp: Array<{ subject: string; A: number }>;
  history: Array<{ name: string; score: number }>;
}

export interface ActivityItem {
  time: string;
  action: string;
  icon: 'activity' | 'download' | 'alert' | 'message' | 'upload';
}

export interface DialogueMessage {
  date: string;
  role: 'teacher' | 'student';
  sender: string;
  topic: string;
  message: string;
  intent?: 'Clarification Request' | 'Procedural Question' | 'Conceptual Support' | 'Language Assistance';
}

export interface InstructorComment {
  date: string;
  assessment: string;
  grade: string;
  viewedAt: string;
  comment: string;
  note?: string;
}

export interface RubricCriterion {
  criterion: string;
  fail: string;
  partial: string;
  full: string;
  maxPoints: number;
}

export interface ActivitySignal {
  label: string;
  value: string;
  note: string;
  accent: 'lav' | 'teal' | 'gold' | 'red';
}

export interface ActivitySession {
  start: string;
  end: string;
  minutes: number;
  events: number;
  focus: string;
}

export interface ActivityTraceEvent {
  timestamp: string;
  event: string;
  context: string;
  detail: string;
}

export interface WritingArtifact {
  id: string;
  title: string;
  date: string;
  status: 'draft' | 'revision-comment' | 'final-submission';
  wordCount: number;
  text: string;
  teacherComment?: string;
}

export interface ComparisonMetric {
  label: string;
  before: string;
  after: string;
  delta: string;
}

export interface RevisionSequenceStep {
  timestamp: string;
  phase: string;
  detail: string;
  kind: 'draft' | 'feedback' | 'revision' | 'resource' | 'final';
}

export interface MessageThreshold {
  id: string;
  label: string;
  threshold: string;
  matched: number;
  evidence: string;
  interpretation: string;
}

export const caseStudyMeta: CaseStudyMeta = {
  workbookPath: 'C:\\Users\\CORTEC\\Desktop\\projectpr\\lahmarabbou_asmaa_FULL_ENGLISH (1).xlsx',
  studentName: 'lahmarabbou asmaa',
  userId: '9263',
  courseTitle: 'Academic Writing',
  courseId: '379',
  institution: 'University of Ain Temouchent',
  instructor: 'Fatima GUERCH',
  reportGenerated: '14 March 2026',
  periodCovered: '20 November 2025 - 14 March 2026',
  totalAssignmentsSubmitted: 9,
  gradedAssignments: 1,
  ungradedAssignments: 9,
  forumPosts: 2,
  activityLogEntries: 260,
  chatMessages: 48,
  feedbackViewedAt: '12 Feb 2026 23:25',
  introGrade: '10 / 100',
  finalWordCount: 199,
  dominantNeed: 'feedback decoding, deeper reasoning, and stronger support',
};

export const primaryStudent: StudentRecord = {
  student_id: caseStudyMeta.userId,
  name: caseStudyMeta.studentName,
  email: 'Unavailable in workbook export metadata',
  assignment_views: 108,
  resource_access_count: 19,
  rubric_views: 6,
  time_on_task: 180,
  revision_frequency: 4,
  feedback_views: 4,
  help_seeking_messages: 5,
  word_count: caseStudyMeta.finalWordCount,
  error_density: 2.8,
  cohesion_index: 4,
  cohesion: 3.5,
  ttr: 0.52,
  argumentation: 3.4,
  grammar_accuracy: 3.2,
  lexical_resource: 3.6,
  total_score: 20.6,
  score_gain: 3.4,
  first_access_delay_minutes: 10,
  sample_text:
    'Another major worry is how AI impacts fairness and student relationships. Some students use AI a lot to do their assignments while others do their work on their own, and that can make school unfair.',
  triggered_rule_ids: 'C4; C5; B2',
  interpretations:
    'The learner responds to feedback, but still needs help reading comments at a deeper level.; Feedforward guidance can turn current gains into future drafting habits.; Reasoning is present but still needs deeper explanation and fuller support.',
  feedback_types: 'feedback_decoding; feedforward_guidance; argument_expansion',
  onsite_interventions: 'feedback_to_revision_mapping; next_draft_transfer_prompt; guided_argument_development',
  cluster_label: 3,
  predicted_score: 24.2,
  learner_profile: 'Feedback-responsive developing writer',
  cluster_profile: 'Engaged or strategic writer',
  clustering_output: 'Engaged or strategic writer',
  predicted_improvement: 'Moderate-High',
  random_forest_output: 'Moderate to high improvement predicted if higher-order support continues',
  bayesian_output: 'Feedback uptake = Medium-High; Argument competence = Medium',
  feedback_templates_selected: 'feedback_decoding; feedforward_guidance; argument_expansion',
  final_feedback_focus:
    'Consolidate feedback use and push the learner from partial revision to deeper reasoning and stronger support.',
  teacher_validation_prompt:
    'Teacher validation required: confirm that the main focus should be "Consolidate feedback use and push the learner from partial revision to deeper reasoning and stronger support." before releasing the student-facing message.',
  ai_forethought_state: 'High',
  ai_argument_state: 'Medium',
  ai_cohesion_state: 'Medium',
  ai_revision_state: 'High',
  ai_feedback_state: 'High',
  ai_linguistic_state: 'Medium',
  ai_lexical_state: 'Medium',
  ai_help_state: 'Adaptive',
  profile_rule_id: 'feedback_responsive_developing',
  rule_matches: [
    {
      rule_id: 'C4',
      category: 'Revision',
      priority: 130,
      raw_data_condition: 'feedback viewed repeatedly + revision follows but argument remains developing',
      ai_learner_state_output: 'Feedback uptake risk = High',
      pedagogical_interpretation:
        'The learner uses feedback, but still needs help decoding comments at a deeper level.',
      adaptive_feedback_type: 'Feedback-decoding scaffold',
      feedback_message_focus:
        'Reconnect teacher comments to explicit meaning-level changes in the next revision.',
      theoretical_justification: 'Carless and Boud (2018); Hattie and Timperley (2007)',
      feedback_templates: ['feedback_decoding'],
      feedback_messages: [
        'You viewed the feedback, but your draft does not yet show enough change. Re-read the comments and apply at least one improvement to your ideas and one to your language.',
      ],
      onsite_interventions: ['feedback_to_revision_mapping'],
    },
    {
      rule_id: 'C5',
      category: 'Revision',
      priority: 120,
      raw_data_condition: 'feedback viewed and at least partial revision visible',
      ai_learner_state_output: 'Feedback uptake risk = Medium',
      pedagogical_interpretation:
        'Feedback is being used, but the learner still needs support turning comments into stronger next-draft habits.',
      adaptive_feedback_type: 'Guided feedforward',
      feedback_message_focus:
        'Use the comment trail to deepen reasoning or stabilize form-level improvement in the next revision cycle.',
      theoretical_justification: 'Hattie and Timperley (2007); Carless and Boud (2018)',
      feedback_templates: ['feedforward_guidance'],
      feedback_messages: [
        'You improved some parts of the paragraph. Now use the feedback to deepen your explanation and improve the structure of your ideas.',
      ],
      onsite_interventions: ['next_draft_transfer_prompt'],
    },
    {
      rule_id: 'B2',
      category: 'Writing',
      priority: 100,
      raw_data_condition: 'argumentation moderate + idea present but underdeveloped',
      ai_learner_state_output: 'Argumentation weakness = Medium',
      pedagogical_interpretation:
        'Reasoning is present but still lacks depth, explanation, and full support.',
      adaptive_feedback_type: 'Strategic + metacognitive writing feedback',
      feedback_message_focus:
        'Expand the reasoning after the example so the argument becomes fully persuasive.',
      theoretical_justification: 'Flower and Hayes (1981); Hyland (2019)',
      feedback_templates: ['argument_expansion'],
      feedback_messages: [
        'Your main idea is relevant, but it needs deeper explanation. After giving your example, explain why it proves your point.',
      ],
      onsite_interventions: ['guided_argument_development'],
    },
  ],
  personalized_feedback:
    'You viewed the feedback, but your draft does not yet show enough change. Re-read the comments and apply at least one improvement to your ideas and one to your language. You improved some parts of the paragraph. Now use the feedback to deepen your explanation and improve the structure of your ideas. Your main idea is relevant, but it needs deeper explanation. After giving your example, explain why it proves your point.',
  rf_feature_impacts: [
    { feature: 'revision_frequency', impact: 0.15 },
    { feature: 'feedback_views', impact: 0.12 },
    { feature: 'argumentation', impact: -0.05 },
    { feature: 'time_on_task', impact: 0.08 }
  ],
};

export const sarahMitchell: StudentRecord = {
  student_id: '9264',
  name: 'Sarah Mitchell',
  email: 's.mitchell@student.edu',
  assignment_views: 124,
  resource_access_count: 22,
  rubric_views: 12,
  time_on_task: 210,
  revision_frequency: 5,
  feedback_views: 6,
  help_seeking_messages: 4,
  word_count: 215,
  error_density: 1.2,
  cohesion_index: 6,
  cohesion: 4.8,
  ttr: 0.62,
  argumentation: 4.7,
  grammar_accuracy: 4.8,
  lexical_resource: 4.9,
  total_score: 33.5,
  score_gain: 5.2,
  first_access_delay_minutes: 2,
  sample_text: 'The argument for academic integrity is strengthened when students act as partners in the learning process.',
  triggered_rule_ids: '',
  interpretations: 'Strategic writer demonstrating strong self-regulatory cycles.',
  feedback_types: 'metacognitive_challenge',
  onsite_interventions: 'peer_modeling',
  cluster_label: 3,
  predicted_score: 34.5,
  learner_profile: 'Strategic Writer (High-High)',
  cluster_profile: 'Engaged or strategic writer',
  ai_forethought_state: 'High',
  ai_argument_state: 'High',
  ai_cohesion_state: 'High',
  ai_revision_state: 'High',
  ai_feedback_state: 'High',
  ai_linguistic_state: 'High',
  personalized_feedback: 'You are demonstrating excellent self-regulation. Continue using peer-modeling to refine your advanced argumentative structures.',
  rf_feature_impacts: [
    { feature: 'time_on_task', impact: 0.22 },
    { feature: 'revision_frequency', impact: 0.18 },
    { feature: 'resource_access_count', impact: 0.15 },
    { feature: 'rubric_views', impact: 0.10 }
  ],
};

export const markDavies: StudentRecord = {
  student_id: '9265',
  name: 'Mark Davies',
  email: 'm.davies@student.edu',
  assignment_views: 95,
  resource_access_count: 14,
  rubric_views: 5,
  time_on_task: 190,
  revision_frequency: 6,
  feedback_views: 8,
  help_seeking_messages: 7,
  word_count: 185,
  error_density: 4.5,
  cohesion_index: 2,
  cohesion: 2.1,
  ttr: 0.42,
  argumentation: 2.2,
  grammar_accuracy: 2.4,
  lexical_resource: 2.5,
  total_score: 16.5,
  score_gain: 1.2,
  first_access_delay_minutes: 15,
  sample_text: 'I try to write but it is hard to find the words to explain my evidence properly.',
  triggered_rule_ids: 'B2; C4',
  interpretations: 'Struggling but engaged: high effort without linguistic mastery.',
  feedback_types: 'direct_corrective; structural_scaffold',
  onsite_interventions: 'guided_writing_workshop',
  cluster_label: 2,
  predicted_score: 22.0,
  learner_profile: 'Struggling but Engaged (High-Low)',
  cluster_profile: 'Effortful but struggling writer',
  ai_forethought_state: 'Medium',
  ai_argument_state: 'Low',
  ai_cohesion_state: 'Low',
  ai_revision_state: 'High',
  ai_feedback_state: 'High',
  ai_linguistic_state: 'Low',
  personalized_feedback: 'Your high level of engagement is a great foundation. We will focus on structural scaffolds to help translate your effort into clearer writing patterns.',
  rf_feature_impacts: [
    { feature: 'revision_frequency', impact: 0.20 },
    { feature: 'help_seeking_messages', impact: 0.14 },
    { feature: 'error_density', impact: -0.18 },
    { feature: 'argumentation', impact: -0.12 }
  ],
};

export const elenaRodriguez: StudentRecord = {
  student_id: '9266',
  name: 'Elena Rodriguez',
  email: 'e.rodriguez@student.edu',
  assignment_views: 12,
  resource_access_count: 2,
  rubric_views: 0,
  time_on_task: 45,
  revision_frequency: 1,
  feedback_views: 0,
  help_seeking_messages: 0,
  word_count: 220,
  error_density: 1.5,
  cohesion_index: 4,
  cohesion: 3.8,
  ttr: 0.58,
  argumentation: 4.1,
  grammar_accuracy: 4.2,
  lexical_resource: 4.3,
  total_score: 29.5,
  score_gain: 0.5,
  first_access_delay_minutes: 120,
  sample_text: 'Education systems must evolve to keep up with the demands of the modern workforce.',
  triggered_rule_ids: 'A1',
  interpretations: 'Efficient but passive: high performance without regulatory process.',
  feedback_types: 'metacognitive_prompt',
  onsite_interventions: 'self_regulation_workshop',
  cluster_label: 1,
  predicted_score: 30.0,
  learner_profile: 'Efficient but Passive (Low-High)',
  cluster_profile: 'Efficient but fragile regulator',
  ai_forethought_state: 'Low',
  ai_argument_state: 'High',
  ai_cohesion_state: 'High',
  ai_revision_state: 'Low',
  ai_feedback_state: 'Low',
  ai_linguistic_state: 'High',
  personalized_feedback: 'Your writing is already strong. Let\'s work on increasing your engagement with the feedback cycle to move from passive performance to strategic mastery.',
  rf_feature_impacts: [
    { feature: 'argumentation', impact: 0.18 },
    { feature: 'grammar_accuracy', impact: 0.15 },
    { feature: 'time_on_task', impact: -0.10 },
    { feature: 'feedback_views', impact: -0.08 }
  ],
};

export const jamesWilson: StudentRecord = {
  student_id: '9267',
  name: 'James Wilson',
  email: 'j.wilson@student.edu',
  assignment_views: 4,
  resource_access_count: 1,
  rubric_views: 0,
  time_on_task: 20,
  revision_frequency: 0,
  feedback_views: 0,
  help_seeking_messages: 0,
  word_count: 85,
  error_density: 6.2,
  cohesion_index: 1,
  cohesion: 1.5,
  ttr: 0.35,
  argumentation: 1.8,
  grammar_accuracy: 2.1,
  lexical_resource: 2.2,
  total_score: 11.2,
  score_gain: 0.2,
  first_access_delay_minutes: 360,
  sample_text: 'Writing is difficult and I do not know how to start this paragraph.',
  triggered_rule_ids: 'A1; B2',
  interpretations: 'At-risk writer: critical disengagement and performance gaps.',
  feedback_types: 'direct_corrective; immediate_intervention',
  onsite_interventions: 'one_to_one_scaffolding',
  cluster_label: 0,
  predicted_score: 12.5,
  learner_profile: 'At-Risk Writer (Low-Low)',
  cluster_profile: 'Disengaged / low-participation learner',
  ai_forethought_state: 'Low',
  ai_argument_state: 'Low',
  ai_cohesion_state: 'Low',
  ai_revision_state: 'Low',
  ai_feedback_state: 'Low',
  ai_linguistic_state: 'Low',
  personalized_feedback: 'Critical intervention is required to address both engagement and performance gaps. We will start with a one-to-one scaffolding session.',
  rf_feature_impacts: [
    { feature: 'assignment_views', impact: -0.22 },
    { feature: 'time_on_task', impact: -0.18 },
    { feature: 'error_density', impact: -0.15 },
    { feature: 'revision_frequency', impact: -0.10 }
  ],
};

const rfMetrics: RfMetrics = {
  mae: 0.31,
  r2: 0.68,
};

const rfImportance: FeatureImportance[] = [
  { feature: 'revision_frequency', importance: 0.24 },
  { feature: 'feedback_views', importance: 0.18 },
  { feature: 'argumentation', importance: 0.16 },
  { feature: 'resource_access_count', importance: 0.14 },
  { feature: 'cohesion_index', importance: 0.12 },
  { feature: 'time_on_task', importance: 0.09 },
  { feature: 'help_seeking_messages', importance: 0.07 },
];

const clusterCentroids: ClusterCentroid[] = [
  {
    time_on_task: 75,
    revision_frequency: 1,
    feedback_views: 0,
    rubric_views: 1,
    help_seeking_messages: 0,
    total_score: 10,
    ttr: 0.38,
    cohesion_index: 2,
    word_count: 135,
    cluster_label: 0,
    cluster_profile: 'Disengaged / low-participation learner',
  },
  {
    time_on_task: 115,
    revision_frequency: 2,
    feedback_views: 1,
    rubric_views: 2,
    help_seeking_messages: 1,
    total_score: 22,
    ttr: 0.57,
    cohesion_index: 4,
    word_count: 210,
    cluster_label: 1,
    cluster_profile: 'Efficient but fragile regulator',
  },
  {
    time_on_task: 155,
    revision_frequency: 3,
    feedback_views: 2,
    rubric_views: 4,
    help_seeking_messages: 2,
    total_score: 16,
    ttr: 0.47,
    cohesion_index: 3,
    word_count: 180,
    cluster_label: 2,
    cluster_profile: 'Effortful but struggling writer',
  },
  {
    time_on_task: 180,
    revision_frequency: 4,
    feedback_views: 4,
    rubric_views: 6,
    help_seeking_messages: 5,
    total_score: 21,
    ttr: 0.52,
    cohesion_index: 4,
    word_count: 199,
    cluster_label: 3,
    cluster_profile: 'Engaged or strategic writer',
  },
];

export const diagnosticData: DiagnosticData = {
  students: [primaryStudent, sarahMitchell, markDavies, elenaRodriguez, jamesWilson],
  metrics: {
    rf_metrics: rfMetrics,
    rf_importance: rfImportance,
    cluster_centroids: clusterCentroids,
  },
};

export const students = diagnosticData.students;

const clusterMap: Record<number, ClusterName> = {
  0: 'Disengaged / low-participation learner',
  1: 'Efficient but fragile regulator',
  2: 'Effortful but struggling writer',
  3: 'Engaged or strategic writer',
};


export function getClusterNameFromLabel(label: number): ClusterName {
  return clusterMap[label] ?? 'Engaged or strategic writer';
}

export function getStudentClusterName(student: StudentRecord): ClusterName {
  return student.learner_profile ?? student.cluster_profile ?? getClusterNameFromLabel(student.cluster_label);
}

export function getStudentRiskLevel(student: StudentRecord): 'low' | 'monitor' | 'critical' {
  if (student.total_score < 14 || student.feedback_views === 0) {
    return 'critical';
  }

  if (student.argumentation < 3.8 || student.error_density > 2.4) {
    return 'monitor';
  }

  return 'low';
}

export function getEngagementScore(student: StudentRecord | undefined): number {
  if (!student) return 0;
  const rawScore =
    (student.time_on_task ?? 0) / 3 +
    (student.assignment_views ?? 0) * 0.2 +
    (student.resource_access_count ?? 0) * 1.4 +
    (student.feedback_views ?? 0) * 6 +
    (student.rubric_views ?? 0) * 2 +
    (student.help_seeking_messages ?? 0) * 4;

  return Math.round(clamp(rawScore / 100, 0, 1) * 100);
}

export function getRfMetrics(): RfMetrics {
  return diagnosticData.metrics.rf_metrics;
}

export function getRfImportance(): FeatureImportance[] {
  return diagnosticData.metrics.rf_importance;
}

export function getClusterCentroids(): ClusterCentroid[] {
  return diagnosticData.metrics.cluster_centroids;
}

export interface CohortStats {
  benchmark_ttr: number;
  benchmark_cohesion: number;
}

export function getCohortStats(data: StudentRecord[] = students): CohortStats {
  const source = data.length > 0 ? data : [primaryStudent];
  const totalTtr = source.reduce((sum, student) => sum + student.ttr, 0);
  const totalCohesion = source.reduce((sum, student) => sum + student.cohesion, 0);

  return {
    benchmark_ttr: totalTtr / source.length,
    benchmark_cohesion: totalCohesion / source.length,
  };
}

export interface BayesianBelief {
  argumentation: number;
  cohesion: number;
  linguistic: number;
  regulation: number;
}

export function getBayesianBeliefs(student: StudentRecord): { prior: BayesianBelief; posterior: BayesianBelief } {
  // RESEARCH NOTE: This simulates a simplified Bayesian update where observables shift the prior belief.
  // P(Competence | Evidence) = (P(Evidence | Competence) * P(Competence)) / P(Evidence)
  
  const prior: BayesianBelief = {
    argumentation: 0.35, // Starting theoretical prior for the cohort
    cohesion: 0.30,
    linguistic: 0.40,
    regulation: 0.25,
  };

  // Evidence Weighting Logic (Likelihoods)
  const argEvidence = (student.argumentation / 5) * 0.7 + (student.rubric_views / 10) * 0.3;
  const cohEvidence = (student.cohesion / 5) * 0.6 + (student.cohesion_index / 10) * 0.4;
  const lingEvidence = (student.grammar_accuracy / 5) * 0.5 + (student.ttr) * 0.5;
  const regEvidence = (student.revision_frequency / 10) * 0.4 + (student.feedback_views / 10) * 0.3 + (student.help_seeking_messages / 10) * 0.3;

  const posterior: BayesianBelief = {
    argumentation: clamp(prior.argumentation * 0.4 + argEvidence * 0.6),
    cohesion: clamp(prior.cohesion * 0.4 + cohEvidence * 0.6),
    linguistic: clamp(prior.linguistic * 0.4 + lingEvidence * 0.6),
    regulation: clamp(prior.regulation * 0.4 + regEvidence * 0.6),
  };

  return { prior, posterior };
}

export interface LongitudinalDatum {
  cycle: number;
  cohesion: number;
  ttr: number;
  score: number;
}

export function getLongitudinalData(student: StudentRecord): LongitudinalDatum[] {
  return [
    { cycle: 1, cohesion: 2.7, ttr: 0.44, score: Math.max(0, student.total_score - 7.5) },
    { cycle: 2, cohesion: 3.1, ttr: 0.48, score: Math.max(0, student.total_score - 3.4) },
    { cycle: 3, cohesion: student.cohesion, ttr: student.ttr, score: student.total_score },
  ];
}

export const caseRecentActivity: ActivityItem[] = [
  { time: '14 Mar 2026', action: 'Writing progress reflection submitted on Moodle', icon: 'activity' },
  { time: '07 Mar 2026', action: 'Final body paragraph revision posted after instructor feedback', icon: 'message' },
  { time: '23 Feb 2026', action: 'Teacher requested stronger structure and removal of AI-like sentences', icon: 'alert' },
  { time: '12 Feb 2026', action: 'Introduction file submitted and graded at 10 / 100', icon: 'upload' },
  { time: '10 Feb 2026', action: 'Feedback viewed and revised introduction comment uploaded', icon: 'download' },
];

export const caseScoreJourney = [
  { name: 'Diagnostic', score: 2.4 },
  { name: 'Intro', score: 2.1 },
  { name: 'Body Rev', score: 2.9 },
  { name: 'Final', score: 3.7 },
];

export const teacherStudentDialogue: DialogueMessage[] = [
  {
    date: '10 Feb 2026',
    role: 'teacher',
    sender: caseStudyMeta.instructor,
    topic: 'Feedback correction request',
    message: 'Check the feedback I sent you and correct your introductions please.',
  },
  {
    date: '10 Feb 2026',
    role: 'student',
    sender: caseStudyMeta.studentName,
    topic: 'Asking where feedback is',
    message: 'Excuse me, Miss, could you please tell me where I can find it? I seem to be unable to locate it.',
    intent: 'Procedural Question',
  },
  {
    date: '10 Feb 2026',
    role: 'teacher',
    sender: caseStudyMeta.instructor,
    topic: 'Feedback location clarification',
    message: 'Assignment, add comment. I have just showed Nourhene. Please submit your work to tomorrow\'s session.',
  },
  {
    date: '10 Feb 2026',
    role: 'student',
    sender: caseStudyMeta.studentName,
    topic: 'Clarification on correction method',
    message: 'Where should I correct my mistakes, in the comments section?',
    intent: 'Procedural Question',
  },
  {
    date: '10 Feb 2026',
    role: 'teacher',
    sender: caseStudyMeta.instructor,
    topic: 'Instruction: correct in comment below',
    message: 'Take the feedback I sent you and correct your introduction in the comment below.',
  },
  {
    date: '14 Feb 2026',
    role: 'student',
    sender: caseStudyMeta.studentName,
    topic: 'Request for progress update',
    message: 'Miss, could you please show me my progress so far?',
    intent: 'Conceptual Support',
  },
  {
    date: '7 Mar 2026',
    role: 'student',
    sender: caseStudyMeta.studentName,
    topic: 'Request for feedback and portfolio questions',
    message: 'Hello miss can you send to me my feedback? And also the questions you told us about when I gave you my portfolio.',
    intent: 'Clarification Request',
  },
  {
    date: '10 Mar 2026',
    role: 'student',
    sender: caseStudyMeta.studentName,
    topic: 'Asking for vocabulary advice',
    message:
      'While writing the paragraph, I had difficulty choosing the most appropriate academic vocabulary. Could you please advise me if the wording in this part is appropriate?',
    intent: 'Language Assistance',
  },
  {
    date: '10 Mar 2026',
    role: 'teacher',
    sender: caseStudyMeta.instructor,
    topic: 'Reassurance on vocabulary',
    message: 'It is good, do not worry.',
  },
  {
    date: '11 Mar 2026',
    role: 'student',
    sender: caseStudyMeta.studentName,
    topic: 'Missing second feedback report',
    message: 'Miss I did not receive your second feedback. Can you check please if there is a problem?',
    intent: 'Clarification Request',
  },
  {
    date: '11 Mar 2026',
    role: 'teacher',
    sender: caseStudyMeta.instructor,
    topic: 'Response to missing feedback',
    message: 'Check too.',
  },
];

export const instructorComments: InstructorComment[] = [
  {
    date: '12 Feb 2026',
    assessment: 'Argumentative essay Introduction',
    grade: '10 / 100',
    viewedAt: caseStudyMeta.feedbackViewedAt,
    comment:
      'Artificial intelligence has rapidly become part of everyday university life. Many students now turn to AI tools to support their writing, organize their ideas, and conduct research more efficiently. Because these technologies are easily accessible and simple to use, their presence in academic work continues to expand. This growing use has sparked an ongoing debate within higher education. Some educators and students question whether relying on artificial intelligence weakens essential academic skills or encourages dishonest practices. Others argue that, when used responsibly, AI can serve as a valuable learning aid that supports understanding rather than replacing effort. To this end, artificial intelligence is neither inherently harmful nor automatically beneficial. Its educational value depends on how it is used. When approached critically and ethically, it can enhance learning; when misused, it risks undermining both intellectual development and academic integrity.',
    note: 'Teacher model shared to illustrate a more formal and academic register.',
  },
];

export const rubricCriteria: RubricCriterion[] = [
  {
    criterion: 'Clarity of Expression',
    fail: 'Unclear ideas',
    partial: 'Some ambiguity',
    full: 'Sentences are clear',
    maxPoints: 2,
  },
  {
    criterion: 'Formality of Tone',
    fail: 'Informal language',
    partial: 'Mostly formal, but lapses occur',
    full: 'Consistently formal, academic tone maintained',
    maxPoints: 2,
  },
  {
    criterion: 'Precision of Vocabulary',
    fail: 'Inaccurate word choice',
    partial: 'Some precise vocabulary, but inconsistent',
    full: 'Vocabulary is consistently precise and accurate',
    maxPoints: 2,
  },
  {
    criterion: 'Organization & Cohesion',
    fail: 'Ideas are disorganized, weak transitions',
    partial: 'Some organization',
    full: 'Clear structure and strong transitions',
    maxPoints: 2,
  },
];

export const activitySnapshot = {
  totalEvents: 258,
  activeSessions: 44,
  estimatedActiveMinutes: 179,
  sessionGapRule: '20-minute inactivity gap between logged events',
  clickSignals: [
    {
      label: 'Logged Events',
      value: '258',
      note: 'Every Moodle movement is timestamped to the second in the activity log.',
      accent: 'lav' as const,
    },
    {
      label: 'Assignment Clicks',
      value: '53',
      note: 'Assignment pages opened through "Course module viewed" events.',
      accent: 'teal' as const,
    },
    {
      label: 'Submission Checks',
      value: '53',
      note: 'Repeated status checks show monitoring of task state and deadlines.',
      accent: 'gold' as const,
    },
    {
      label: 'Feedback Views',
      value: '4',
      note: 'Formal Moodle feedback openings recorded after grading and revision stages.',
      accent: 'red' as const,
    },
    {
      label: 'Revision Comments',
      value: '4',
      note: 'Comment-created events document written revision responses to teacher feedback.',
      accent: 'lav' as const,
    },
    {
      label: 'Estimated Active Time',
      value: '179 min',
      note: 'Derived from event gaps rather than a single Moodle timer.',
      accent: 'teal' as const,
    },
  ] satisfies ActivitySignal[],
  highlightedSessions: [
    {
      start: '6 Mar 2026, 9:51:25 PM',
      end: '6 Mar 2026, 10:23:46 PM',
      minutes: 32,
      events: 24,
      focus: 'Second body paragraph final submission plus rubric and model-page consultation.',
    },
    {
      start: '2 Feb 2026, 11:45:15 PM',
      end: '3 Feb 2026, 12:07:21 AM',
      minutes: 22,
      events: 18,
      focus: 'Introduction draft session with upload, submission creation, and workshop access.',
    },
    {
      start: '10 Feb 2026, 7:51:13 PM',
      end: '10 Feb 2026, 8:03:10 PM',
      minutes: 12,
      events: 17,
      focus: 'Feedback-follow-up session with repeated returns to resources and introduction task.',
    },
  ] satisfies ActivitySession[],
  trace: [
    {
      timestamp: '3 Feb 2026, 12:03:19 AM',
      event: 'Introduction draft uploaded',
      context: 'Argumentative Essay - Writing an Effective Introduction',
      detail: 'Online text submission created at 112 words.',
    },
    {
      timestamp: '10 Feb 2026, 9:34:03 PM',
      event: 'Introduction revision comment posted',
      context: 'Introduction draft submission',
      detail: 'Student added revised introduction as a submission comment.',
    },
    {
      timestamp: '15 Feb 2026, 10:50:36 PM',
      event: 'First body paragraph submitted',
      context: 'Argumentative body paragraphs: First paragraph',
      detail: 'Online text submission created at 186 words.',
    },
    {
      timestamp: '16 Feb 2026, 9:36:26 PM',
      event: 'First paragraph revision comment posted',
      context: 'First body paragraph',
      detail: 'Student re-posted the revised paragraph after deleting the earlier comment.',
    },
    {
      timestamp: '16 Feb 2026, 10:48:05 PM',
      event: 'Graded introduction feedback viewed',
      context: 'Argumentative essay Introduction [graded]',
      detail: 'Two feedback-view events were logged within the same minute.',
    },
    {
      timestamp: '23 Feb 2026, 2:08:36 AM',
      event: 'Second body paragraph task reopened',
      context: 'Argumentative Essay: Second Body Paragraph',
      detail: 'Marks the start of the next writing cycle after first-paragraph feedback.',
    },
    {
      timestamp: '6 Mar 2026, 9:52:31 PM',
      event: 'Self-assessment rubric viewed',
      context: 'Second body paragraph preparation',
      detail: 'The rubric page was opened immediately before the final submission sequence.',
    },
    {
      timestamp: '6 Mar 2026, 10:16:37 PM',
      event: 'Second body paragraph final submitted',
      context: 'Argumentative Essay: Second Body Paragraph',
      detail: 'Final online text submission created at 198 words.',
    },
    {
      timestamp: '7 Mar 2026, 11:02:38 PM',
      event: 'Final revision comment posted',
      context: 'Second body paragraph',
      detail: 'Student posted a follow-up revision after teacher feedback requested stronger evidence.',
    },
  ] satisfies ActivityTraceEvent[],
};

export const writingArtifacts: WritingArtifact[] = [
  {
    id: 'intro-draft',
    title: 'Argumentative Essay Intro - Draft',
    date: '3 Feb 2026',
    status: 'draft',
    wordCount: 112,
    text:
      'In recent years, education has changed significantly due to technological advancements. The most discussed topic today is the comparison between online learning and onsite learning. While onsite learning has been the dominant form of education for many decades, online learning has become increasingly popular, especially after recent global changes that affected education systems worldwide. This shift has raised concerns about the effectiveness of online learning compared to traditional classroom learning. Although online learning offers certain advantages, onsite learning remains the better form of education because it promotes direct interaction, better concentration, and stronger academic engagement.',
    teacherComment: 'The problem must be well stated and explained + clear arguments.',
  },
  {
    id: 'intro-revision',
    title: 'Argumentative Essay Intro - Student Revised Comment',
    date: '10 Feb 2026',
    status: 'revision-comment',
    wordCount: 112,
    text:
      'In recent years, education has changed significantly due to rapid technological advancements. One of the most discussed topics today is the comparison between online learning and onsite learning. While onsite learning has been the dominant form of education for many decades, online learning has become increasingly popular, especially after recent global changes that affected education systems worldwide. This shift has raised concerns about the effectiveness of online learning compared to traditional classroom learning. Although online learning offers certain advantages, onsite learning remains the better form of education because it promotes direct interaction, better concentration, and stronger academic engagement.',
    teacherComment: 'Student revised the introduction inside the submission comments after the teacher redirect.',
  },
  {
    id: 'body1-original',
    title: 'First Body Paragraph - Original',
    date: '15 Feb 2026',
    status: 'draft',
    wordCount: 186,
    text:
      "One important concern about using Artificial Intelligence in higher education is that students may start depending on it too much. AI is meant to support learning, but when it becomes the main source for doing assignments, it can slowly weaken important skills like critical thinking and problem solving. When students use AI to write essays or answer difficult questions, they miss the process of thinking deeply, questioning ideas, and building their own arguments. Critical thinking becomes weaker because it grows through practice and effort, not by receiving ready answers. In 2023, UNESCO warned that the uncontrolled use of generative AI in education could affect the development of essential cognitive skills. This is especially serious at the university level, where students are expected to analyze information and form independent opinions. From a critical point of view, although AI makes work faster and easier, too much attachment to it can encourage passive learning and make it harder to distinguish between helpful support and cheating. For this reason, AI should be used as a tool to guide learning, not as a replacement for students' own thinking and effort.",
    teacherComment:
      'Add one sentence explaining how dependence weakens critical thinking; reduce repetition; use cited information more critically.',
  },
  {
    id: 'body1-revision',
    title: 'First Body Paragraph - Student Revision Comment',
    date: '16 Feb 2026',
    status: 'revision-comment',
    wordCount: 186,
    text:
      "One important concern about using Artificial Intelligence in higher education is that students may start leaning on it too much. AI is meant to support learning, but when it becomes the main source for doing assignments, it can slowly weaken important skills like critical thinking and problem solving. When students use AI to write essays or answer difficult questions, they miss the process of thinking deeply, questioning ideas, and building their own arguments. Critical thinking becomes weaker because it grows through practice and effort, not by receiving ready answers. In 2023, UNESCO warned that the uncontrolled use of generative AI in education could affect the development of essential cognitive skills. This is especially serious at the university level, where students are expected to analyze information and form independent opinions. From a critical point of view, although AI makes work faster and easier, too much attachment to it can encourage passive learning and make it harder to distinguish between helpful support and cheating. For this reason, AI should be used as a tool to guide learning, not as a replacement for students' own thinking and effort.",
    teacherComment:
      'Paragraph makes a strong point, but it still needs clearer flow, shorter sentences, more formal language, and removal of AI-like phrasing.',
  },
  {
    id: 'body2-revision',
    title: 'Second Body Paragraph - Student Revision',
    date: '24 Feb 2026',
    status: 'revision-comment',
    wordCount: 200,
    text:
      "The use of intelligence in universities has a serious problem. Artificial intelligence can affect how honest students are when they do their work. Artificial intelligence tools can help students generate ideas or understand concepts. However when students use intelligence tools in the wrong way it becomes hard to know what work is truly the students work and what is not the students work. If students submit assignments that artificial intelligence completed for them this no longer measures the students real knowledge. The grades of the students may not reflect the effort of the students the skills of the students or the true level of understanding of the students. Universities are built on honesty, responsibility and real learning. If these principles are ignored the value of a university education decreases. Some scholars at Harvard University explain that assessments are not about testing information but also about building discipline and personal responsibility. When students rely on intelligence to cheat the students lose important opportunities to develop these qualities and to grow academically. Artificial intelligence can be a problem if the students use it to cheat. In addition if many students misuse intelligence it can create unfairness. Students who follow the rules may feel disadvantaged compared to those students who depend heavily on intelligence tools. This situation can reduce trust between the students. For these reasons universities must establish rules that promote responsible use of artificial intelligence while protecting academic integrity and maintaining high educational standards. Universities need to make sure that artificial intelligence is used in a way that is fair to all the students. Artificial intelligence should be used to help the students learn not to help the students cheat.",
    teacherComment:
      'Improve evidence, add an in-text citation and example, and expand the reasoning before the example.',
  },
  {
    id: 'body2-final',
    title: 'Second Body Paragraph - Final Submission',
    date: '6 Mar 2026',
    status: 'final-submission',
    wordCount: 198,
    text:
      'Another major worry is how AI affects fairness and student relationships at university. Some students use AI heavily in their assignments while others complete the work independently, and this can create a strong sense of unfairness in class. Students who spend time researching, writing, and revising may feel discouraged when others receive similar or better results with much less personal effort. As a result, trust between classmates can weaken and motivation can decline. Over time, this problem may also change how students understand academic success, because good results may seem linked to shortcut tools rather than to effort, responsibility, and genuine skill. For example, when a written task is produced mainly through AI assistance, the final grade may no longer represent the student\'s own reasoning, language control, or persistence. These situations can damage collaboration because students may become less willing to share ideas or support one another. For these reasons, universities should set clear rules for responsible AI use in order to protect fairness, honesty, and meaningful learning.',
    teacherComment:
      'Argument is present, but explanation and development are still limited; strengthen evidence and expand the reasoning before the example.',
  },
];

export const paragraphComparison = {
  beforeId: 'body1-original',
  afterId: 'body2-final',
  metrics: [
    { label: 'Workbook Word Count', before: '186', after: '198', delta: '+12' },
    { label: 'Cohesion Markers', before: '3', after: '7', delta: '+4' },
    { label: 'In-text Citations', before: '0', after: '1', delta: '+1' },
    { label: 'Academic Focus Signals', before: '3', after: '5', delta: '+2' },
    { label: 'Scaled TTR', before: '0.57', after: '0.52', delta: '-0.05' },
  ] satisfies ComparisonMetric[],
  commentary: [
    'The later paragraph shifts from a broad dependence-on-AI argument to a tighter focus on fairness, trust, and peer relationships.',
    'The revised later writing adds explicit evidence and a formal in-text citation, which the earlier paragraph did not yet provide.',
    'Cohesion improves because the final paragraph uses more linking moves such as "Another", "Over time", "For instance", "Also", and "So".',
    'Lexical diversity is slightly flatter, so vocabulary precision remains a target even though argument support becomes stronger.',
  ],
};

export const revisionSequence: RevisionSequenceStep[] = [
  {
    timestamp: '3 Feb 2026, 12:03:19 AM',
    phase: 'Introduction Draft',
    detail: 'The student uploaded the first introduction draft and submitted it in Moodle.',
    kind: 'draft',
  },
  {
    timestamp: '10 Feb 2026, 12:34 PM',
    phase: 'Teacher Feedback',
    detail: 'The teacher requested a clearer problem statement and clearer arguments.',
    kind: 'feedback',
  },
  {
    timestamp: '10 Feb 2026, 9:34:03 PM',
    phase: 'Introduction Revision',
    detail: 'The student revised inside the comment section after asking where feedback should be posted.',
    kind: 'revision',
  },
  {
    timestamp: '15 Feb 2026, 10:50:36 PM',
    phase: 'First Body Paragraph',
    detail: 'The first body paragraph was submitted as a 186-word online text.',
    kind: 'draft',
  },
  {
    timestamp: '16 Feb 2026, 12:48 PM',
    phase: 'Teacher Feedback',
    detail: 'The teacher asked for stronger explanation, less repetition, and more critical use of evidence.',
    kind: 'feedback',
  },
  {
    timestamp: '16 Feb 2026, 9:36:26 PM',
    phase: 'First Paragraph Revision',
    detail: 'The student returned with a revision comment after editing and reposting the paragraph.',
    kind: 'revision',
  },
  {
    timestamp: '23 Feb 2026, 10:02 PM',
    phase: 'Teacher Feedback',
    detail: 'The teacher asked for clearer structure, formal language, shorter sentences, and removal of AI-generated phrasing.',
    kind: 'feedback',
  },
  {
    timestamp: '6 Mar 2026, 9:52:31 PM',
    phase: 'Resource Consultation',
    detail: 'The student viewed the structure page and self-assessment rubric immediately before the final second-body submission.',
    kind: 'resource',
  },
  {
    timestamp: '6 Mar 2026, 10:16:37 PM',
    phase: 'Second Body Paragraph Final',
    detail: 'The final second body paragraph was submitted at 198 words with an academic-integrity confirmation.',
    kind: 'final',
  },
  {
    timestamp: '7 Mar 2026, 4:20 PM / 11:02:38 PM',
    phase: 'Feedback Uptake',
    detail: 'The teacher requested stronger evidence and the student returned a final revision comment later the same day.',
    kind: 'revision',
  },
];

export const privateMessageAnalysis = {
  matchedCount: 5,
  compositeThreshold: 'D1 is triggered because five private messages match the help-seeking threshold used in the study.',
  thresholds: [
    {
      id: 'msg-feedback-location',
      label: 'Feedback Location Clarification',
      threshold: 'Trigger when >= 1 private message asks where feedback or comments should be found or posted.',
      matched: 2,
      evidence: '10 Feb 2026: "Could you please tell me where I can find it?" and "Where should I correct my mistakes, in the comments section?"',
      interpretation: 'The student actively seeks access to the teacher comment space instead of ignoring the task.',
    },
    {
      id: 'msg-progress',
      label: 'Progress Inquiry',
      threshold: 'Trigger when >= 1 private message asks for progress or performance status.',
      matched: 1,
      evidence: '14 Feb 2026: "Miss can you show me my progress?"',
      interpretation: 'The student monitors her standing and asks for evaluative orientation.',
    },
    {
      id: 'msg-vocabulary',
      label: 'Academic Vocabulary Support',
      threshold: 'Trigger when >= 1 private message requests help with academic vocabulary or formal tone.',
      matched: 1,
      evidence: '10 Mar 2026: the student asks whether the wording is formal enough for an academic paragraph.',
      interpretation: 'The message targets higher-order phrasing, not only procedural issues.',
    },
    {
      id: 'msg-feedback-followup',
      label: 'Feedback Follow-up',
      threshold: 'Trigger when >= 1 private message asks for missing, delayed, or inaccessible feedback.',
      matched: 1,
      evidence: '7 Mar 2026: the student asks for feedback again after the drafting cycle continues.',
      interpretation: 'The student treats teacher feedback as something to retrieve and reuse in later drafting.',
    },
  ] satisfies MessageThreshold[],
};

export const asmaaWorkspaceStudent: WorkspaceStudent = {
  id: caseStudyMeta.userId,
  name: caseStudyMeta.studentName,
  archetype: 'engaged-developing',
  risk: 'monitor',
  preScore: 2.1,
  postScore: 3.7,
  gain: 1.6,
  engagement: 0.82,
  drafts: 3,
  feedbackViewed: primaryStudent.feedback_views,
  ruleTriggered: 'B2, D1',
  helpSeeking: primaryStudent.help_seeking_messages,
  lastActive: '14 Mar 2026',
  active: true,
  moodle: {
    assignmentViews: 0.92,
    resourceAccess: 0.8,
    rubricConsultation: 0.72,
    revisionActivity: 0.78,
    feedbackUse: 0.68,
    helpSeeking: 0.74,
    forumParticipation: 0.35,
    taskPersistence: 0.84,
  },
  rubric: [
    { subject: 'Content', A: 72, fullMark: 100 },
    { subject: 'Structure', A: 78, fullMark: 100 },
    { subject: 'Evidence', A: 64, fullMark: 100 },
    { subject: 'Grammar', A: 66, fullMark: 100 },
    { subject: 'Academic Tone', A: 70, fullMark: 100 },
  ],
  nlp: [
    { subject: 'TTR', A: 52 },
    { subject: 'Cohesion', A: 70 },
    { subject: 'Argument', A: 68 },
    { subject: 'Grammar', A: 64 },
    { subject: 'Revision', A: 78 },
  ],
  history: caseScoreJourney,
};

export function getActivityIconName(item: ActivityItem): ActivityItem['icon'] {
  return item.icon;
}
