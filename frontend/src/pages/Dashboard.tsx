import React, { useMemo, useState, useEffect } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Users,
  CalendarCheck,
  FileStack,
  Award,
  AlertTriangle,
  TrendingUp,
  AlertCircle,
  Loader,
} from 'lucide-react';
import { getDashboardStats } from '../services/dashboardService';
import type { DashboardStats } from '../../../shared/types';

type RingProps = {
  pct: number;
  color: string;
  size?: number;
  stroke?: number;
};

const RingStat: React.FC<RingProps> = ({ pct, color, size = 112, stroke = 9 }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, pct));
  const offset = c * (1 - clamped / 100);

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90" aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        className="transition-[stroke-dashoffset] duration-700 ease-out"
      />
    </svg>
  );
};

const statIcon = [
  Users,
  CalendarCheck,
  FileStack,
  Award,
  AlertTriangle,
  TrendingUp,
] as const;

export const Dashboard: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const stats = await getDashboardStats();
        setDashboardStats(stats);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load dashboard statistics'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  // Map real stats to display format
  const stats = useMemo(() => {
    if (!dashboardStats) return [];
    
    return [
      {
        value: dashboardStats.totalStudents.toString(),
        label: 'Total Learners',
        sub: 'Enrolled this term',
        ringPct: Math.min(100, (dashboardStats.totalStudents / 300) * 100),
        color: '#3B82F6',
      },
      {
        value: `${dashboardStats.participationRate}%`,
        label: 'Average Attendance',
        sub: 'Weekly participation',
        ringPct: dashboardStats.participationRate,
        color: '#10B981',
      },
      {
        value: dashboardStats.recentSubmissionsCount.toString(),
        label: 'Essays Submitted',
        sub: 'Last 30 days',
        ringPct: Math.min(100, (dashboardStats.recentSubmissionsCount / 50) * 100),
        color: '#8B5CF6',
      },
      {
        value: `${dashboardStats.avgWritingScore}/100`,
        label: 'Average Writing Score',
        sub: 'Across all drafts',
        ringPct: dashboardStats.avgWritingScore,
        color: '#F97316',
      },
      {
        value: dashboardStats.interventionCount.toString(),
        label: 'Needing Intervention',
        sub: 'Priority follow-up',
        ringPct: Math.min(100, (dashboardStats.interventionCount / 30) * 100),
        color: '#EA580C',
      },
      {
        value: `${dashboardStats.avgImprovementPct > 0 ? '+' : ''}${dashboardStats.avgImprovementPct}%`,
        label: 'Average Improvement',
        sub: 'Quality trend',
        ringPct: Math.min(100, Math.max(0, (dashboardStats.avgImprovementPct + 10) * 5)),
        color: '#22D3EE',
      },
    ];
  }, [dashboardStats]);

  // Use real trend data or empty array while loading
  const trendData = useMemo(() => {
    return dashboardStats?.trendChart ?? [];
  }, [dashboardStats]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          WriteLens overview — writing quality, participation, and recent submissions.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-start gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-700 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-900">Unable to load live data</h3>
            <p className="mt-1 text-sm text-amber-800">{error}</p>
            <p className="mt-2 text-xs text-amber-700">Showing cached or fallback data if available.</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !dashboardStats && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-600">
            <Loader className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading dashboard statistics...</span>
          </div>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.length === 0 && !isLoading ? (
          <div className="col-span-full text-center py-8 text-slate-500">
            No data available
          </div>
        ) : (
          stats.map((s, i) => {
            const Icon = statIcon[i] ?? Users;
            return (
              <article
                key={s.label}
                className={`flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white px-5 py-6 text-center shadow-sm shadow-slate-200/50 ${
                  isLoading ? 'opacity-60' : ''
                }`}
              >
                <span
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-600"
                  style={{ color: s.color }}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{s.label}</h2>
                <div className="relative mt-4 flex items-center justify-center">
                  <RingStat pct={s.ringPct} color={s.color} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-1">
                    <span className="max-w-22 text-center text-lg font-semibold leading-tight tracking-tight text-slate-900 sm:text-xl">
                      {s.value}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">{s.sub}</p>
              </article>
            );
          })
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_minmax(280px,400px)] xl:items-start">
        <article className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6 ${
          isLoading ? 'opacity-60' : ''
        }`}>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Writing Quality Trend</h2>
              <p className="text-sm text-slate-500">{trendData.length > 0 ? 'Monthly average' : 'Loading...'}</p>
            </div>
          </div>
          <div className="mt-4 h-70 w-full min-w-0">
            {trendData.length === 0 && !isLoading ? (
              <div className="flex h-full items-center justify-center text-slate-400">
                <p className="text-sm">No trend data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="wlScoreFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="wlScoreStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[50, 100]}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 40px rgba(15,23,42,0.08)',
                    }}
                    formatter={(value: any) => {
                      const v = typeof value === 'number' ? value : 0;
                      return [`${v}/100`, 'Avg. score'];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="avgScore"
                    stroke="url(#wlScoreStroke)"
                    strokeWidth={2.5}
                    fill="url(#wlScoreFill)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6 ${
          isLoading ? 'opacity-60' : ''
        }`}>
          <h2 className="text-lg font-semibold text-slate-900">Recent Submissions</h2>
          <p className="text-sm text-slate-500">Latest essays from your cohort</p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full min-w-130 text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Learner</th>
                  <th className="px-4 py-3">Assignment</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Stage</th>
                </tr>
              </thead>
              <tbody>
                {!dashboardStats || dashboardStats.recentSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                      {isLoading ? 'Loading submissions...' : 'No recent submissions available'}
                    </td>
                  </tr>
                ) : (
                  dashboardStats.recentSubmissions.map((row: any) => (
                    <tr key={`${row.studentId}-${row.submittedAt}-${row.assignmentName}`} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900 truncate">{row.studentName}</td>
                      <td className="max-w-50 truncate px-4 py-3 text-slate-600" title={row.assignmentName}>
                        {row.assignmentName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                        {new Date(row.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-medium tabular-nums text-slate-900">{row.qualityScore}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700">
                          {row.stageLabel.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
};
