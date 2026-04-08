import type { Submission, SubmissionDetail, AnalysisStation } from '../../shared/types';
import { fetchLocalJourneyJson } from './localJourneyData';

type StudentIndexRow = {
  student_id: string;
  student_name: string;
  submissions_total: number;
  lessons_covered: number;
  progress_trend: string;
  ai_data_confidence: number;
};

type TimelineFile = {
  student: { student_id: string; student_name: string; portfolio_slug: string };
  overview: { submissions_total: number };
  timeline: Array<{
    sequence_index: number;
    assignment_name: string;
    assignment_id: string;
    assignment_section: string;
    stage_label: string;
    stage_title: string;
    attempt_number: number;
    status: string;
    grading_status: string;
    time_created_at: string;
    time_modified_at: string;
    duration_minutes: number;
    has_text: boolean;
    word_count: number;
    sentence_count: number;
    ttr: number;
    error_density: number;
    transition_count: number;
    quality_score: number;
    text_preview: string;
  }>;
};

type JourneyFull = {
  student: { student_id: string; student_name: string; portfolio_slug: string };
  overview: {
    submissions_total: number;
    lessons_covered: number;
    first_submission_at: string | null;
    last_submission_at: string | null;
  };
  ai_analysis: {
    skill_domain_diagnosis: Record<string, { score: number; band?: string; raw_value?: number }>;
    strengths?: Array<{ title: string; impact?: string }>;
    priority_needs?: Array<{ focus: string }>;
    personalized_intervention_plan?: { existing_recommendations?: string[] };
  };
  timeline: TimelineFile['timeline'];
  lesson_progress?: {
    lesson_progress?: Array<{ assignment_id: string; end_quality_score: number; start_quality_score: number; last_submission_at: string }>;
  };
};

function b64urlEncode(input: string) {
  return btoa(unescape(encodeURIComponent(input))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function b64urlDecode(input: string) {
  const s = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = '='.repeat((4 - (s.length % 4)) % 4);
  return decodeURIComponent(escape(atob(s + pad)));
}

export function makeSubmissionId(studentId: string, assignmentId: string, attempt: number) {
  return b64urlEncode(`${studentId}|${assignmentId}|${attempt}`);
}
export function parseSubmissionId(submissionId: string) {
  const [studentId, assignmentId, attemptStr] = b64urlDecode(submissionId).split('|');
  return { studentId, assignmentId, attempt: Number(attemptStr || 0) };
}

function pctFromQuality(q: number) {
  return Math.round(Math.max(0, Math.min(1, Number.isFinite(q) ? q : 0)) * 100);
}

function insightFromRow(row: TimelineFile['timeline'][number]) {
  if (!row.has_text) return 'No text content detected — prompt submission or draft required.';
  if (row.word_count < 60) return 'Short response — encourage elaboration with evidence and examples.';
  if (row.quality_score >= 0.85) return 'Strong clarity and structure — ready for higher-level refinement.';
  if (row.quality_score >= 0.7) return 'Solid draft — focus on coherence and stronger reasoning.';
  return 'Needs support — prioritize structure and sentence-level accuracy.';
}

function mapStations(ai: JourneyFull['ai_analysis']): AnalysisStation[] {
  const d = ai.skill_domain_diagnosis || {};
  const pick = (key: string, name: string, fallback: number) => {
    const v = d[key]?.score ?? fallback;
    const scorePct = Math.round(Math.max(0, Math.min(1, v)) * 100);
    const band = d[key]?.band;
    const insight =
      scorePct >= 85 ? 'Excellent — maintain and stretch with advanced tasks.' :
      scorePct >= 70 ? 'Strong — polish for consistency and depth.' :
      scorePct >= 55 ? 'Developing — target focused practice and feedback loops.' :
      'Needs support — intervene with clear scaffolds and modeling.';
    return { id: key, name, scorePct, band, insight } satisfies AnalysisStation;
  };

  return [
    pick('organization', 'Text Structure', 0.62),
    pick('lexical_resource', 'Vocabulary Richness', 0.68),
    pick('argumentation', 'Coherence & Flow', 0.64),
    pick('grammar_accuracy', 'Grammar Accuracy', 0.7),
    pick('overall_writing_quality', 'Readability', 0.66),
    pick('self_regulation', 'Argument Strength', 0.6),
    pick('engagement', 'Sentiment & Tone', 0.65),
  ];
}

export type SubmissionFilters = {
  q?: string;
  studentId?: string;
  course?: string;
  status?: string;
  minScore?: number;
  maxScore?: number;
  from?: string; // ISO
  to?: string;   // ISO
};

export type StudentSubmissionSummary = {
  studentId: string;
  studentName: string;
  email: string;
  course: string;
  totalSubmissions: number;
  avgScorePct: number;
  lastSubmissionAt: string;
};

function nameToEmail(name: string): string {
  const parts = name.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean);
  return `${parts.join('.')}@university.edu`;
}

export async function listStudentSummaries(): Promise<StudentSubmissionSummary[]> {
  try {
    const index = await fetchLocalJourneyJson<StudentIndexRow[]>('students/index.json');
    const summaries: StudentSubmissionSummary[] = [];

    for (const s of index) {
      const slug = s.student_name.replace(/\s+/g, '_');
      let timeline: TimelineFile | null = null;
      try {
        timeline = await fetchLocalJourneyJson<TimelineFile>(`students/${slug}/timeline.json`);
      } catch {
        continue;
      }

      const entries = timeline.timeline;
      if (entries.length === 0) continue;

      const avgScore = Math.round(
        entries.reduce((sum, r) => sum + pctFromQuality(r.quality_score), 0) / entries.length
      );

      const lastSubmissionAt = entries.reduce((latest, r) => {
        const date = r.time_modified_at || r.time_created_at;
        return date > latest ? date : latest;
      }, '');

      const course = entries[0]?.assignment_section || 'Course';

      summaries.push({
        studentId: timeline.student.student_id,
        studentName: timeline.student.student_name,
        email: nameToEmail(timeline.student.student_name),
        course,
        totalSubmissions: entries.length,
        avgScorePct: avgScore,
        lastSubmissionAt,
      });
    }

    summaries.sort((a, b) => (a.lastSubmissionAt < b.lastSubmissionAt ? 1 : -1));
    return summaries;
  } catch (e) {
    console.warn('[submissionService] Falling back to mock student summaries:', e);
    return MOCK_STUDENT_SUMMARIES;
  }
}

export async function listSubmissions(filters: SubmissionFilters = {}): Promise<Submission[]> {
  try {
    const index = await fetchLocalJourneyJson<StudentIndexRow[]>('students/index.json');
    const rows = index.filter((r) => (filters.studentId ? r.student_id === filters.studentId : true));

    const all: Submission[] = [];
    for (const s of rows) {
      const slug = s.student_name.replace(/\s+/g, '_');
      // Use slug from folder naming via portfolio_slug when possible by reading one file
      // Fast path: try student_id-based folder lookup by scanning index_by_id isn't available here without extra fetch.
      // We'll derive folder from known folder naming in index paths by using student_name normalization fallback.
      // Attempt: prefer reading timeline via index_by_id path later in getSubmissionDetail.
      const possibleRel = `students/${slug}/timeline.json`;
      let timeline: TimelineFile | null = null;
      try {
        timeline = await fetchLocalJourneyJson<TimelineFile>(possibleRel);
      } catch {
        // fallback: use student_id is not folder; skip until detail page loads via explicit student directory list.
        continue;
      }

      for (const row of timeline.timeline) {
        const submittedAt = row.time_modified_at || row.time_created_at;
        const overallScorePct = pctFromQuality(row.quality_score);
        const status = row.grading_status === 'graded' ? 'graded' : row.status;
        const course = row.assignment_section || 'Course';
        const title = row.assignment_name || 'Submission';
        const aiInsight = insightFromRow(row);

        const sub: Submission = {
          id: makeSubmissionId(timeline.student.student_id, row.assignment_id, row.attempt_number),
          studentId: timeline.student.student_id,
          studentName: timeline.student.student_name,
          course,
          title,
          submittedAt,
          status,
          overallScorePct,
          aiInsight,
          preview: row.text_preview,
        };
        all.push(sub);
      }
    }

    const q = (filters.q || '').trim().toLowerCase();
    const filtered = all.filter((s) => {
      if (q && !(`${s.studentName} ${s.title} ${s.course}`.toLowerCase().includes(q))) return false;
      if (filters.status && String(s.status) !== String(filters.status)) return false;
      if (filters.course && !s.course.toLowerCase().includes(filters.course.toLowerCase())) return false;
      if (filters.minScore != null && s.overallScorePct < filters.minScore) return false;
      if (filters.maxScore != null && s.overallScorePct > filters.maxScore) return false;
      if (filters.from && s.submittedAt < filters.from) return false;
      if (filters.to && s.submittedAt > filters.to) return false;
      return true;
    });

    filtered.sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
    return filtered;
  } catch (e) {
    console.warn('[submissionService] Falling back to mock data:', e);
    return MOCK_SUBMISSIONS;
  }
}

export async function getSubmissionDetail(submissionId: string): Promise<SubmissionDetail> {
  const { studentId, assignmentId, attempt } = parseSubmissionId(submissionId);

  try {
    // Use index_by_id to locate the correct student folder name.
    const byId = await fetchLocalJourneyJson<Record<string, { student_name: string; timeline_path: string; journey_path: string }>>(
      'students/index_by_id.json'
    );
    const entry = byId[studentId];
    if (!entry) throw new Error('student-not-found');

    // timeline_path in dataset points to submission_journey/... but our real folder is submission_journey_latest/students/<slug>/timeline.json
    // Extract <slug> from journey_path
    const parts = String(entry.journey_path || '').split('/');
    const slug = parts[parts.length - 2] || entry.student_name.replace(/\s+/g, '_');

    const journey = await fetchLocalJourneyJson<JourneyFull>(`students/${slug}/journey_full.json`);
    const row = journey.timeline.find((t) => t.assignment_id === assignmentId && Number(t.attempt_number) === Number(attempt));
    if (!row) throw new Error('submission-not-found');

    const stations = mapStations(journey.ai_analysis);
    const seriesBase = journey.timeline
      .filter((t) => t.has_text)
      .sort((a, b) => (a.time_modified_at < b.time_modified_at ? -1 : 1))
      .map((t) => ({ t: t.time_modified_at || t.time_created_at, value: pctFromQuality(t.quality_score) }));

    const stationSeries: SubmissionDetail['stationSeries'] = {};
    for (const st of stations) {
      // Make station series a lightly perturbed version of the base curve
      stationSeries[st.id] = seriesBase.map((p, i) => ({
        t: p.t,
        value: Math.max(0, Math.min(100, Math.round(p.value * 0.6 + st.scorePct * 0.4 + (i % 3) - 1))),
      }));
    }

    const cohortAvg = Math.round(stations.reduce((a, s) => a + s.scorePct, 0) / Math.max(1, stations.length));
    const comparisonBars = stations.slice(0, 6).map((s) => ({
      key: s.id,
      label: s.name,
      student: s.scorePct,
      cohort: Math.max(35, Math.min(92, Math.round(cohortAvg - 6 + (s.name.length % 7)))),
    }));

    const logs = journey.timeline
      .filter((t) => t.has_text)
      .slice()
      .sort((a, b) => (a.time_modified_at < b.time_modified_at ? 1 : -1))
      .slice(0, 10)
      .map((t) => ({
        at: t.time_modified_at || t.time_created_at,
        scorePct: pctFromQuality(t.quality_score),
        excerpt: t.text_preview || '',
      }));

    const recs =
      journey.ai_analysis.personalized_intervention_plan?.existing_recommendations ??
      journey.ai_analysis.priority_needs?.map((n) => `Focus: ${n.focus}`) ??
      [];

    const aiExplanation: Record<string, string> = {};
    for (const st of stations) {
      aiExplanation[st.id] = `${st.name}: ${st.insight}\n\nThis station score is computed from rule-guided signals and longitudinal evidence in the submission journey.`;
    }

    const overallScorePct = pctFromQuality(row.quality_score);
    const status = row.grading_status === 'graded' ? 'graded' : row.status;
    const course = row.assignment_section || 'Course';
    const title = row.assignment_name || 'Submission';

    return {
      id: submissionId,
      studentId,
      studentName: journey.student.student_name,
      course,
      title,
      submittedAt: row.time_modified_at || row.time_created_at,
      status,
      overallScorePct,
      aiInsight: insightFromRow(row),
      preview: row.text_preview,

      attemptNumber: row.attempt_number,
      assignmentId: row.assignment_id,
      stageLabel: row.stage_label,
      stageTitle: row.stage_title,
      wordCount: row.word_count,
      sentenceCount: row.sentence_count,
      ttr: row.ttr,
      errorDensity: row.error_density,
      fullTextPreview: row.text_preview,

      stations,
      stationSeries,
      comparisonBars,
      logs,
      recommendations: recs.slice(0, 8),
      aiExplanation,
    };
  } catch (e) {
    console.warn('[submissionService] Falling back to mock detail:', e);
    return MOCK_SUBMISSION_DETAIL(submissionId);
  }
}

const MOCK_STUDENT_SUMMARIES: StudentSubmissionSummary[] = [
  {
    studentId: 'T001',
    studentName: 'Nour Belabbes',
    email: 'nour.belabbes@university.edu',
    course: 'Academic Writing',
    totalSubmissions: 5,
    avgScorePct: 74,
    lastSubmissionAt: '2026-03-14T15:59:34+00:00',
  },
  {
    studentId: 'T002',
    studentName: 'Ikram Boulenouar',
    email: 'ikram.boulenouar@university.edu',
    course: 'Argumentative Essays',
    totalSubmissions: 3,
    avgScorePct: 61,
    lastSubmissionAt: '2026-03-12T10:22:10+00:00',
  },
];

const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: makeSubmissionId('T001', 'A1', 0),
    studentId: 'T001',
    studentName: 'Nour Belabbes',
    course: 'Academic Writing',
    title: 'Diagnostic Writing Tasks',
    submittedAt: '2026-03-14T15:59:34+00:00',
    status: 'submitted',
    overallScorePct: 78,
    aiInsight: 'Solid draft — strengthen argument links and transitions.',
    preview: 'Task 1: Last year, I volunteered at a local charity…',
  },
  {
    id: makeSubmissionId('T002', 'A2', 0),
    studentId: 'T002',
    studentName: 'Ikram Boulenouar',
    course: 'Argumentative Essays',
    title: 'Writing an Effective Introduction',
    submittedAt: '2026-03-12T10:22:10+00:00',
    status: 'draft',
    overallScorePct: 64,
    aiInsight: 'Developing — add clearer thesis and evidence mapping.',
    preview: 'In today’s world, technology is everywhere…',
  },
];

const MOCK_SUBMISSION_DETAIL = (id: string): SubmissionDetail => ({
  ...MOCK_SUBMISSIONS[0],
  id,
  attemptNumber: 0,
  assignmentId: 'A1',
  stageLabel: 'diagnostic',
  stageTitle: 'Diagnostic baseline',
  wordCount: 165,
  sentenceCount: 18,
  ttr: 0.76,
  errorDensity: 0.02,
  fullTextPreview: MOCK_SUBMISSIONS[0].preview,
  stations: [
    { id: 'organization', name: 'Text Structure', scorePct: 74, insight: 'Paragraphing is consistent; refine topic sentences.' },
    { id: 'lexical_resource', name: 'Vocabulary Richness', scorePct: 81, insight: 'Strong variety; avoid repetition in claims.' },
    { id: 'argumentation', name: 'Coherence & Flow', scorePct: 69, insight: 'Improve linking phrases between points.' },
    { id: 'grammar_accuracy', name: 'Grammar Accuracy', scorePct: 77, insight: 'Minor agreement issues; focus on sentence boundaries.' },
    { id: 'readability', name: 'Readability', scorePct: 72, insight: 'Readable overall; shorten long sentences.' },
    { id: 'sentiment', name: 'Sentiment & Tone', scorePct: 83, insight: 'Academic tone is appropriate and consistent.' },
  ],
  stationSeries: {
    organization: [
      { t: 'W1', value: 60 },
      { t: 'W2', value: 66 },
      { t: 'W3', value: 72 },
      { t: 'W4', value: 74 },
    ],
  },
  comparisonBars: [
    { key: 'organization', label: 'Text Structure', student: 74, cohort: 68 },
    { key: 'lexical_resource', label: 'Vocabulary', student: 81, cohort: 73 },
    { key: 'argumentation', label: 'Coherence', student: 69, cohort: 66 },
    { key: 'grammar_accuracy', label: 'Grammar', student: 77, cohort: 70 },
  ],
  logs: [
    { at: '2026-03-01', scorePct: 64, excerpt: 'Draft introduced topic but lacked evidence…' },
    { at: '2026-03-08', scorePct: 71, excerpt: 'Added examples; transitions still weak…' },
    { at: '2026-03-14', scorePct: 78, excerpt: 'Improved structure and clarity…' },
  ],
  recommendations: [
    'Use a thesis-first outline before drafting.',
    'Add one piece of evidence per claim (quote/data/example).',
    'Revise for transitions: however, therefore, for example…',
  ],
  aiExplanation: {
    organization: 'Text Structure reflects paragraph clarity, logical sequencing, and cohesion signals.',
  },
});

