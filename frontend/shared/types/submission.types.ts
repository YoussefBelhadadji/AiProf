import type { StationBand } from './report.types';

export type SubmissionStatus = 'submitted' | 'draft' | 'graded' | 'notgraded' | string;

export interface AnalysisStation {
  id: string;
  name: string;
  scorePct: number; // 0..100
  band?: StationBand;
  insight: string;
}

export interface StationMetric {
  t: string; // ISO timestamp or label
  value: number; // 0..100
}

export interface Submission {
  id: string; // stable opaque id for routes
  studentId: string;
  studentName: string;
  course: string;
  title: string;
  submittedAt: string; // ISO
  status: SubmissionStatus;
  overallScorePct: number; // 0..100
  aiInsight: string;
  preview?: string;
}

export interface SubmissionDetail extends Submission {
  attemptNumber: number;
  assignmentId: string;
  stageLabel?: string;
  stageTitle?: string;
  wordCount?: number;
  sentenceCount?: number;
  ttr?: number;
  errorDensity?: number;
  fullTextPreview?: string;

  stations: AnalysisStation[];
  stationSeries: Record<string, StationMetric[]>; // by station id
  comparisonBars: Array<{ key: string; label: string; student: number; cohort: number }>;
  logs: Array<{ at: string; scorePct: number; excerpt: string }>;
  recommendations: string[];
  aiExplanation: Record<string, string>; // station id -> long text
}

export interface PortfolioSummary {
  studentId: string;
  studentName: string;
  email?: string;
  course?: string;
  lastActiveAt?: string;

  overallScorePct: number;
  totalSubmissions: number;
  avgImprovementPct: number; // +/- %
  trend: 'improving' | 'stable' | 'declining' | 'insufficient_data' | string;

  metrics: {
    averageScorePct: number;
    strongestStation?: string;
    weakestStation?: string;
    totalEssays: number;
  };

  evolution: StationMetric[];
  stationsAverage: AnalysisStation[];
  recentSubmissions: Submission[];
  strengths: string[];
  growthAreas: string[];
}

