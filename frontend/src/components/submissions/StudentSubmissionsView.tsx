import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  FileText,
  Mail,
  GraduationCap,
  Search,
  ChevronRight,
} from 'lucide-react';
import { CircularProgress } from '../ui/CircularProgress';
import {
  listStudentSummaries,
  listSubmissions,
  type StudentSubmissionSummary,
} from '../../services/submissionService';
import type { Submission } from '../../../shared/types';

const STATUS_STYLE: Record<string, string> = {
  submitted: 'bg-blue-50 text-blue-700 ring-blue-200',
  draft: 'bg-amber-50 text-amber-800 ring-amber-200',
  graded: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  notgraded: 'bg-slate-50 text-slate-600 ring-slate-200',
};

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0].toUpperCase()).join('');
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

function colorForScore(p: number) {
  if (p >= 80) return '#10B981';
  if (p >= 65) return '#3B82F6';
  if (p >= 50) return '#F97316';
  return '#EF4444';
}

const SkeletonRow: React.FC = () => (
  <div className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-4">
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 space-y-2">
        <div className="h-4 w-52 rounded bg-slate-100" />
        <div className="h-3 w-36 rounded bg-slate-100" />
        <div className="h-3 w-44 rounded bg-slate-100" />
      </div>
      <div className="h-12 w-12 rounded-full bg-slate-100 shrink-0" />
    </div>
  </div>
);

export const StudentSubmissionsView: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<StudentSubmissionSummary | null>(null);
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!studentId) return;
    let alive = true;
    setIsLoading(true);
    setError(null);

    Promise.all([
      listStudentSummaries().then((list) => list.find((s) => s.studentId === studentId) ?? null),
      listSubmissions({ studentId }),
    ])
      .then(([studentInfo, subs]) => {
        if (!alive) return;
        setStudent(studentInfo);
        setAllSubmissions(subs);
      })
      .catch((e) => {
        if (alive) setError(e instanceof Error ? e.message : 'Failed to load submissions');
      })
      .finally(() => alive && setIsLoading(false));

    return () => { alive = false; };
  }, [studentId]);

  const submissions = useMemo(() => {
    const search = q.trim().toLowerCase();
    if (!search) return allSubmissions;
    return allSubmissions.filter((s) =>
      `${s.title} ${s.course} ${s.status}`.toLowerCase().includes(search)
    );
  }, [allSubmissions, q]);

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/submissions')}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          All Students
        </button>
      </div>

      {/* Student profile header */}
      {student ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            {/* Avatar */}
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradient(student.studentName)} text-base font-bold text-white shadow-md`}
            >
              {initials(student.studentName)}
            </div>

            {/* Name + contact */}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                {student.studentName}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {student.email}
                </span>
                <span className="inline-flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                  {student.course}
                </span>
              </div>
            </div>

            {/* Average score ring */}
            <div className="shrink-0 flex flex-col items-center gap-1">
              <CircularProgress
                value={student.avgScorePct}
                size={58}
                stroke={5}
                color={colorForScore(student.avgScorePct)}
              />
              <span className="text-[10px] font-medium text-slate-400">Avg Score</span>
            </div>
          </div>

          {/* Summary stats */}
          <div className="mt-4 flex flex-wrap items-center gap-6 border-t border-slate-100 pt-4 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-slate-400" />
              <strong className="font-semibold text-slate-900">{student.totalSubmissions}</strong>
              {student.totalSubmissions === 1 ? ' submission' : ' submissions'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-slate-400" />
              Last active:{' '}
              <strong className="font-medium text-slate-700">
                {new Date(student.lastSubmissionAt).toLocaleDateString()}
              </strong>
            </span>
          </div>
        </div>
      ) : !isLoading && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Student information unavailable.</p>
        </div>
      )}

      {/* Submissions section */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Submissions</h2>
          <p className="text-sm text-slate-500">
            Click any submission to view the full AI analysis.
          </p>
        </div>
        {!isLoading && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {submissions.length} {submissions.length === 1 ? 'submission' : 'submissions'}
          </span>
        )}
      </div>

      {/* Search within student submissions */}
      {allSubmissions.length > 3 && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search submissions…"
            className="w-full rounded-xl border border-slate-200/80 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-blue-500/20 focus:border-blue-200 focus:ring-4"
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Submissions list */}
      <div className="grid gap-3 lg:grid-cols-2">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
          : submissions.length === 0
          ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-10 text-center text-sm text-slate-500 lg:col-span-2">
              No submissions found{q ? ' matching your search' : ' for this student'}.
            </div>
          )
          : submissions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => navigate(`/submissions/${s.id}`)}
              className="group rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-700">
                      {s.title}
                    </p>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${STATUS_STYLE[s.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'}`}
                    >
                      {String(s.status).replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {new Date(s.submittedAt).toLocaleString()}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                      {s.course}
                    </span>
                  </div>

                  {s.aiInsight && (
                    <p className="mt-2 line-clamp-2 text-xs text-slate-500">{s.aiInsight}</p>
                  )}
                </div>

                {/* Score + chevron */}
                <div className="flex shrink-0 items-center gap-2">
                  <CircularProgress
                    value={s.overallScorePct}
                    size={52}
                    stroke={5}
                    color={colorForScore(s.overallScorePct)}
                  />
                  <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-400" />
                </div>
              </div>
            </button>
          ))}
      </div>
    </div>
  );
};

export default StudentSubmissionsView;
