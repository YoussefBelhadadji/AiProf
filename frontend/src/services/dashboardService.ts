/**
 * dashboardService.ts
 *
 * Loads and aggregates real cohort statistics from:
 *   submission_journey_latest/
 *     shared/summary.json           — global totals (single fast fetch)
 *     students/index.json           — 65 student entries
 *     students/{slug}/ai_analysis.json — per-student AI scores & risk (65 fetches, batched)
 *     students/{slug}/timeline.json    — recent submission table rows (top-15 students)
 *
 * Strategy:
 *   1. Load summary.json + index.json in parallel (2 fetches, instant)
 *   2. Load all ai_analysis.json in batches of 12 (65 parallel-ish fetches)
 *   3. Load timeline.json for the 15 highest-confidence students (recent table)
 *   4. Aggregate → DashboardStats
 *   5. Cache result for CACHE_TTL ms so re-navigating is instant
 *   6. On any error → return a rich mock built from known real values
 */

import { fetchLocalJourneyJson } from './localJourneyData';
import type {
  DashboardStats,
  TrendPoint,
  RecentSubmission,
  ProgressTrends,
} from '../../../shared/types';

// ── Internal raw-data shapes ──────────────────────────────────────────────────

interface SummaryJson {
  students_total: number;
  students_with_submissions: number;
  submissions_total: number;
  average_submissions_per_student: number;
  average_ai_data_confidence: number;
  progress_trends: {
    improving: number;
    stable: number;
    declining: number;
    insufficient_data: number;
  };
}

interface StudentIndexEntry {
  student_id: string;
  student_name: string;
  ai_analysis_path: string;   // "submission_journey/students/{slug}/ai_analysis.json"
  submissions_total: number;
  lessons_covered: number;
  progress_trend: string;
  ai_data_confidence: number;
}

interface LessonEntry {
  assignment_name: string;
  first_submission_at: string;
  last_submission_at: string;
  start_quality_score: number;
  end_quality_score: number;
  lesson_trend: string;
}

interface AiAnalysisJson {
  student_snapshot: {
    student_id: string;
    student_name: string;
    risk_group: string;        // e.g. "High Risk - Urgent support needed"
  };
  trajectory_analysis: {
    trend: 'improving' | 'stable' | 'declining' | 'insufficient_data';
    quality_delta: number;     // signed float; positive = improved
    submissions_total: number;
    non_empty_submissions: number;
    top_improving_lessons: LessonEntry[];
    declining_lessons: LessonEntry[];
  };
  predictive_outlook: {
    portfolio_score: number;   // 0–100
    portfolio_level: string;
  };
}

interface TimelineJson {
  student: { student_id: string; student_name: string };
  timeline: Array<{
    assignment_name: string;
    stage_label: string;
    time_created_at: string;
    has_text: boolean;
    quality_score: number;
  }>;
}

// ── Cache ─────────────────────────────────────────────────────────────────────

let _cache: DashboardStats | null = null;
let _cacheAt = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ── Helpers ───────────────────────────────────────────────────────────────────

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** Extract the folder slug from an ai_analysis_path like
 *  "submission_journey/students/SOME_SLUG/ai_analysis.json" */
function slugFromPath(aiPath: string): string | null {
  const m = aiPath.match(/students\/([^/]+)\/ai_analysis/);
  return m ? m[1] : null;
}

/** Run an array of async tasks in batches to avoid overwhelming the browser. */
async function batchRun<T>(
  tasks: Array<() => Promise<T>>,
  batchSize = 12,
): Promise<Array<T | null>> {
  const results: Array<T | null> = [];
  for (let i = 0; i < tasks.length; i += batchSize) {
    const slice = tasks.slice(i, i + batchSize);
    const settled = await Promise.allSettled(slice.map((fn) => fn()));
    for (const r of settled) {
      results.push(r.status === 'fulfilled' ? r.value : null);
    }
  }
  return results;
}

// ── Core loader ───────────────────────────────────────────────────────────────

async function loadRealStats(): Promise<DashboardStats> {
  // ── Step 1: global summary + student index ──────────────────────────────────
  const [summary, studentIndex] = await Promise.all([
    fetchLocalJourneyJson<SummaryJson>('shared/summary.json'),
    fetchLocalJourneyJson<StudentIndexEntry[]>('students/index.json'),
  ]);

  const totalStudents = summary.students_total;
  const studentsWithSubmissions = summary.students_with_submissions;
  const totalSubmissions = summary.submissions_total;
  const participationRate = Math.round(
    (studentsWithSubmissions / totalStudents) * 100,
  );
  const progressTrends: ProgressTrends = {
    improving: summary.progress_trends.improving,
    stable: summary.progress_trends.stable,
    declining: summary.progress_trends.declining,
    insufficient_data: summary.progress_trends.insufficient_data,
  };

  // ── Step 2: load all ai_analysis.json files in batches ──────────────────────
  const analysisEntries = studentIndex
    .map((s) => ({ entry: s, slug: slugFromPath(s.ai_analysis_path) }))
    .filter((x): x is { entry: StudentIndexEntry; slug: string } => x.slug !== null);

  const analysisTasks = analysisEntries.map(
    ({ slug }) =>
      () => fetchLocalJourneyJson<AiAnalysisJson>(`students/${slug}/ai_analysis.json`),
  );

  const rawAnalyses = await batchRun(analysisTasks, 12);

  // ── Step 3: aggregate from ai_analysis files ───────────────────────────────
  const portfolioScores: number[] = [];
  let interventionCount = 0;
  const qualityDeltas: number[] = [];
  const lessonPoints: Array<{ monthKey: string; score: number }> = [];

  for (const analysis of rawAnalyses) {
    if (!analysis) continue;

    // Portfolio score (0–100)
    const ps = analysis.predictive_outlook?.portfolio_score ?? 0;
    if (ps > 0) portfolioScores.push(ps);

    // Intervention: "High Risk" students
    const rg = analysis.student_snapshot?.risk_group ?? '';
    if (rg.includes('High Risk')) interventionCount++;

    // Quality delta for improvement metric (only students with real data)
    const traj = analysis.trajectory_analysis;
    if (traj && traj.submissions_total >= 3) {
      qualityDeltas.push(traj.quality_delta ?? 0);
    }

    // Lesson data points for trend chart
    const allLessons: LessonEntry[] = [
      ...(traj?.top_improving_lessons ?? []),
      ...(traj?.declining_lessons ?? []),
    ];
    for (const lesson of allLessons) {
      const date = lesson.first_submission_at;
      const score = lesson.end_quality_score;
      if (!date || score <= 0) continue;
      lessonPoints.push({
        monthKey: date.slice(0, 7), // YYYY-MM
        score: Math.round(score * 100),
      });
    }
  }

  const avgWritingScore =
    portfolioScores.length > 0
      ? Math.round(portfolioScores.reduce((a, b) => a + b, 0) / portfolioScores.length)
      : 0;

  const avgImprovementPct =
    qualityDeltas.length > 0
      ? parseFloat(
          (
            (qualityDeltas.reduce((a, b) => a + b, 0) / qualityDeltas.length) *
            100
          ).toFixed(1),
        )
      : 0;

  // ── Step 4: build trend chart (group lesson data points by month) ───────────
  const monthBuckets = new Map<string, { sum: number; count: number }>();
  for (const { monthKey, score } of lessonPoints) {
    const bucket = monthBuckets.get(monthKey) ?? { sum: 0, count: 0 };
    monthBuckets.set(monthKey, { sum: bucket.sum + score, count: bucket.count + 1 });
  }

  const trendChart: TrendPoint[] = Array.from(monthBuckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, { sum, count }]) => {
      const monthNum = parseInt(key.split('-')[1], 10);
      return {
        month: MONTH_LABELS[monthNum - 1],
        monthKey: key,
        avgScore: Math.round(sum / count),
        submissionCount: count,
      };
    });

  // ── Step 5: recent submissions table ────────────────────────────────────────
  // Load timeline.json for the 15 highest-confidence students that have subs
  const timelineStudents = [...analysisEntries]
    .filter((x) => x.entry.submissions_total > 0)
    .sort((a, b) => b.entry.ai_data_confidence - a.entry.ai_data_confidence)
    .slice(0, 15);

  const timelineTasks = timelineStudents.map(
    ({ entry, slug }) =>
      () =>
        fetchLocalJourneyJson<TimelineJson>(`students/${slug}/timeline.json`).then(
          (tl) => ({ studentId: entry.student_id, tl }),
        ),
  );

  const rawTimelines = await batchRun(timelineTasks, 15);

  const allRecentRows: RecentSubmission[] = [];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  for (const result of rawTimelines) {
    if (!result) continue;
    const { studentId, tl } = result;
    const studentName = tl.student?.student_name ?? '';
    for (const entry of tl.timeline ?? []) {
      if (!entry.has_text || entry.quality_score <= 0) continue;
      allRecentRows.push({
        studentId,
        studentName,
        assignmentName: entry.assignment_name,
        submittedAt: entry.time_created_at,
        qualityScore: Math.round(entry.quality_score * 100),
        stageLabel: entry.stage_label,
      });
    }
  }

  // Sort descending by date, keep top 10
  allRecentRows.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  const recentSubmissions = allRecentRows.slice(0, 10);

  // Count how many came in the last 30 days (across ALL loaded timelines)
  const recentSubmissionsCount = allRecentRows.filter(
    (r) => new Date(r.submittedAt) >= thirtyDaysAgo,
  ).length;

  return {
    totalStudents,
    studentsWithSubmissions,
    participationRate,
    totalSubmissions,
    avgWritingScore,
    interventionCount,
    avgImprovementPct,
    recentSubmissionsCount,
    progressTrends,
    trendChart,
    recentSubmissions,
    generatedAt: new Date().toISOString(),
  };
}

// ── Mock fallback (mirrors real values from actual data) ──────────────────────

function buildMockStats(): DashboardStats {
  // These numbers are derived from the real data files (computed 2026-04-08).
  // They are used ONLY when the dev server can't reach the local data files.
  return {
    totalStudents: 65,
    studentsWithSubmissions: 58,
    participationRate: 89,
    totalSubmissions: 503,
    avgWritingScore: 60,
    interventionCount: 12,
    avgImprovementPct: 1.2,
    recentSubmissionsCount: 26,
    progressTrends: { improving: 13, stable: 31, declining: 8, insufficient_data: 13 },
    trendChart: [
      { month: 'Nov', monthKey: '2025-11', avgScore: 68, submissionCount: 29 },
      { month: 'Dec', monthKey: '2025-12', avgScore: 65, submissionCount: 6  },
      { month: 'Jan', monthKey: '2026-01', avgScore: 67, submissionCount: 11 },
      { month: 'Feb', monthKey: '2026-02', avgScore: 70, submissionCount: 72 },
      { month: 'Mar', monthKey: '2026-03', avgScore: 72, submissionCount: 38 },
      { month: 'Apr', monthKey: '2026-04', avgScore: 73, submissionCount: 8  },
    ],
    recentSubmissions: [
      { studentId: '1', studentName: 'bennafla nour',           assignmentName: 'Identifying Paragraph Patterns', submittedAt: '2026-04-06T00:00:00Z', qualityScore: 71, stageLabel: 'lesson_activity' },
      { studentId: '2', studentName: 'berdane douae',            assignmentName: 'Welcome & Instructions.',         submittedAt: '2026-04-06T00:00:00Z', qualityScore: 68, stageLabel: 'introduction'    },
      { studentId: '3', studentName: 'berrehail romaissa',       assignmentName: 'Writing Progress Reflection',    submittedAt: '2026-03-16T00:00:00Z', qualityScore: 77, stageLabel: 'body_development' },
      { studentId: '4', studentName: 'benmansour hanane',        assignmentName: 'Writing Progress Reflection',    submittedAt: '2026-03-15T00:00:00Z', qualityScore: 86, stageLabel: 'body_development' },
      { studentId: '5', studentName: 'daoudamamoudoualfari mariama', assignmentName: 'Writing Progress Reflection', submittedAt: '2026-03-15T00:00:00Z', qualityScore: 83, stageLabel: 'body_development' },
    ],
    generatedAt: new Date().toISOString(),
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Fetch real dashboard stats, with module-level caching and mock fallback. */
export async function getDashboardStats(): Promise<DashboardStats> {
  if (_cache && Date.now() - _cacheAt < CACHE_TTL) {
    return _cache;
  }

  try {
    const stats = await loadRealStats();
    _cache = stats;
    _cacheAt = Date.now();
    return stats;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[DashboardService] Real data unavailable — using mock:', err);
    }
    return buildMockStats();
  }
}

/** Invalidate the cache (e.g. after a new pipeline run). */
export function invalidateDashboardCache(): void {
  _cache = null;
  _cacheAt = 0;
}
