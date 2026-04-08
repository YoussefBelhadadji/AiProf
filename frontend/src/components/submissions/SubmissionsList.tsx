import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Mail, GraduationCap, FileText, Calendar, ChevronRight } from 'lucide-react';
import { CircularProgress } from '../ui/CircularProgress';
import { listStudentSummaries, type StudentSubmissionSummary } from '../../services/submissionService';

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

const SkeletonCard: React.FC = () => (
  <div className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5">
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 rounded-full bg-slate-100 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-40 rounded bg-slate-100" />
        <div className="h-3 w-52 rounded bg-slate-100" />
        <div className="h-3 w-32 rounded bg-slate-100" />
      </div>
      <div className="h-14 w-14 rounded-full bg-slate-100 shrink-0" />
    </div>
    <div className="mt-4 flex gap-4 border-t border-slate-100 pt-3">
      <div className="h-3 w-24 rounded bg-slate-100" />
      <div className="h-3 w-32 rounded bg-slate-100" />
    </div>
  </div>
);

export const SubmissionsList: React.FC = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [allStudents, setAllStudents] = useState<StudentSubmissionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setError(null);
    listStudentSummaries()
      .then((data) => { if (alive) setAllStudents(data); })
      .catch((e) => { if (alive) setError(e instanceof Error ? e.message : 'Failed to load students'); })
      .finally(() => alive && setIsLoading(false));
    return () => { alive = false; };
  }, []);

  const students = useMemo(() => {
    const search = q.trim().toLowerCase();
    if (!search) return allStudents;
    return allStudents.filter((s) =>
      `${s.studentName} ${s.email} ${s.course}`.toLowerCase().includes(search)
    );
  }, [allStudents, q]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Submissions</h1>
          <p className="mt-1 text-sm text-slate-500">
            Select a student to review their individual submissions and AI analysis.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
          <Users className="h-4 w-4 text-slate-400" />
          {isLoading ? 'Loading…' : `${students.length} students`}
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, email, or course…"
          className="w-full rounded-xl border border-slate-200/80 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-blue-500/20 focus:border-blue-200 focus:ring-4"
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Students grid */}
      <div className="grid gap-3 lg:grid-cols-2">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : students.length === 0
          ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center text-sm text-slate-500 lg:col-span-2">
              No students found matching your search.
            </div>
          )
          : students.map((student) => (
            <button
              key={student.studentId}
              type="button"
              onClick={() => navigate(`/submissions/student/${student.studentId}`)}
              className="group rounded-2xl border border-slate-200/80 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradient(student.studentName)} text-sm font-bold text-white shadow-sm`}
                >
                  {initials(student.studentName)}
                </div>

                {/* Student info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-700">
                    {student.studentName}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    {student.email}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
                    <GraduationCap className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    {student.course}
                  </p>
                </div>

                {/* Average score ring */}
                <div className="shrink-0 flex flex-col items-center gap-0.5">
                  <CircularProgress value={student.avgScorePct} size={54} stroke={5} />
                  <span className="text-[10px] font-medium text-slate-400">Avg Score</span>
                </div>

                {/* Chevron */}
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-400" />
              </div>

              {/* Footer stats */}
              <div className="mt-4 flex flex-wrap items-center gap-5 border-t border-slate-100 pt-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  <strong className="font-semibold text-slate-700">{student.totalSubmissions}</strong>
                  {student.totalSubmissions === 1 ? ' submission' : ' submissions'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Last: <span className="text-slate-600">{new Date(student.lastSubmissionAt).toLocaleDateString()}</span>
                </span>
              </div>
            </button>
          ))}
      </div>
    </div>
  );
};

export default SubmissionsList;
