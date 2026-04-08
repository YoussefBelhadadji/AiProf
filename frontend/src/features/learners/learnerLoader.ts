/**
 * WriteLens – Learner Data Loader
 *
 * Fetches JSON data from /run_data/ (symlinked to RUN_20260408_020438 in public/).
 * All functions are pure async fetchers with typed return values.
 * Falls back to static mock data if the server cannot serve the files.
 */

import type {
  StudentIndexEntry,
  StudentProfile,
  StationDetail,
  LearnerRow,
  EnrichedStationCard,
  RiskGroup,
  CompetenceLevel,
  PerformanceLevel,
} from './types';

const RUN_BASE = '/run_data';

// ─────────────────────────────────────────────────────────────────────────────
// FETCH HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.json() as Promise<T>;
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/** Load the flat student list used for the Learners page */
export async function fetchStudentIndex(): Promise<StudentIndexEntry[]> {
  return fetchJSON<StudentIndexEntry[]>(`${RUN_BASE}/students/index.json`);
}

/** Load a full student profile (station cards + summary) */
export async function fetchStudentProfile(profilePath: string): Promise<StudentProfile> {
  return fetchJSON<StudentProfile>(`${RUN_BASE}/${profilePath}`);
}

/** Load detailed metrics for one station */
export async function fetchStationDetail(detailPath: string): Promise<StationDetail> {
  return fetchJSON<StationDetail>(`${RUN_BASE}/${detailPath}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SCORE DERIVATION  (raw JSON → 0-100 UI scores)
// ─────────────────────────────────────────────────────────────────────────────

const PERFORMANCE_SCORE: Record<PerformanceLevel | string, number> = {
  'Needs Improvement': 28,
  'Good': 68,
  'Strong': 87,
  'Developing': 55,
};

const COMPETENCE_SCORE: Record<CompetenceLevel | string, number> = {
  Beginning: 25,
  Developing: 60,
  Advanced: 90,
};

const RISK_SEVERITY: Record<RiskGroup | string, 1 | 2 | 3 | 4> = {
  'Low Risk - Maintain and enrich': 1,
  'Lower Risk - Monitor and coach': 2,
  'Moderate Risk - Targeted support needed': 3,
  'High Risk - Urgent support needed': 4,
};

/** Derive a 0–100 composite score from the index entry */
export function deriveOverallScore(entry: StudentIndexEntry): number {
  const ps = PERFORMANCE_SCORE[entry.performance_level] ?? 50;
  const cs = COMPETENCE_SCORE[entry.competence_level] ?? 50;
  return Math.round((ps * 0.6 + cs * 0.4));
}

export function deriveRiskSeverity(entry: StudentIndexEntry): 1 | 2 | 3 | 4 {
  return RISK_SEVERITY[entry.risk_group] ?? 3;
}

function toInitials(name: string): string {
  return name
    .split(/[\s_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

function deriveCourseLabel(email: string): string {
  // nouria.messaoudi@univ-temouchent.edu.dz → EFL Writing
  if (email.includes('univ-temouchent')) return 'EFL Academic Writing';
  if (email.includes('univ-')) return 'University Course';
  return 'Writing Course';
}

/** Enrich a raw index entry with derived UI fields */
export function enrichLearner(entry: StudentIndexEntry): LearnerRow {
  return {
    ...entry,
    overallScore: deriveOverallScore(entry),
    riskSeverity: deriveRiskSeverity(entry),
    initials: toInitials(entry.student_name),
    courseLabel: deriveCourseLabel(entry.email),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// STATION ENRICHMENT  (profile station_cards → EnrichedStationCard[])
// ─────────────────────────────────────────────────────────────────────────────

interface StationMeta {
  icon: string;
  colorClass: string;
  bgClass: string;
}

const STATION_META: Record<string, StationMeta> = {
  station_01_data_intake: {
    icon: 'Database',
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50',
  },
  station_02_thresholds_rules: {
    icon: 'ShieldCheck',
    colorClass: 'text-orange-600',
    bgClass: 'bg-orange-50',
  },
  station_03_clustering_profiles: {
    icon: 'Users',
    colorClass: 'text-violet-600',
    bgClass: 'bg-violet-50',
  },
  station_04_prediction_engine: {
    icon: 'TrendingUp',
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50',
  },
  station_05_competence_inference: {
    icon: 'Brain',
    colorClass: 'text-purple-600',
    bgClass: 'bg-purple-50',
  },
  station_06_instructional_groups: {
    icon: 'AlertTriangle',
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50',
  },
  station_07_teacher_actions: {
    icon: 'BookOpen',
    colorClass: 'text-sky-600',
    bgClass: 'bg-sky-50',
  },
  station_08_student_views: {
    icon: 'MessageSquare',
    colorClass: 'text-teal-600',
    bgClass: 'bg-teal-50',
  },
  station_09_run_validation: {
    icon: 'CheckCircle2',
    colorClass: 'text-green-600',
    bgClass: 'bg-green-50',
  },
};

/** Derive a 0–100 score from station highlights */
export function deriveStationScore(stationId: string, highlights: Record<string, unknown>): number {
  switch (stationId) {
    case 'station_01_data_intake': {
      const wc = Number(highlights.word_count ?? 0);
      const tot = Number(highlights.time_on_task ?? 0);
      const rev = Number(highlights.revision_frequency ?? 0);
      // Normalize: word_count ~500 ideal, time ~120 min, revision ~3
      const wcScore = Math.min(wc / 500, 1);
      const totScore = Math.min(tot / 120, 1);
      const revScore = Math.min(rev / 3, 1);
      return Math.round((wcScore * 0.5 + totScore * 0.3 + revScore * 0.2) * 100);
    }
    case 'station_02_thresholds_rules': {
      const qpMap: Record<string, number> = { poor: 20, satisfactory: 55, good: 75, excellent: 95 };
      return qpMap[String(highlights.quality_profile ?? 'poor')] ?? 50;
    }
    case 'station_03_clustering_profiles': {
      const profileMap: Record<string, number> = {
        'Strategic Learners - High engagement + good writing': 88,
        'Efficient Learners - Low effort, acceptable results': 65,
        'Engaged but Weak Writers - Good effort, needs support': 55,
        'Disengaged Students - Low participation': 25,
      };
      return profileMap[String(highlights.learner_profile ?? '')] ?? 50;
    }
    case 'station_04_prediction_engine': {
      const score = Number(highlights.predicted_performance_score ?? 0);
      // Score is a raw float; normalize 0–5 → 0–100
      return Math.round(Math.min(Math.max(score / 5, 0), 1) * 100);
    }
    case 'station_05_competence_inference': {
      return Math.round((Number(highlights.avg_competence ?? 0)) * 100);
    }
    case 'station_06_instructional_groups': {
      const riskMap: Record<string, number> = {
        'Low Risk - Maintain and enrich': 88,
        'Lower Risk - Monitor and coach': 72,
        'Moderate Risk - Targeted support needed': 50,
        'High Risk - Urgent support needed': 22,
      };
      return riskMap[String(highlights.risk_group ?? '')] ?? 50;
    }
    case 'station_07_teacher_actions': {
      const priMap: Record<string, number> = { low: 90, medium: 65, high: 40, critical: 15 };
      return priMap[String(highlights.highest_priority ?? 'medium')] ?? 50;
    }
    case 'station_08_student_views': {
      const issueMap: Record<string, number> = {
        NO_ISSUES: 90,
        RUSHED_WRITING: 65,
        DISCOURSE_ORGANIZATION: 50,
        PLANNING_ISSUE: 30,
      };
      return issueMap[String(highlights.primary_issue ?? 'PLANNING_ISSUE')] ?? 50;
    }
    case 'station_09_run_validation': {
      const checks = [
        highlights.student_has_feedback,
        highlights.student_has_prediction,
        highlights.student_has_group_assignment,
      ];
      const passed = checks.filter(Boolean).length;
      return Math.round((passed / checks.length) * 100);
    }
    default:
      return 50;
  }
}

function deriveInsight(stationId: string, highlights: Record<string, unknown>): string {
  switch (stationId) {
    case 'station_01_data_intake':
      return `${highlights.word_count ?? 0} words · ${highlights.time_on_task ?? 0} min on task · ${highlights.revision_frequency ?? 0} revisions`;
    case 'station_02_thresholds_rules':
      return `Quality: ${highlights.quality_profile ?? '—'} · Priority: ${highlights.highest_priority ?? '—'}`;
    case 'station_03_clustering_profiles': {
      const p = String(highlights.learner_profile ?? '').split(' - ');
      return p[1] ?? p[0] ?? 'Profile assigned';
    }
    case 'station_04_prediction_engine':
      return `Predicted score: ${Number(highlights.predicted_performance_score ?? 0).toFixed(2)} · ${highlights.performance_level ?? '—'}`;
    case 'station_05_competence_inference':
      return `Avg competence: ${(Number(highlights.avg_competence ?? 0) * 100).toFixed(1)}% · ${highlights.competence_level ?? '—'}`;
    case 'station_06_instructional_groups':
      return `${highlights.risk_group ?? '—'}`;
    case 'station_07_teacher_actions':
      return `Priority: ${highlights.highest_priority ?? '—'} · ${highlights.performance_level ?? '—'}`;
    case 'station_08_student_views':
      return `Main issue: ${String(highlights.primary_issue ?? '—').replace(/_/g, ' ')}`;
    case 'station_09_run_validation':
      return `Feedback ✓ · Prediction ✓ · Groups ✓`;
    default:
      return 'Analysis complete';
  }
}

import type { StationCard } from './types';

export function enrichStationCards(cards: StationCard[]): EnrichedStationCard[] {
  return cards.map((card) => {
    const meta = STATION_META[card.station_id] ?? {
      icon: 'Activity',
      colorClass: 'text-slate-600',
      bgClass: 'bg-slate-50',
    };
    const score = deriveStationScore(card.station_id, card.highlights as Record<string, unknown>);
    const insight = deriveInsight(card.station_id, card.highlights as Record<string, unknown>);
    return { ...card, score, insight, ...meta };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA  (fallback when public/run_data is unavailable)
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_STUDENTS: StudentIndexEntry[] = [
  {
    student_id: '9250',
    student_name: 'Asmaa Jaadar',
    email: 'asmaa.jaadar@student.univ-temouchent.edu.dz',
    learner_profile: 'Strategic Learners - High engagement + good writing',
    risk_group: 'Low Risk - Maintain and enrich',
    competence_level: 'Developing',
    performance_level: 'Strong',
    primary_issue: 'RUSHED_WRITING',
    profile_path: 'students/9250_jaadar_asmaa/profile.json',
  },
  {
    student_id: '11043',
    student_name: 'Nouria Messaoudi',
    email: 'nouria.messaoudi@univ-temouchent.edu.dz',
    learner_profile: 'Disengaged Students - Low participation',
    risk_group: 'High Risk - Urgent support needed',
    competence_level: 'Beginning',
    performance_level: 'Needs Improvement',
    primary_issue: 'PLANNING_ISSUE',
    profile_path: 'students/11043_MESSAOUDI_Nouria/profile.json',
  },
  {
    student_id: '9177',
    student_name: 'Nourhane Haddouche',
    email: 'nourhane.haddouche@student.univ-temouchent.edu.dz',
    learner_profile: 'Efficient Learners - Low effort, acceptable results',
    risk_group: 'Moderate Risk - Targeted support needed',
    competence_level: 'Developing',
    performance_level: 'Good',
    primary_issue: 'RUSHED_WRITING',
    profile_path: 'students/9177_haddouche_nourhane/profile.json',
  },
];
