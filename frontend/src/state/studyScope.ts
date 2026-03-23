import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { clamp } from '../utils/utils';
import {
  getStudentClusterName,
  getStudentRiskLevel,
  type ActivityItem,
  type ComparisonMetric,
  type DialogueMessage,
  type InstructorComment,
  type MessageThreshold,
  type RevisionSequenceStep,
  type RubricCriterion,
  type StudentRecord,
  type WorkspaceStudent,
  type WritingArtifact,
} from '../data/diagnostic';

export type StudyVariableId =
  | 'assignment_views'
  | 'time_on_task'
  | 'revision_frequency'
  | 'feedback_views'
  | 'help_seeking_messages'
  | 'word_count'
  | 'cohesion'
  | 'argumentation'
  | 'grammar_accuracy'
  | 'ttr'
  | 'rubric'
  | 'private_messages';

export interface StudyVariableOption {
  id: StudyVariableId;
  label: string;
  category: 'behaviour' | 'writing' | 'assessment' | 'communication';
  description: string;
}

export interface StudyTaskOption {
  id: string;
  label: string;
  status: string;
  date: string;
  wordCount: number;
}

export type StudyStationId =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12;

export interface StudyStationOption {
  id: StudyStationId;
  label: string;
  group: 'input' | 'analytics' | 'decision' | 'action';
  description: string;
}

export interface TeacherStudyCase {
  id: string;
  workbookName: string;
  meta: {
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
  };
  student: StudentRecord;
  workspace: WorkspaceStudent;
  clusterName: string;
  riskLevel: 'low' | 'monitor' | 'critical';
  rubric: {
    totalMaxPoints: number;
    criteria: RubricCriterion[];
  };
  activity: {
    totalEvents: number;
    activeSessions: number;
    estimatedActiveMinutes: number;
    sessionGapRule: string;
    clickSignals: Array<{
      label: string;
      value: string;
      note: string;
      accent: 'lav' | 'teal' | 'gold' | 'red';
    }>;
    highlightedSessions: Array<{
      start: string;
      end: string;
      minutes: number;
      events: number;
      focus: string;
    }>;
    trace: Array<{
      timestamp: string;
      event: string;
      context: string;
      detail: string;
    }>;
  };
  writing: {
    artifacts: WritingArtifact[];
    comparison: {
      beforeId: string;
      afterId: string;
      metrics: ComparisonMetric[];
      commentary: string[];
    };
    sequence: RevisionSequenceStep[];
  };
  communication: {
    dialogue: DialogueMessage[];
    instructorComments: InstructorComment[];
  };
  thresholds: {
    privateMessages: {
      matchedCount: number;
      compositeThreshold: string;
      thresholds: MessageThreshold[];
    };
  };
  recentActivity: ActivityItem[];
  scoreJourney: Array<{ name: string; score: number }>;
  analytics?: ParsedWorkbookCaseResponse['analytics'];
  metrics?: ParsedWorkbookCaseResponse['metrics'];
}

export interface ParsedWorkbookCaseResponse {
  meta: {
    workbookName: string;
    studentName: string;
    userId: string;
    courseTitle: string;
    courseId: string;
    instructor: string;
    institution: string;
    reportGenerated: string;
    periodCovered: string;
    totalAssignmentsSubmitted: number;
    gradedAssignments: number;
    ungradedAssignments: number;
    forumPosts: number;
    activityLogEntries: number;
    writingSamples?: number;
    chatMessages: number;
    feedbackViewedAt: string;
    introGrade: string;
  };
  data: StudentRecord[];
  rubric?: {
    totalMaxPoints: number;
    criteria: RubricCriterion[];
  };
  activity?: TeacherStudyCase['activity'];
  writing?: {
    artifacts: WritingArtifact[];
    comparison: TeacherStudyCase['writing']['comparison'];
    sequence: RevisionSequenceStep[];
  };
  communication?: TeacherStudyCase['communication'];
  thresholds?: TeacherStudyCase['thresholds'];
  metrics?: {
    rf_metrics: { mae: number; r2: number } | null;
    rf_importance: Array<{ feature: string; importance: number }>;
    cluster_centroids: Array<Record<string, number>>;
  };
  analytics?: {
    source: 'verified-cohort';
    cohort_size: number;
    clustering: {
      available: boolean;
      reason: string | null;
    };
    prediction: {
      available: boolean;
      reason: string | null;
    };
    bayesian: {
      available: boolean;
      reason: string | null;
    };
  };
}

export const STUDY_VARIABLES: StudyVariableOption[] = [
  {
    id: 'assignment_views',
    label: 'Assignment Views',
    category: 'behaviour',
    description: 'How often the student opened assignment modules.',
  },
  {
    id: 'time_on_task',
    label: 'Time on Task',
    category: 'behaviour',
    description: 'Estimated active time derived from Moodle activity gaps.',
  },
  {
    id: 'revision_frequency',
    label: 'Revision Frequency',
    category: 'behaviour',
    description: 'How many tracked revision or resubmission moves appear in the case.',
  },
  {
    id: 'feedback_views',
    label: 'Feedback Views',
    category: 'communication',
    description: 'How many times teacher feedback was viewed on Moodle.',
  },
  {
    id: 'help_seeking_messages',
    label: 'Help-Seeking',
    category: 'communication',
    description: 'Private messages that match the study threshold for help-seeking.',
  },
  {
    id: 'word_count',
    label: 'Word Count',
    category: 'writing',
    description: 'Length of the selected writing task or the latest submission.',
  },
  {
    id: 'cohesion',
    label: 'Cohesion',
    category: 'writing',
    description: 'Linking and flow across ideas in the paragraph.',
  },
  {
    id: 'argumentation',
    label: 'Argumentation',
    category: 'writing',
    description: 'Strength of claim-evidence-explanation structure.',
  },
  {
    id: 'grammar_accuracy',
    label: 'Grammar Accuracy',
    category: 'writing',
    description: 'Approximate sentence-level control and accuracy.',
  },
  {
    id: 'ttr',
    label: 'Lexical Variety',
    category: 'writing',
    description: 'Scaled type-token ratio used as a lexical diversity indicator.',
  },
  {
    id: 'rubric',
    label: 'Rubric Criteria',
    category: 'assessment',
    description: 'Grading rubric rows linked to the chosen task or case.',
  },
  {
    id: 'private_messages',
    label: 'Private Messages',
    category: 'communication',
    description: 'Teacher-student exchanges and threshold analysis.',
  },
];

export const STUDY_STATIONS: StudyStationOption[] = [
  { id: 1, label: 'Writing Task', group: 'input', description: 'Task framing and initial writing artefacts.' },
  { id: 2, label: 'Data Integration', group: 'input', description: 'Workbook evidence, logs, and communication traces.' },
  { id: 3, label: 'Submission Patterns', group: 'analytics', description: 'Temporal activity, sessions, and engagement traces.' },
  { id: 4, label: 'Stylometric Analysis', group: 'analytics', description: 'Writing quality and textual feature signals.' },
  { id: 5, label: 'Evidence Matrix', group: 'analytics', description: 'Alignment across behavioural and writing signals.' },
  { id: 6, label: 'Cluster Mapping', group: 'analytics', description: 'Learner profile grouping shown in case-level mode first and upgraded to cohort-backed clustering when enough imported cases are available.' },
  { id: 7, label: 'Predictive Model', group: 'analytics', description: 'Prediction support showing influential factors in case-level mode or verified cohort modelling when available.' },
  { id: 8, label: 'Bayesian Synthesis', group: 'analytics', description: 'Latent competence inference drawn from the adaptive competence-state layer for the selected case.' },
  { id: 9, label: 'Diagnostic Signals', group: 'decision', description: 'Rule-based signals for teacher interpretation rather than automatic pedagogical judgment.' },
  { id: 10, label: 'Feedback Planning', group: 'decision', description: 'Feedback triggers and evidence organisation to support the teacher response.' },
  { id: 11, label: 'Intervention Planning', group: 'action', description: 'Instructional action planning led by the teacher.' },
  { id: 12, label: 'Revision Cycle', group: 'action', description: 'Observed uptake and revision-based growth cycle.' },
];

const DEFAULT_VARIABLE_IDS: StudyVariableId[] = [
  'assignment_views',
  'revision_frequency',
  'feedback_views',
  'help_seeking_messages',
  'word_count',
  'argumentation',
];

const DEFAULT_STATION_IDS: StudyStationId[] = STUDY_STATIONS.map((station) => station.id);



function buildScoreJourney(student: StudentRecord): Array<{ name: string; score: number }> {
  const current = clamp(Number((student.total_score / 5.55).toFixed(1)), 1, 5);
  const growth = clamp(Number((student.score_gain / 2.1).toFixed(1)), 0.5, 2);
  const intro = clamp(Number((current - 1.6).toFixed(1)), 1, 5);
  const bodyRevision = clamp(Number((current - 0.8).toFixed(1)), 1, 5);

  return [
    { name: 'Diagnostic', score: clamp(Number((intro - 0.3).toFixed(1)), 1, 5) },
    { name: 'Intro', score: intro },
    { name: 'Body Rev', score: bodyRevision },
    { name: 'Final', score: Number(current.toFixed(1)) },
    { name: 'Gain', score: Number(clamp(current - growth + 0.4, 1, 5).toFixed(1)) },
  ].slice(0, 4);
}

function deriveWorkspaceStudent(student: StudentRecord, meta: TeacherStudyCase['meta']): WorkspaceStudent {
  const postScore = clamp(Number((student.total_score / 5.55).toFixed(1)), 1, 5);
  const gain = clamp(Number((student.score_gain / 2.1).toFixed(1)), 0.4, 2.4);
  const preScore = Number(clamp(postScore - gain, 1, 5).toFixed(1));
  const engagement = clamp(
    (student.assignment_views + student.resource_access_count + student.feedback_views * 4 + student.help_seeking_messages * 3) / 180
  );

  return {
    id: student.student_id,
    name: student.name,
    archetype:
      student.cluster_label === 0
        ? 'at-risk'
        : student.cluster_label === 1
          ? 'efficient'
          : student.cluster_label === 2
            ? 'struggling'
            : 'engaged-developing',
    risk: getStudentRiskLevel(student),
    preScore,
    postScore: Number(postScore.toFixed(1)),
    gain: Number((postScore - preScore).toFixed(1)),
    engagement: Number(engagement.toFixed(2)),
    drafts: Math.max(1, student.revision_frequency - 1),
    feedbackViewed: student.feedback_views,
    ruleTriggered: student.triggered_rule_ids.replace(/;\s*/g, ', '),
    helpSeeking: student.help_seeking_messages,
    lastActive: meta.reportGenerated || meta.periodCovered,
    active: true,
    moodle: {
      assignmentViews: clamp(student.assignment_views / 120),
      resourceAccess: clamp(student.resource_access_count / 30),
      rubricConsultation: clamp(student.rubric_views / 10),
      revisionActivity: clamp(student.revision_frequency / 6),
      feedbackUse: clamp(student.feedback_views / 6),
      helpSeeking: clamp(student.help_seeking_messages / 8),
      forumParticipation: clamp(meta.forumPosts / 6),
      taskPersistence: clamp(student.time_on_task / 240),
    },
    rubric: [
      { subject: 'Content', A: Math.round(clamp(student.argumentation / 5) * 100), fullMark: 100 },
      { subject: 'Structure', A: Math.round(clamp(student.cohesion / 5) * 100), fullMark: 100 },
      { subject: 'Evidence', A: Math.round(clamp(student.argumentation / 5 - 0.06) * 100), fullMark: 100 },
      { subject: 'Grammar', A: Math.round(clamp(student.grammar_accuracy / 5) * 100), fullMark: 100 },
      { subject: 'Academic Tone', A: Math.round(clamp(student.lexical_resource / 5) * 100), fullMark: 100 },
    ],
    nlp: [
      { subject: 'TTR', A: Math.round(student.ttr * 100) },
      { subject: 'Cohesion', A: Math.round(clamp(student.cohesion / 5) * 100) },
      { subject: 'Argument', A: Math.round(clamp(student.argumentation / 5) * 100) },
      { subject: 'Grammar', A: Math.round(clamp(student.grammar_accuracy / 5) * 100) },
      { subject: 'Revision', A: Math.round(clamp(student.revision_frequency / 6) * 100) },
    ],
    history: buildScoreJourney(student),
  };
}

function traceToRecentActivity(trace: TeacherStudyCase['activity']['trace']): ActivityItem[] {
  return trace.slice(-5).reverse().map((entry) => ({
    time: entry.timestamp,
    action: `${entry.event}: ${entry.detail}`,
    icon:
      /feedback/i.test(entry.event) ? 'download' :
      /comment/i.test(entry.event) ? 'message' :
      /submitted|uploaded/i.test(entry.event) ? 'upload' :
      /reopened/i.test(entry.event) ? 'alert' :
      'activity',
  }));
}

export function mapParsedCaseToStudyCase(parsed: ParsedWorkbookCaseResponse): TeacherStudyCase {
  const student = parsed.data[0];
  const meta: TeacherStudyCase['meta'] = {
    studentName: parsed.meta.studentName,
    userId: parsed.meta.userId,
    courseTitle: parsed.meta.courseTitle,
    courseId: parsed.meta.courseId,
    institution: parsed.meta.institution,
    instructor: parsed.meta.instructor,
    reportGenerated: parsed.meta.reportGenerated,
    periodCovered: parsed.meta.periodCovered,
    totalAssignmentsSubmitted: parsed.meta.totalAssignmentsSubmitted,
    gradedAssignments: parsed.meta.gradedAssignments,
    ungradedAssignments: parsed.meta.ungradedAssignments,
    forumPosts: parsed.meta.forumPosts,
    activityLogEntries: parsed.meta.activityLogEntries,
    chatMessages: parsed.meta.chatMessages,
    feedbackViewedAt: parsed.meta.feedbackViewedAt,
    introGrade: parsed.meta.introGrade,
    finalWordCount: student.word_count,
    dominantNeed:
      student.argumentation < 3.8
        ? 'argument expansion and stronger evidence'
        : student.lexical_resource < 3.8
          ? 'more academic phrasing and lexical precision'
          : 'sustaining revision quality across tasks',
  };
  const fallbackActivity: TeacherStudyCase['activity'] = parsed.activity ?? {
    totalEvents: meta.activityLogEntries,
    activeSessions: 0,
    estimatedActiveMinutes: student.time_on_task,
    sessionGapRule: 'No detailed activity summary supplied.',
    clickSignals: [],
    highlightedSessions: [],
    trace: [],
  };
  const scoreJourney = buildScoreJourney(student);

  return {
    id: `${parsed.meta.userId}:${parsed.meta.studentName}:${parsed.meta.workbookName}`,
    workbookName: parsed.meta.workbookName,
    meta,
    student,
    workspace: deriveWorkspaceStudent(student, meta),
    clusterName: getStudentClusterName(student),
    riskLevel: getStudentRiskLevel(student),
    rubric: parsed.rubric ?? {
      totalMaxPoints: 0,
      criteria: [],
    },
    activity: fallbackActivity,
    writing: parsed.writing ?? {
      artifacts: [],
      comparison: {
        beforeId: '',
        afterId: '',
        metrics: [],
        commentary: [],
      },
      sequence: [],
    },
    communication: parsed.communication ?? {
      dialogue: [],
      instructorComments: [],
    },
    thresholds: parsed.thresholds ?? {
      privateMessages: {
        matchedCount: student.help_seeking_messages,
        compositeThreshold: 'No threshold analysis was returned by the parser.',
        thresholds: [],
      },
    },
    recentActivity: fallbackActivity.trace.length > 0 ? traceToRecentActivity(fallbackActivity.trace) : [],
    scoreJourney,
    analytics: parsed.analytics,
    metrics: parsed.metrics,
  };
}

export function getTaskOptions(studyCase?: TeacherStudyCase | null): StudyTaskOption[] {
  if (!studyCase) {
    return [];
  }

  return [
    {
      id: 'case-overview',
      label: 'Full case overview',
      status: 'overview',
      date: studyCase.meta.periodCovered,
      wordCount: studyCase.student.word_count,
    },
    ...studyCase.writing.artifacts.map((artifact) => ({
      id: artifact.id,
      label: artifact.title,
      status: artifact.status,
      date: artifact.date,
      wordCount: artifact.wordCount,
    })),
  ];
}

export function getSelectedTask(studyCase: TeacherStudyCase | null | undefined, taskId: string | null | undefined) {
  if (!studyCase) {
    return null;
  }

  if (!taskId || taskId === 'case-overview') {
    return null;
  }

  return studyCase.writing.artifacts.find((artifact) => artifact.id === taskId) ?? null;
}

export function getStudyCaseVariableValue(studyCase: TeacherStudyCase, variableId: StudyVariableId): string {
  const { student, rubric, thresholds } = studyCase;

  switch (variableId) {
    case 'assignment_views':
      return String(student.assignment_views);
    case 'time_on_task':
      return `${studyCase.activity.estimatedActiveMinutes || student.time_on_task} min`;
    case 'revision_frequency':
      return String(student.revision_frequency);
    case 'feedback_views':
      return String(student.feedback_views);
    case 'help_seeking_messages':
      return String(student.help_seeking_messages);
    case 'word_count':
      return String(student.word_count);
    case 'cohesion':
      return student.cohesion.toFixed(1);
    case 'argumentation':
      return student.argumentation.toFixed(1);
    case 'grammar_accuracy':
      return student.grammar_accuracy.toFixed(1);
    case 'ttr':
      return student.ttr.toFixed(2);
    case 'rubric':
      return `${rubric.criteria.length} criteria`;
    case 'private_messages':
      return `${thresholds.privateMessages.matchedCount} matched`;
    default:
      return '-';
  }
}

interface StudyScopeState {
  cases: TeacherStudyCase[];
  selectedCaseId: string;
  selectedTaskByCase: Record<string, string>;
  selectedVariableIds: StudyVariableId[];
  selectedStationIds: StudyStationId[];
  importCases: (cases: TeacherStudyCase[]) => void;
  selectCase: (caseId: string) => void;
  selectTask: (taskId: string) => void;
  toggleVariable: (variableId: StudyVariableId) => void;
  setVariableSelection: (variableIds: StudyVariableId[]) => void;
  toggleStation: (stationId: StudyStationId) => void;
  setStationSelection: (stationIds: StudyStationId[]) => void;
}

export const useStudyScopeStore = create<StudyScopeState>()(
  persist(
    (set) => ({
      cases: [],
      selectedCaseId: '',
      selectedTaskByCase: {},
      selectedVariableIds: DEFAULT_VARIABLE_IDS,
      selectedStationIds: DEFAULT_STATION_IDS,
      importCases: (incomingCases) =>
        set((state) => {
          const mergedMap = new Map(state.cases.map((studyCase) => [studyCase.id, studyCase]));

          incomingCases.forEach((studyCase) => {
            mergedMap.set(studyCase.id, studyCase);
          });

          const mergedCases = Array.from(mergedMap.values());
          const firstImportedId = incomingCases[0]?.id ?? state.selectedCaseId;

          return {
            cases: mergedCases,
            selectedCaseId: firstImportedId,
            selectedTaskByCase: {
              ...state.selectedTaskByCase,
              ...Object.fromEntries(incomingCases.map((studyCase) => [studyCase.id, 'case-overview'])),
            },
          };
        }),
      selectCase: (caseId) =>
        set((state) => ({
          selectedCaseId: caseId,
          selectedTaskByCase: {
            ...state.selectedTaskByCase,
            [caseId]: state.selectedTaskByCase[caseId] ?? 'case-overview',
          },
        })),
      selectTask: (taskId) =>
        set((state) => ({
          selectedTaskByCase: {
            ...state.selectedTaskByCase,
            [state.selectedCaseId]: taskId,
          },
        })),
      toggleVariable: (variableId) =>
        set((state) => {
          const exists = state.selectedVariableIds.includes(variableId);

          if (exists && state.selectedVariableIds.length === 1) {
            return state;
          }

          return {
            selectedVariableIds: exists
              ? state.selectedVariableIds.filter((id) => id !== variableId)
              : [...state.selectedVariableIds, variableId],
          };
        }),
      setVariableSelection: (variableIds) =>
        set({
          selectedVariableIds: variableIds.length > 0 ? variableIds : DEFAULT_VARIABLE_IDS,
        }),
      toggleStation: (stationId) =>
        set((state) => {
          const exists = state.selectedStationIds.includes(stationId);

          if (exists && state.selectedStationIds.length === 1) {
            return state;
          }

          return {
            selectedStationIds: exists
              ? state.selectedStationIds.filter((id) => id !== stationId)
              : [...state.selectedStationIds, stationId].sort((a, b) => a - b),
          };
        }),
      setStationSelection: (stationIds) =>
        set({
          selectedStationIds: stationIds.length > 0 ? [...stationIds].sort((a, b) => a - b) : DEFAULT_STATION_IDS,
        }),
    }),
    {
      name: 'writelens-study-scope',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cases: state.cases,
        selectedCaseId: state.selectedCaseId,
        selectedTaskByCase: state.selectedTaskByCase,
        selectedVariableIds: state.selectedVariableIds,
        selectedStationIds: state.selectedStationIds,
      }),
    }
  )
);

export function getSelectedStudyCase(state: Pick<StudyScopeState, 'cases' | 'selectedCaseId'>): TeacherStudyCase | null {
  return state.cases.find((studyCase) => studyCase.id === state.selectedCaseId) ?? state.cases[0] ?? null;
}

export function getSelectedTaskId(state: Pick<StudyScopeState, 'selectedCaseId' | 'selectedTaskByCase'>): string {
  return state.selectedTaskByCase[state.selectedCaseId] ?? 'case-overview';
}
