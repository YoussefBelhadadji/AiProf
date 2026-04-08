import type {
  FinalReport,
  ReportStationSummary,
  ReportStatus,
  PortfolioSummary,
} from '../../../shared/types';
import { listStudentSummaries } from './submissionService';
import { getPortfolioSummary } from './portfolioService';

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATION_COLORS: Record<string, string> = {
  organization: '#3B82F6',
  lexical_resource: '#10B981',
  argumentation: '#8B5CF6',
  grammar_accuracy: '#F97316',
  overall_writing_quality: '#06B6D4',
  self_regulation: '#F59E0B',
  engagement: '#EF4444',
};

function nameToEmail(name: string): string {
  const parts = name.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean);
  return `${parts.join('.')}@university.edu`;
}

function toTitleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatPeriod(first?: string | null, last?: string | null): string {
  if (!first && !last) return 'N/A';
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  if (!first) return fmt(last!);
  if (!last) return fmt(first);
  const f = fmt(first);
  const l = fmt(last);
  return f === l ? f : `${f} – ${l}`;
}

function deriveStatus(overallScore: number, totalWithText: number): ReportStatus {
  if (totalWithText === 0) return 'needs_review';
  if (overallScore >= 70) return 'ready';
  if (overallScore >= 50) return 'draft';
  return 'needs_review';
}

// ── AI Text Generators ────────────────────────────────────────────────────────

function generateTeacherComments(portfolio: PortfolioSummary): string {
  const firstName = toTitleCase(portfolio.studentName.trim().split(/\s+/)[0]);
  const score = portfolio.overallScorePct;
  const trend = portfolio.trend;
  const strongest = portfolio.metrics.strongestStation ?? 'Vocabulary';
  const weakest = portfolio.metrics.weakestStation ?? 'Coherence';
  const totalEssays = portfolio.metrics.totalEssays;

  const trendNote =
    trend === 'improving'
      ? 'demonstrated consistent improvement throughout the term'
      : trend === 'declining'
      ? 'shown a concerning decline in recent submissions that warrants prompt attention'
      : 'maintained relatively stable performance throughout the term';

  const performanceNote =
    score >= 80
      ? 'an excellent standard of academic writing'
      : score >= 70
      ? 'a solid command of core academic writing skills'
      : score >= 60
      ? 'a developing level of academic writing competence'
      : 'foundational writing skills that require further development';

  const essayNote =
    totalEssays > 0
      ? `Of ${portfolio.totalSubmissions} total submissions, ${totalEssays} contained substantive written content.`
      : `The student completed ${portfolio.totalSubmissions} submission${portfolio.totalSubmissions !== 1 ? 's' : ''} during the assessment period.`;

  const forwardNote =
    score >= 75
      ? `${firstName} is well-prepared to tackle more advanced academic writing challenges in future modules.`
      : score >= 60
      ? `With continued guided practice and structured feedback, ${firstName} is expected to make further gains in the coming term.`
      : `A personalized support plan focusing on foundational writing structures is strongly recommended for ${firstName}.`;

  return [
    `${firstName} has ${trendNote}, demonstrating ${performanceNote} with an overall score of ${score}%.`,
    `Their strongest performance area is ${strongest}, which shows clear mastery and consistent quality across submissions.`,
    `However, ${weakest} remains the primary area requiring targeted intervention and scaffolded support.`,
    essayNote,
    forwardNote,
  ].join(' ');
}

function generateConclusion(portfolio: PortfolioSummary): string {
  const score = portfolio.overallScorePct;
  const improvement = portfolio.avgImprovementPct;

  let level: string;
  let nextStep: string;

  if (score >= 80) {
    level = 'High achievement';
    nextStep =
      'Student is recommended for advanced writing enrichment and independent research tasks.';
  } else if (score >= 70) {
    level = 'Satisfactory performance';
    nextStep =
      'Continue with standard curriculum supplemented by periodic targeted feedback sessions.';
  } else if (score >= 60) {
    level = 'Developing performance';
    nextStep =
      'Recommend structured practice sessions and bi-weekly progress check-ins with the instructor.';
  } else {
    level = 'Foundational support needed';
    nextStep =
      'Intensive scaffolding, reduced task complexity, and increased feedback frequency are strongly advised.';
  }

  const improvementNote =
    improvement > 5
      ? ` Significant improvement of +${improvement}% from baseline reflects effective engagement with instructor feedback.`
      : improvement < -5
      ? ` A regression of ${Math.abs(improvement)}% from baseline requires immediate diagnostic review.`
      : '';

  return `${level}.${improvementNote} ${nextStep}`;
}

function generateRecommendations(portfolio: PortfolioSummary): string[] {
  const recs: string[] = [];
  const stations = portfolio.stationsAverage;

  const weakStations = stations
    .filter((s) => s.scorePct < 65)
    .sort((a, b) => a.scorePct - b.scorePct)
    .slice(0, 4);

  const stationRec: Record<string, string> = {
    organization:
      'Practice paragraph-level outlining using PEEL or MEAL frameworks before drafting.',
    lexical_resource:
      'Build academic vocabulary through weekly word lists and context-rich extensive reading.',
    argumentation:
      'Use argument mapping and logical connector exercises to improve cohesion and reasoning.',
    grammar_accuracy:
      'Review subject-verb agreement, article usage, and sentence boundary conventions regularly.',
    overall_writing_quality:
      'Improve readability by varying sentence length and reducing over-nominalisation.',
    self_regulation:
      'Pair every claim with explicit evidence and analysis using the ICE (Introduce–Cite–Explain) method.',
    engagement:
      'Maintain a consistently academic register; avoid informal phrasing in formal writing tasks.',
  };

  for (const s of weakStations) {
    const rec = stationRec[s.id];
    if (rec) recs.push(rec);
  }

  if (portfolio.avgImprovementPct < 3 && portfolio.trend !== 'improving') {
    recs.push(
      'Implement a draft–feedback–revise cycle on each assignment to build a revision habit.'
    );
  }

  if (
    portfolio.metrics.totalEssays > 0 &&
    portfolio.metrics.totalEssays < portfolio.totalSubmissions * 0.5
  ) {
    recs.push(
      'Increase substantive text production — a significant portion of submissions currently lack written content.'
    );
  }

  return recs.slice(0, 5);
}

// ── Core Builders ─────────────────────────────────────────────────────────────

function buildStationsSummary(portfolio: PortfolioSummary): ReportStationSummary[] {
  const stations = portfolio.stationsAverage;
  const sorted = [...stations].sort((a, b) => b.scorePct - a.scorePct);
  const top = sorted[0]?.scorePct ?? 0;
  const bottom = sorted[sorted.length - 1]?.scorePct ?? 0;

  return stations.map((s) => ({
    id: s.id,
    name: s.name,
    avgScorePct: s.scorePct,
    band: s.band,
    trend:
      s.scorePct >= top - 5
        ? ('improving' as const)
        : s.scorePct <= bottom + 5
        ? ('declining' as const)
        : ('stable' as const),
    insight: s.insight,
    color: STATION_COLORS[s.id] ?? '#64748b',
  }));
}

function buildFullReport(portfolio: PortfolioSummary): FinalReport {
  const stationsSummary = buildStationsSummary(portfolio);

  return {
    studentId: portfolio.studentId,
    studentName: toTitleCase(portfolio.studentName),
    email: portfolio.email ?? nameToEmail(portfolio.studentName),
    course: portfolio.course ?? 'Academic Writing',
    period: formatPeriod(
      portfolio.evolution[0]?.t,
      portfolio.evolution[portfolio.evolution.length - 1]?.t
    ),
    totalSubmissions: portfolio.totalSubmissions,
    overallScorePct: portfolio.overallScorePct,
    improvementPct: portfolio.avgImprovementPct,
    trend: portfolio.trend as FinalReport['trend'],
    status: deriveStatus(portfolio.overallScorePct, portfolio.metrics.totalEssays),
    lastUpdatedAt: portfolio.lastActiveAt ?? new Date().toISOString(),
    stationsSummary,
    strengths: portfolio.strengths.length
      ? portfolio.strengths
      : stationsSummary
          .slice()
          .sort((a, b) => b.avgScorePct - a.avgScorePct)
          .slice(0, 3)
          .map((s) => `Strong ${s.name}: ${s.insight}`),
    areasForImprovement: portfolio.growthAreas.length
      ? portfolio.growthAreas
      : stationsSummary
          .slice()
          .sort((a, b) => a.avgScorePct - b.avgScorePct)
          .slice(0, 3)
          .map((s) => `Improve ${s.name} — currently at ${s.avgScorePct}%.`),
    recommendations: generateRecommendations(portfolio),
    evolution: portfolio.evolution,
    teacherComments: generateTeacherComments(portfolio),
    overallConclusion: generateConclusion(portfolio),
    generatedAt: new Date().toISOString(),
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Lightweight list — uses student summaries only (no per-student journey fetch).
 * Fields not computable without full journey are left as defaults.
 */
export async function listFinalReports(): Promise<FinalReport[]> {
  const students = await listStudentSummaries();

  return students.map((s) => ({
    studentId: s.studentId,
    studentName: toTitleCase(s.studentName),
    email: s.email,
    course: s.course,
    period: new Date(s.lastSubmissionAt).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    }),
    totalSubmissions: s.totalSubmissions,
    overallScorePct: s.avgScorePct,
    improvementPct: 0,
    trend: 'insufficient_data' as const,
    status: deriveStatus(s.avgScorePct, s.totalSubmissions),
    lastUpdatedAt: s.lastSubmissionAt,
    stationsSummary: [],
    strengths: [],
    areasForImprovement: [],
    recommendations: [],
    evolution: [],
    teacherComments: '',
    overallConclusion: '',
    generatedAt: new Date().toISOString(),
  }));
}

/**
 * Full detail — fetches the student's complete journey data and builds a rich FinalReport.
 */
export async function getFinalReport(studentId: string): Promise<FinalReport> {
  try {
    const portfolio = await getPortfolioSummary(studentId);
    return buildFullReport(portfolio);
  } catch (e) {
    console.warn('[reportService] Falling back to mock report:', e);
    return MOCK_FINAL_REPORT(studentId);
  }
}

// ── Mock Fallback ─────────────────────────────────────────────────────────────

export const MOCK_FINAL_REPORT = (studentId: string): FinalReport => ({
  studentId,
  studentName: 'Nour Belabbes',
  email: 'nour.belabbes@university.edu',
  course: 'Academic Writing',
  period: 'Feb 2026 – Mar 2026',
  totalSubmissions: 14,
  overallScorePct: 76,
  improvementPct: 12,
  trend: 'improving',
  status: 'ready',
  lastUpdatedAt: '2026-03-14T15:59:34+00:00',
  stationsSummary: [
    {
      id: 'organization',
      name: 'Text Structure',
      avgScorePct: 74,
      trend: 'improving',
      insight: 'Paragraphing is consistent; refine topic sentences for clarity.',
      color: '#3B82F6',
    },
    {
      id: 'lexical_resource',
      name: 'Vocabulary',
      avgScorePct: 81,
      trend: 'improving',
      insight: 'Strong lexical variety; avoid repetition in argument development.',
      color: '#10B981',
    },
    {
      id: 'argumentation',
      name: 'Coherence & Flow',
      avgScorePct: 67,
      trend: 'stable',
      insight: 'Improve linking phrases and logical transitions between paragraphs.',
      color: '#8B5CF6',
    },
    {
      id: 'grammar_accuracy',
      name: 'Grammar Accuracy',
      avgScorePct: 79,
      trend: 'improving',
      insight: 'Minor agreement issues; focus on sentence boundary conventions.',
      color: '#F97316',
    },
    {
      id: 'overall_writing_quality',
      name: 'Readability',
      avgScorePct: 72,
      trend: 'stable',
      insight: 'Readable overall; reduce sentence length and nominalisation.',
      color: '#06B6D4',
    },
    {
      id: 'self_regulation',
      name: 'Argument Strength',
      avgScorePct: 63,
      trend: 'declining',
      insight: 'Claims need stronger evidence pairing and explicit analysis.',
      color: '#F59E0B',
    },
    {
      id: 'engagement',
      name: 'Sentiment & Tone',
      avgScorePct: 84,
      trend: 'improving',
      insight: 'Academic tone is well-maintained and consistently appropriate.',
      color: '#EF4444',
    },
  ],
  strengths: [
    'High vocabulary richness demonstrating advanced lexical control.',
    'Consistent academic tone and register across all submissions.',
    'Strong grammar accuracy with minimal critical errors.',
  ],
  areasForImprovement: [
    'Argument depth: claims frequently lack supporting evidence and analysis.',
    'Coherence: transitions between ideas need explicit linking language.',
    'Text structure: topic sentences require greater precision and focus.',
  ],
  recommendations: [
    'Practice paragraph-level outlining using PEEL framework before drafting.',
    'Use the ICE (Introduce–Cite–Explain) method for every argument claim.',
    'Build academic connectors vocabulary: however, consequently, notwithstanding.',
    'Draft–feedback–revise cycle: revisit each submission after teacher feedback.',
    'Reduce average sentence length to under 25 words for improved readability.',
  ],
  evolution: [
    { t: '2026-02-07', value: 62 },
    { t: '2026-02-14', value: 65 },
    { t: '2026-02-21', value: 68 },
    { t: '2026-02-28', value: 71 },
    { t: '2026-03-07', value: 74 },
    { t: '2026-03-14', value: 76 },
  ],
  teacherComments:
    'Nour has demonstrated consistent improvement throughout the term, achieving an overall score of 76%. Their strongest performance area is Vocabulary, showing clear mastery. Coherence and Argument Strength remain primary areas for targeted intervention. With continued guided practice, Nour is expected to make further gains in the coming term.',
  overallConclusion:
    'Satisfactory performance. Significant improvement of +12% from baseline reflects effective engagement with instructor feedback. Continue with standard curriculum supplemented by periodic targeted feedback sessions.',
  generatedAt: new Date().toISOString(),
});
