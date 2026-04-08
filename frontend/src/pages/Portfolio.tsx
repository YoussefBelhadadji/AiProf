import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Loader2, Search, TrendingUp, TrendingDown, Minus, BookOpen, Clock } from 'lucide-react';
import { CircularProgress } from '../components/ui/CircularProgress';
import { getPortfolioSummary, listPortfolioStudents } from '../services/portfolioService';
import type { PortfolioSummary } from '../../../shared/types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0].toUpperCase()).join('');
}

export const Portfolio: React.FC = () => {
  const [students, setStudents] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    listPortfolioStudents().then((s) => {
      if (!alive) return;
      setStudents(s);
      setSelectedId(s[0]?.id ?? '');
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    if (!selectedId) return;
    setIsLoading(true);
    setError(null);
    getPortfolioSummary(selectedId)
      .then((x) => alive && setSummary(x))
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'Failed to load portfolio'))
      .finally(() => alive && setIsLoading(false));
    return () => { alive = false; };
  }, [selectedId]);

  const selectedName = students.find((s) => s.id === selectedId)?.name ?? summary?.studentName ?? '';
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => (`${s.name} ${s.id}`).toLowerCase().includes(q));
  }, [students, query]);

  const trendIcon = summary?.trend === 'improving'
    ? <TrendingUp className="h-4 w-4 text-emerald-600" />
    : summary?.trend === 'declining'
      ? <TrendingDown className="h-4 w-4 text-rose-600" />
      : <Minus className="h-4 w-4 text-slate-400" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Portfolio</h1>
        <p className="mt-1 text-sm text-slate-500">High-level progress overview for one learner at a time.</p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Student selector</p>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-left shadow-sm hover:bg-slate-50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-semibold text-white">
                  {initials(selectedName || 'Student')}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{selectedName || 'Select a learner'}</p>
                  <p className="truncate text-xs text-slate-500">{selectedId ? `ID: ${selectedId}` : '—'}</p>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {open && (
              <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl">
                <div className="border-b border-slate-100 p-3">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search learner…"
                      className="w-full rounded-xl border border-slate-200/80 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-200 focus:bg-white"
                    />
                  </div>
                </div>
                <div className="max-h-72 overflow-auto p-2">
                  {filtered.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(s.id);
                        setOpen(false);
                        setQuery('');
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                        s.id === selectedId ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                        {initials(s.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{s.name}</p>
                        <p className="truncate text-xs text-slate-500">{s.id}</p>
                      </div>
                    </button>
                  ))}
                  {filtered.length === 0 && (
                    <div className="p-6 text-center text-sm text-slate-500">No matches.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 text-sm text-slate-600">
            {trendIcon}
            <span className="font-medium">{summary?.trend ?? '—'}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      )}

      {isLoading || !summary ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading portfolio…
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 lg:grid-cols-4">
            <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Overall writing score</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.overallScorePct}%</p>
                  <p className="mt-1 text-sm text-slate-500">{summary.totalSubmissions} submissions • last active {summary.lastActiveAt ? new Date(summary.lastActiveAt).toLocaleDateString() : '—'}</p>
                </div>
                <CircularProgress value={summary.overallScorePct} size={84} stroke={7} />
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Avg improvement</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.avgImprovementPct >= 0 ? `+${summary.avgImprovementPct}%` : `${summary.avgImprovementPct}%`}</p>
              <p className="mt-1 text-sm text-slate-500">Trend vs. start point</p>
            </article>

            <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total essays</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.metrics.totalEssays}</p>
              <p className="mt-1 text-sm text-slate-500">Non-empty submissions</p>
            </article>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_420px] xl:items-start">
            <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Writing Score Evolution Over Time</h2>
                  <p className="text-sm text-slate-500">Across all submissions</p>
                </div>
              </div>
              <div className="mt-4 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={summary.evolution} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="t" hide />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                    <Tooltip formatter={(v: any) => {
                      const val = typeof v === 'number' ? v : 0;
                      return [`${val}%`, 'Score'];
                    }} />
                    <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
              <h2 className="text-lg font-semibold text-slate-900">Recent submissions</h2>
              <p className="text-sm text-slate-500">Last 5 items</p>
              <div className="mt-4 space-y-2">
                {summary.recentSubmissions.length === 0 ? (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                    No recent submissions available.
                  </div>
                ) : summary.recentSubmissions.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{s.title}</p>
                      <p className="mt-0.5 inline-flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="h-4 w-4" /> {new Date(s.submittedAt).toLocaleDateString()}
                        <span className="inline-flex items-center gap-1"><BookOpen className="h-4 w-4" /> {s.course}</span>
                      </p>
                    </div>
                    <CircularProgress value={s.overallScorePct} size={42} stroke={4} />
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">AI Stations Overview</h2>
                <p className="text-sm text-slate-500">Average performance per station</p>
              </div>
              <div className="text-xs text-slate-400">clicking stations can be expanded later</div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {summary.stationsAverage.map((st: any) => (
                <div key={st.id} className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{st.name}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{st.insight}</p>
                  </div>
                  <CircularProgress value={st.scorePct} size={44} stroke={4} />
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-emerald-900">Strengths</h3>
              <ul className="mt-3 space-y-2 text-sm text-emerald-900/80">
                {(summary.strengths.length ? summary.strengths : ['No strengths extracted yet.']).map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </article>
            <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-amber-900">Growth areas</h3>
              <ul className="mt-3 space-y-2 text-sm text-amber-900/80">
                {(summary.growthAreas.length ? summary.growthAreas : ['No growth areas extracted yet.']).map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </article>
          </section>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
