/**
 * WriteLens – LearnersList Page  (/students)
 *
 * Displays all 65 students from the AI run with:
 *  - Searchable, filterable table
 *  - Risk badge, circular score, profile quick-stats
 *  - Click → navigate to /students/:id
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Users, AlertTriangle, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { CircularProgress } from '../../components/ui/CircularProgress';
import { useLearnerStore } from './useLearnerStore';
import { enrichLearner } from './learnerLoader';
import type { LearnerRow } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const RISK_BADGE: Record<number, { label: string; cls: string }> = {
  1: { label: 'Low Risk',      cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  2: { label: 'Monitor',       cls: 'bg-sky-50 text-sky-700 ring-sky-200' },
  3: { label: 'Moderate',      cls: 'bg-amber-50 text-amber-700 ring-amber-200' },
  4: { label: 'High Risk',     cls: 'bg-red-50 text-red-700 ring-red-200' },
};

const COMPETENCE_BADGE: Record<string, string> = {
  Beginning:  'bg-red-50 text-red-600',
  Developing: 'bg-blue-50 text-blue-600',
  Advanced:   'bg-emerald-50 text-emerald-600',
};

const AVATAR_COLORS = [
  'from-blue-400 to-blue-600',
  'from-violet-400 to-violet-600',
  'from-emerald-400 to-emerald-600',
  'from-amber-400 to-orange-500',
  'from-pink-400 to-rose-500',
  'from-sky-400 to-cyan-500',
];

function avatarColor(id: string): string {
  const n = parseInt(id, 10) || 0;
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

type SortKey = 'student_name' | 'overallScore' | 'riskSeverity' | 'competence_level';
type SortDir = 'asc' | 'desc';

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON ROW
// ─────────────────────────────────────────────────────────────────────────────

const SkeletonRow: React.FC = () => (
  <tr className="animate-pulse border-b border-slate-100">
    {[...Array(6)].map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-4 rounded-md bg-slate-100" style={{ width: `${60 + (i * 13) % 40}%` }} />
      </td>
    ))}
  </tr>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export const LearnersList: React.FC = () => {
  const navigate = useNavigate();
  const { studentIndex, isLoadingIndex, indexError, loadIndex, selectStudent } = useLearnerStore();

  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<number | null>(null);
  const [competenceFilter, setCompetenceFilter] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('student_name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  useEffect(() => { loadIndex(); }, [loadIndex]);

  // Enrich + sort + filter
  const rows = useMemo<LearnerRow[]>(() => {
    let enriched = studentIndex.map(enrichLearner);

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      enriched = enriched.filter(
        (r) =>
          r.student_name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.learner_profile.toLowerCase().includes(q),
      );
    }

    // Risk filter
    if (riskFilter !== null) {
      enriched = enriched.filter((r) => r.riskSeverity === riskFilter);
    }

    // Competence filter
    if (competenceFilter !== null) {
      enriched = enriched.filter((r) => r.competence_level === competenceFilter);
    }

    // Sort
    enriched.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'student_name') cmp = a.student_name.localeCompare(b.student_name);
      else if (sortKey === 'overallScore') cmp = a.overallScore - b.overallScore;
      else if (sortKey === 'riskSeverity') cmp = a.riskSeverity - b.riskSeverity;
      else if (sortKey === 'competence_level') cmp = a.competence_level.localeCompare(b.competence_level);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return enriched;
  }, [studentIndex, search, riskFilter, competenceFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronsUpDown className="ml-1 inline h-3.5 w-3.5 text-slate-300" />;
    return sortDir === 'asc'
      ? <ChevronUp className="ml-1 inline h-3.5 w-3.5 text-blue-500" />
      : <ChevronDown className="ml-1 inline h-3.5 w-3.5 text-blue-500" />;
  }

  function openProfile(row: LearnerRow) {
    selectStudent(row.student_id);
    navigate(`/students/${row.student_id}`);
  }

  // Summary stats
  const stats = useMemo(() => {
    const enriched = studentIndex.map(enrichLearner);
    return {
      total: enriched.length,
      highRisk: enriched.filter((r) => r.riskSeverity === 4).length,
      avgScore: enriched.length
        ? Math.round(enriched.reduce((s, r) => s + r.overallScore, 0) / enriched.length)
        : 0,
      advanced: enriched.filter((r) => r.competence_level === 'Advanced').length,
    };
  }, [studentIndex]);

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Learners</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            AI-analysed cohort · Run 2026-04-08
          </p>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Learners', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'High Risk', value: stats.highRisk, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Avg AI Score', value: `${stats.avgScore}%`, icon: null, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Advanced', value: stats.advanced, icon: null, color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{s.label}</p>
            <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Search + Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex min-w-[220px] flex-1 items-center">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email or profile…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Risk filter */}
        <div className="flex items-center gap-1">
          <Filter className="h-4 w-4 text-slate-400" />
          {[null, 4, 3, 2, 1].map((v) => (
            <button
              key={String(v)}
              onClick={() => setRiskFilter(v === riskFilter ? null : v)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ring-1 transition-colors ${
                riskFilter === v
                  ? 'bg-blue-600 text-white ring-blue-600'
                  : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {v === null ? 'All' : RISK_BADGE[v].label}
            </button>
          ))}
        </div>

        {/* Competence filter */}
        <div className="flex items-center gap-1">
          {[null, 'Beginning', 'Developing', 'Advanced'].map((v) => (
            <button
              key={String(v)}
              onClick={() => setCompetenceFilter(v === competenceFilter ? null : v)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ring-1 transition-colors ${
                competenceFilter === v
                  ? 'bg-violet-600 text-white ring-violet-600'
                  : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {v === null ? 'All Levels' : v}
            </button>
          ))}
        </div>

        <p className="ml-auto text-sm text-slate-400">{rows.length} learners</p>
      </div>

      {/* ── Error ── */}
      {indexError && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {indexError}
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th
                  className="cursor-pointer px-4 py-3 text-left font-medium text-slate-500 hover:text-slate-900"
                  onClick={() => toggleSort('student_name')}
                >
                  Student <SortIcon col="student_name" />
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Profile</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Risk</th>
                <th
                  className="cursor-pointer px-4 py-3 text-left font-medium text-slate-500 hover:text-slate-900"
                  onClick={() => toggleSort('competence_level')}
                >
                  Competence <SortIcon col="competence_level" />
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-center font-medium text-slate-500 hover:text-slate-900"
                  onClick={() => toggleSort('overallScore')}
                >
                  AI Score <SortIcon col="overallScore" />
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingIndex
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                : rows.length === 0
                ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400">
                      No learners match your search
                    </td>
                  </tr>
                )
                : rows.map((row) => {
                  const risk = RISK_BADGE[row.riskSeverity];
                  const cmpCls = COMPETENCE_BADGE[row.competence_level] ?? 'bg-slate-50 text-slate-600';
                  return (
                    <tr
                      key={row.student_id}
                      onClick={() => openProfile(row)}
                      className="cursor-pointer transition-colors hover:bg-blue-50/40"
                    >
                      {/* Avatar + name */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarColor(row.student_id)} text-xs font-bold text-white shadow-sm`}
                          >
                            {row.initials}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">{row.student_name}</p>
                            <p className="truncate text-xs text-slate-400">{row.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Learner profile */}
                      <td className="px-4 py-3.5">
                        <p className="max-w-[200px] truncate text-xs text-slate-600">
                          {row.learner_profile.split(' - ')[1] ?? row.learner_profile}
                        </p>
                        <p className="text-xs text-slate-400">{row.courseLabel}</p>
                      </td>

                      {/* Risk badge */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ring-1 ${risk.cls}`}>
                          {risk.label}
                        </span>
                      </td>

                      {/* Competence */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${cmpCls}`}>
                          {row.competence_level}
                        </span>
                      </td>

                      {/* Circular score */}
                      <td className="px-4 py-3.5 text-center">
                        <CircularProgress value={row.overallScore} size={48} stroke={5} />
                      </td>

                      {/* Performance level */}
                      <td className="px-4 py-3.5 text-slate-600">{row.performance_level}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
