/**
 * WriteLens – Learners Feature: Type Definitions
 * Mirrors the exact JSON structure produced by the AI pipeline (RUN_YYYYMMDD_HHMMSS/).
 * All fields are optional where the pipeline may omit them.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1.  STUDENT LIST  (students/index.json)
// ─────────────────────────────────────────────────────────────────────────────

export type RiskGroup =
  | 'Low Risk - Maintain and enrich'
  | 'Lower Risk - Monitor and coach'
  | 'Moderate Risk - Targeted support needed'
  | 'High Risk - Urgent support needed';

export type CompetenceLevel = 'Beginning' | 'Developing' | 'Advanced';

export type PerformanceLevel = 'Needs Improvement' | 'Good' | 'Strong' | 'Developing';

export type PrimaryIssue =
  | 'PLANNING_ISSUE'
  | 'RUSHED_WRITING'
  | 'DISCOURSE_ORGANIZATION'
  | 'NO_ISSUES';

export type LearnerProfile =
  | 'Strategic Learners - High engagement + good writing'
  | 'Efficient Learners - Low effort, acceptable results'
  | 'Engaged but Weak Writers - Good effort, needs support'
  | 'Disengaged Students - Low participation';

/** One row from students/index.json – lightweight, used for the Learners list */
export interface StudentIndexEntry {
  student_id: string;
  student_name: string;
  email: string;
  learner_profile: LearnerProfile;
  risk_group: RiskGroup;
  competence_level: CompetenceLevel;
  performance_level: PerformanceLevel;
  primary_issue: PrimaryIssue;
  /** Relative path from run root: "students/XXXX_Name/profile.json" */
  profile_path: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2.  STATION CARD  (part of profile.json)
// ─────────────────────────────────────────────────────────────────────────────

export interface StationHighlights {
  // Station 01
  word_count?: number;
  time_on_task?: number;
  revision_frequency?: number;
  // Station 02
  quality_profile?: string;
  word_count_level?: string;
  highest_priority?: string;
  // Station 03
  learner_profile?: string;
  primary_issue?: string;
  root_cause_count?: number;
  // Station 04
  performance_level?: string;
  predicted_improvement_state?: string;
  predicted_performance_score?: number;
  // Station 05
  competence_level?: string;
  avg_competence?: number;
  competence_probability_state?: string;
  // Station 06
  risk_group?: string;
  problem_group?: string;
  instructional_group?: string;
  // Station 07
  highest_priority_07?: string;
  // Station 08
  primary_issue_08?: string;
  // Station 09
  student_has_feedback?: boolean;
  student_has_prediction?: boolean;
  student_has_group_assignment?: boolean;
  [key: string]: unknown;
}

export interface StationCard {
  station_id: string;
  title: string;
  order: number;
  status: 'ready' | 'pending' | 'error';
  highlights: StationHighlights;
  /** Relative path from run root */
  detail_path: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3.  STUDENT PROFILE  (students/XXXX_Name/profile.json)
// ─────────────────────────────────────────────────────────────────────────────

export interface StudentSummary {
  learner_profile: LearnerProfile;
  risk_group: RiskGroup;
  instructional_group: string;
  problem_group: string;
  quality_profile: 'poor' | 'satisfactory' | 'good' | 'excellent';
  competence_level: CompetenceLevel;
  performance_level: PerformanceLevel;
  primary_issue: PrimaryIssue;
  root_causes: string[];
  recommendations: string[];
}

export interface StudentProfile {
  student: {
    student_id: string;
    student_name: string;
    email: string;
  };
  summary: StudentSummary;
  station_cards: StationCard[];
  routes: {
    profile_path: string;
    stations_base_path: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4.  STATION DETAIL  (students/XXXX/stations/station_XX.json)
// ─────────────────────────────────────────────────────────────────────────────

/** Station 01 – raw behavioral metrics */
export interface Station01Metrics {
  assignment_views: number;
  resource_access_count: number;
  time_on_task: number;
  revision_frequency: number;
  feedback_views: number;
  rubric_views: number;
  help_seeking_messages: number;
  message_interactions_count: number;
  word_count: number;
  error_density: number;
  cohesion_index: number;
  ttr: number;
}

/** Station 02 – thresholds */
export interface Station02Metrics {
  word_count_level: string;
  error_density_level: string;
  quality_profile: string;
  highest_priority: string;
  all_triggered_rule_ids: string;
}

/** Station 03 – clustering */
export interface Station03Metrics {
  learner_profile: string;
  root_cause_count: number;
  primary_issue: string;
  overall_engagement: number;
  planning_index: number;
  discourse_quality: number;
  argumentation_strength: number;
  feedback_receptiveness: number;
}

/** Station 04 – prediction */
export interface Station04Metrics {
  predicted_score_gain_proxy: number;
  predicted_performance_score: number;
  performance_level: string;
  predicted_improvement_state: string;
  model_metrics: {
    target_used: string;
    target_is_proxy: boolean;
    r2: number;
    mae: number;
    rmse: number;
  };
}

/** Station 05 – Bayesian competence */
export interface Station05Metrics {
  argument_competence: number;
  cohesion_competence: number;
  linguistic_competence: number;
  self_regulation_competence: number;
  avg_competence: number;
  competence_level: string;
  competence_probability_state: string;
}

/** Station 07 – teacher actions */
export interface Station07Metrics {
  highest_priority: string;
  competence_level: string;
  performance_level: string;
  group_intervention_focus: string;
  all_triggered_rule_ids: string;
  triggered_rules: string[];
}

/** Station 08 – student feedback */
export interface Station08Metrics {
  primary_issue: string;
  adaptive_feedback: string;
  root_causes: string[];
  recommendations: string[];
  help_seeking_category_counts: Record<string, number>;
  help_seeking_examples: string[];
}

/** Generic station detail – union of all possible metric shapes */
export type StationMetrics =
  | Station01Metrics
  | Station02Metrics
  | Station03Metrics
  | Station04Metrics
  | Station05Metrics
  | Station07Metrics
  | Station08Metrics
  | Record<string, unknown>;

export interface StationDetail {
  station: {
    id: string;
    title: string;
    description: string;
    order: number;
  };
  student: {
    student_id: string;
    student_name: string;
  };
  metrics: StationMetrics;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5.  DERIVED UI TYPES  (computed from raw data for display)
// ─────────────────────────────────────────────────────────────────────────────

/** Enriched student row for the learners table/grid */
export interface LearnerRow extends StudentIndexEntry {
  /** 0–100 derived composite score */
  overallScore: number;
  /** Risk severity 1–4 for sorting/coloring */
  riskSeverity: 1 | 2 | 3 | 4;
  /** Initials for avatar fallback */
  initials: string;
  /** Friendly course label derived from email domain */
  courseLabel: string;
}

/** Station card enriched with derived score and visual metadata */
export interface EnrichedStationCard extends StationCard {
  score: number;           // 0–100 derived
  icon: string;            // lucide icon name
  colorClass: string;      // Tailwind color token
  bgClass: string;
  insight: string;         // short one-line insight for card body
}

// ─────────────────────────────────────────────────────────────────────────────
// 6.  STORE STATE
// ─────────────────────────────────────────────────────────────────────────────

export interface LearnerStoreState {
  // List
  studentIndex: StudentIndexEntry[];
  isLoadingIndex: boolean;
  indexError: string | null;

  // Profile
  selectedStudentId: string | null;
  profileCache: Record<string, StudentProfile>;
  isLoadingProfile: boolean;
  profileError: string | null;

  // Station detail
  selectedStationId: string | null;
  stationDetailCache: Record<string, StationDetail>;
  isLoadingStation: boolean;
  stationError: string | null;

  // Actions
  loadIndex: () => Promise<void>;
  selectStudent: (id: string) => void;
  loadProfile: (profilePath: string, studentId: string) => Promise<void>;
  selectStation: (stationId: string | null) => void;
  loadStationDetail: (detailPath: string, cacheKey: string) => Promise<void>;
}
