import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Download,
  FileText,
  Eye,
  ChevronRight,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { CircularProgress } from '../ui/CircularProgress';
import { listFinalReports } from '../../services/reportService';
import { useReportStore } from '../../store/reportStore';
import type { FinalReport, ReportStatus } from '../../../../shared/types';

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ReportStatus,
  { label: string; icon: React.ElementType; pill: string }
> = {
  ready: {
    label: 'Ready',
    icon: CheckCircle2,
    pill: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  draft: {
    label: 'Draft',
    icon: Clock,
    pill: 'bg-amber-50 text-amber-700 ring-amber-200',
  },
  needs_review: {
    label: 'Needs Review',
    icon: AlertCircle,
    pill: 'bg-rose-50 text-rose-700 ring-rose-200',
  },
};

// ── Avatar helpers ────────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0].toUpperCase())
    .join('');
}

function avatarGradient(name: string) {
  const palettes = [
    'from-blue-500 to-violet-500',
    'from-emerald-500 to-teal-500',
    'from-rose-500 to-pink-500',
    'from-amber-500 to-orange-500',
    'from-indigo-500 to-blue-600',
    'from-cyan-500 to-sky-600',
    'from-purple-500 to-fuchsia-500',
    'from-lime-500 to-green-600',
  ];
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % palettes.length;
  return palettes[idx];
}

// ── Skeleton row ──────────────────────────────────────────────────────────────

const SkeletonRow: React.FC = () => (
  <tr className="animate-pulse border-b border-slate-100">
    <td className="px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-slate-100 shrink-0" />
        <div className="space-y-1.5">
          <div className="h-3.5 w-36 rounded bg-slate-100" />
          <div className="h-3 w-44 rounded bg-slate-100" />
        </div>
      </div>
    </td>
    <td className="px-4 py-3"><div className="h-3.5 w-28 rounded bg-slate-100" /></td>
    <td className="px-4 py-3"><div className="h-3.5 w-10 rounded bg-slate-100" /></td>
    <td className="px-4 py-3"><div className="h-9 w-9 rounded-full bg-slate-100 mx-auto" /></td>
    <td className="px-4 py-3"><div className="h-6 w-24 rounded-full bg-slate-100" /></td>
    <td className="px-4 py-3"><div className="h-3.5 w-20 rounded bg-slate-100" /></td>
    <td className="px-4 py-3"><div className="h-8 w-32 rounded-lg bg-slate-100" /></td>
  </tr>
);

// ── Main component ────────────────────────────────────────────────────────────

export const FinalReportsList: React.FC = () => {
  const navigate = useNavigate();
  const { getEdits } = useReportStore();

  const [allReports, setAllReports] = useState<FinalReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [courseFilter, setCourseFilter] = useState('');

  useEffect(() => {
    let alive = true;
    listFinalReports()
      .then((data) => { if (alive) setAllReports(data); })
      .catch((e) => { if (alive) setError(e instanceof Error ? e.message : 'Failed to load'); })
      .finally(() => alive && setIsLoading(false));
    return () => { alive = false; };
  }, []);

  // Merge in any teacher-saved status overrides
  const reports = useMemo(() => {
    const search = q.trim().toLowerCase();
    return allReports
      .map((r) => {
        const edit = getEdits(r.studentId);
        return edit ? { ...r, status: edit.status } : r;
      })
      .filter((r) => {
        if (search && !`${r.studentName} ${r.email} ${r.course}`.toLowerCase().includes(search))
          return false;
        if (courseFilter && r.course !== courseFilter) return false;
        return true;
      });
  }, [allReports, q, courseFilter, getEdits]);

  const courses = useMemo(
    () => Array.from(new Set(allReports.map((r) => r.course).filter(Boolean))).sort(),
    [allReports]
  );

  // Summary stats
  const stats = useMemo(() => {
    const total = allReports.length;
    const ready = allReports.filter((r) => {
      const edit = getEdits(r.studentId);
      return (edit?.status ?? r.status) === 'ready';
    }).length;
    const draft = allReports.filter((r) => {
      const edit = getEdits(r.studentId);
      return (edit?.status ?? r.status) === 'draft';
    }).length;
    const needs = total - ready - draft;
    return { total, ready, draft, needs };
  }, [allReports, getEdits]);

  const handleExportAll = () => {
    const data = reports.map((r) => ({
      name: r.studentName,
      email: r.email,
      course: r.course,
      score: r.overallScorePct,
      status: r.status,
      totalSubmissions: r.totalSubmissions,
      lastUpdated: r.lastUpdatedAt,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `final_reports_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Final Reports
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Comprehensive AI-powered writing assessments ready for teacher review and export.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportAll}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/30"
        >
          <Download className="h-4 w-4" />
          Export All
        </button>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Students', value: stats.total, color: 'text-slate-900', bg: 'bg-white' },
          { label: 'Ready', value: stats.ready, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Draft', value: stats.draft, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'Needs Review', value: stats.needs, color: 'text-rose-700', bg: 'bg-rose-50' },
        ].map((s) => (
          <div
            key={s.label}
            className={`${s.bg} flex items-center gap-3 rounded-2xl border border-slate-200/80 p-4 shadow-sm`}
          >
            <Users className="h-5 w-5 shrink-0 text-slate-400" />
            <div>
              <p className={`text-xl font-bold ${s.color}`}>{isLoading ? '—' : s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by student name or email…"
            className="w-full rounded-xl border border-slate-200/80 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-blue-500/20 focus:border-blue-200 focus:ring-4"
          />
        </div>

        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-200"
        >
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {!isLoading && (
          <span className="ml-auto text-xs text-slate-500">
            {reports.length} {reports.length === 1 ? 'student' : 'students'}
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                {['Student', 'Course', 'Submissions', 'AI Score', 'Status', 'Last Updated', 'Actions'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                : reports.length === 0
                ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">
                      <FileText className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                      No reports match your filters.
                    </td>
                  </tr>
                )
                : reports.map((report) => {
                  const edit = getEdits(report.studentId);
                  const effectiveStatus = edit?.status ?? report.status;
                  const sc = STATUS_CONFIG[effectiveStatus] ?? STATUS_CONFIG.draft;
                  const StatusIcon = sc.icon;

                  return (
                    <tr
                      key={report.studentId}
                      className="group border-b border-slate-100 transition-colors last:border-0 hover:bg-blue-50/30"
                    >
                      {/* Student */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradient(report.studentName)} text-xs font-bold text-white shadow-sm`}
                          >
                            {initials(report.studentName)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">
                              {report.studentName}
                            </p>
                            <p className="truncate text-xs text-slate-500">{report.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="px-4 py-3 text-slate-600">{report.course}</td>

                      {/* Submissions */}
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {report.totalSubmissions}
                      </td>

                      {/* Score ring */}
                      <td className="px-4 py-3">
                        <CircularProgress value={report.overallScorePct} size={44} stroke={4} />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${sc.pill}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {sc.label}
                        </span>
                      </td>

                      {/* Last updated */}
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {new Date(report.lastUpdatedAt).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/reports/final/${report.studentId}`)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View Report
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/reports/final/${report.studentId}?pdf=1`)
                            }
                            title={
                              effectiveStatus !== 'ready'
                                ? 'Mark report as Ready before exporting PDF'
                                : 'Generate PDF'
                            }
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                              effectiveStatus === 'ready'
                                ? 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100'
                                : 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
                            }`}
                          >
                            <Download className="h-3.5 w-3.5" />
                            PDF
                          </button>
                          <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                      </td>
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

export default FinalReportsList;
