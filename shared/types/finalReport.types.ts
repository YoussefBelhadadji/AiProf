export type ReportStatus = 'ready' | 'draft' | 'needs_review';

export interface ReportStationSummary {
  id: string;
  name: string;
  avgScorePct: number;
  band?: string;
  trend: 'improving' | 'stable' | 'declining';
  insight: string;
  color: string;
}

export interface ScorePoint {
  t: string;      // ISO timestamp or label (e.g. "W1")
  value: number;  // 0–100
}

export interface FinalReport {
  studentId: string;
  studentName: string;
  email: string;
  course: string;
  period: string;               // e.g. "Feb 2026 – Mar 2026"
  totalSubmissions: number;
  overallScorePct: number;      // 0–100
  improvementPct: number;       // signed delta, e.g. +12 or -3
  trend: 'improving' | 'stable' | 'declining' | 'insufficient_data';
  status: ReportStatus;
  lastUpdatedAt: string;        // ISO
  stationsSummary: ReportStationSummary[];
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  evolution: ScorePoint[];      // chronological score history
  teacherComments: string;      // AI-generated default; teacher-editable
  overallConclusion: string;    // AI-generated default; teacher-editable
  generatedAt: string;          // ISO
}
