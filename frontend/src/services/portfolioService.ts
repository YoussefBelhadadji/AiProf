import type { PortfolioSummary, Submission, AnalysisStation } from '../../../shared/types';
import { fetchLocalJourneyJson } from './localJourneyData';
import { makeSubmissionId } from './submissionService';

type JourneyFull = {
  student: { student_id: string; student_name: string; portfolio_slug: string };
  overview: {
    submissions_total: number;
    lessons_covered: number;
    non_empty_submissions: number;
    graded_submissions: number;
    first_submission_at: string | null;
    last_submission_at: string | null;
  };
  portfolio_score: { portfolio_score: number };
  narrative: { progress_interpretation: { trend: string; quality_delta: number } };
  ai_analysis: {
    skill_domain_diagnosis: Record<string, { score: number; band?: string }>;
    strengths?: Array<{ title: string; impact?: string }>;
    priority_needs?: Array<{ focus: string }>;
  };
  timeline: Array<{
    assignment_name: string;
    assignment_id: string;
    assignment_section: string;
    attempt_number: number;
    status: string;
    grading_status: string;
    time_created_at: string;
    time_modified_at: string;
    has_text: boolean;
    quality_score: number;
    text_preview: string;
  }>;
};

function pctFromQuality(q: number) {
  return Math.round(Math.max(0, Math.min(1, Number.isFinite(q) ? q : 0)) * 100);
}

function mapStations(ai: JourneyFull['ai_analysis']): AnalysisStation[] {
  const d = ai.skill_domain_diagnosis || {};
  const entries: Array<[string, string]> = [
    ['organization', 'Text Structure'],
    ['lexical_resource', 'Vocabulary'],
    ['argumentation', 'Coherence'],
    ['grammar_accuracy', 'Grammar'],
    ['overall_writing_quality', 'Readability'],
    ['self_regulation', 'Argument Strength'],
    ['engagement', 'Engagement'],
  ];
  return entries.map(([k, name]) => {
    const v = d[k]?.score ?? 0.6;
    const scorePct = Math.round(Math.max(0, Math.min(1, v)) * 100);
    const band = d[k]?.band;
    const insight =
      scorePct >= 85 ? 'Excellent — keep extending.' :
      scorePct >= 70 ? 'Strong — refine consistency.' :
      scorePct >= 55 ? 'Developing — targeted practice helps.' :
      'Needs support — scaffold and model.';
    return { id: k, name, scorePct, band, insight };
  });
}

export async function getPortfolioSummary(studentId: string): Promise<PortfolioSummary> {
  try {
    const byId = await fetchLocalJourneyJson<Record<string, { journey_path: string; student_name: string }>>('students/index_by_id.json');
    const entry = byId[studentId];
    if (!entry) throw new Error('student-not-found');
    const parts = String(entry.journey_path || '').split('/');
    const slug = parts[parts.length - 2] || entry.student_name.replace(/\s+/g, '_');

    const journey = await fetchLocalJourneyJson<JourneyFull>(`students/${slug}/journey_full.json`);
    const stations = mapStations(journey.ai_analysis);
    const strongest = stations.slice().sort((a, b) => b.scorePct - a.scorePct)[0];
    const weakest = stations.slice().sort((a, b) => a.scorePct - b.scorePct)[0];

    const evolution = journey.timeline
      .filter((t) => t.has_text)
      .slice()
      .sort((a, b) => (a.time_modified_at < b.time_modified_at ? -1 : 1))
      .map((t) => ({ t: t.time_modified_at || t.time_created_at, value: pctFromQuality(t.quality_score) }));

    const recentSubmissions: Submission[] = journey.timeline
      .slice()
      .sort((a, b) => (a.time_modified_at < b.time_modified_at ? 1 : -1))
      .slice(0, 5)
      .map((t) => ({
        id: makeSubmissionId(journey.student.student_id, t.assignment_id, t.attempt_number),
        studentId: journey.student.student_id,
        studentName: journey.student.student_name,
        course: t.assignment_section || 'Course',
        title: t.assignment_name || 'Submission',
        submittedAt: t.time_modified_at || t.time_created_at,
        status: t.grading_status === 'graded' ? 'graded' : t.status,
        overallScorePct: pctFromQuality(t.quality_score),
        aiInsight: t.has_text ? 'See station cards for targeted insights.' : 'No text content detected.',
        preview: t.text_preview,
      }));

    const avg = evolution.length
      ? Math.round(evolution.reduce((a, p) => a + p.value, 0) / evolution.length)
      : 0;

    const deltaPct = Math.round((journey.narrative?.progress_interpretation?.quality_delta ?? 0) * 100);

    return {
      studentId: journey.student.student_id,
      studentName: journey.student.student_name,
      course: journey.timeline?.[0]?.assignment_section || 'Academic Writing',
      lastActiveAt: journey.overview.last_submission_at ?? undefined,
      overallScorePct: Math.round(journey.portfolio_score?.portfolio_score ?? avg),
      totalSubmissions: journey.overview.submissions_total ?? recentSubmissions.length,
      avgImprovementPct: deltaPct,
      trend: journey.narrative?.progress_interpretation?.trend ?? 'insufficient_data',
      metrics: {
        averageScorePct: avg,
        strongestStation: strongest?.name,
        weakestStation: weakest?.name,
        totalEssays: journey.overview.non_empty_submissions ?? 0,
      },
      evolution,
      stationsAverage: stations,
      recentSubmissions,
      strengths: (journey.ai_analysis.strengths ?? []).map((s) => s.title).slice(0, 4),
      growthAreas: (journey.ai_analysis.priority_needs ?? []).map((n) => n.focus).slice(0, 4),
    };
  } catch (e) {
    console.warn('[portfolioService] Falling back to mock summary:', e);
    return MOCK_PORTFOLIO(studentId);
  }
}

export async function listPortfolioStudents(): Promise<Array<{ id: string; name: string }>> {
  try {
    const index = await fetchLocalJourneyJson<Array<{ student_id: string; student_name: string }>>('students/index.json');
    return index.map((s) => ({ id: s.student_id, name: s.student_name }));
  } catch {
    return [
      { id: 'T001', name: 'Nour Belabbes' },
      { id: 'T002', name: 'Ikram Boulenouar' },
    ];
  }
}

const MOCK_PORTFOLIO = (studentId: string): PortfolioSummary => ({
  studentId,
  studentName: 'Nour Belabbes',
  course: 'Academic Writing',
  lastActiveAt: '2026-03-14T15:59:34+00:00',
  overallScorePct: 78,
  totalSubmissions: 14,
  avgImprovementPct: 12,
  trend: 'improving',
  metrics: {
    averageScorePct: 74,
    strongestStation: 'Vocabulary',
    weakestStation: 'Coherence',
    totalEssays: 10,
  },
  evolution: [
    { t: 'W1', value: 61 },
    { t: 'W2', value: 66 },
    { t: 'W3', value: 70 },
    { t: 'W4', value: 78 },
  ],
  stationsAverage: [
    { id: 'organization', name: 'Text Structure', scorePct: 74, insight: 'Refine topic sentences.' },
    { id: 'lexical_resource', name: 'Vocabulary', scorePct: 81, insight: 'Strong lexical range.' },
    { id: 'argumentation', name: 'Coherence', scorePct: 69, insight: 'Improve linking.' },
    { id: 'grammar_accuracy', name: 'Grammar', scorePct: 77, insight: 'Minor agreement issues.' },
  ],
  recentSubmissions: [],
  strengths: ['High overall writing quality', 'Strong feedback uptake'],
  growthAreas: ['Revision depth across lessons', 'Evidence-to-claim alignment'],
});

