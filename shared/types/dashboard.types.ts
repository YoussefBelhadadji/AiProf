// ── Dashboard types ────────────────────────────────────────────────────────────

export interface TrendPoint {
  /** Short month label, e.g. "Nov", "Feb" */
  month: string;
  /** ISO month key for sorting, e.g. "2025-11" */
  monthKey: string;
  /** Cohort avg writing quality score 0–100 */
  avgScore: number;
  /** Number of submissions contributing to this average */
  submissionCount: number;
}

export interface RecentSubmission {
  studentId: string;
  studentName: string;
  assignmentName: string;
  /** ISO date string */
  submittedAt: string;
  /** Writing quality score 0–100 */
  qualityScore: number;
  /** Moodle stage, e.g. "body_development" */
  stageLabel: string;
}

export interface ProgressTrends {
  improving: number;
  stable: number;
  declining: number;
  insufficient_data: number;
}

export interface DashboardStats {
  /** Total enrolled students */
  totalStudents: number;
  /** Students who submitted at least once */
  studentsWithSubmissions: number;
  /** Participation rate 0–100 */
  participationRate: number;
  /** Total submission events */
  totalSubmissions: number;
  /** Cohort average portfolio score 0–100 */
  avgWritingScore: number;
  /** Students flagged as High Risk */
  interventionCount: number;
  /** Signed avg quality delta × 100, e.g. +1.2 means +1.2% */
  avgImprovementPct: number;
  /** Submissions in the last 30 days */
  recentSubmissionsCount: number;
  /** Per-trend student counts */
  progressTrends: ProgressTrends;
  /** Monthly quality trend for the area chart */
  trendChart: TrendPoint[];
  /** Latest non-empty submissions for the table */
  recentSubmissions: RecentSubmission[];
  /** ISO timestamp of when the stats were computed */
  generatedAt: string;
}
