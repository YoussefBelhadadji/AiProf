import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, BookOpen, BrainCircuit, CheckCircle2, Database, Loader2, RefreshCw, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { BarChart, Bar, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuthStore } from '../state/authStore';
import { useStudyScopeStore, type TeacherStudyCase } from '../state/studyScope';

type StatCard = {
  label: string;
  value: number | string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: 'lav' | 'teal' | 'amber' | 'sky';
};

type PipelineStep = {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  status: string;
};

const API_BASE = (import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://127.0.0.1:5000' : '')).replace(/\/$/, '');

export const Dashboard: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const cases = useStudyScopeStore((state) => state.cases);

  const [apiSummary, setApiSummary] = useState<{ totalStudents: number; totalMetricsAnalyzed: number; systemPrecision: number; totalRulesApplied: number } | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const selectedCase: TeacherStudyCase | null = cases[0] ?? null;
  const pendingReviews = cases.filter((studyCase) => studyCase.meta.ungradedAssignments > 0);
  const verifiedCases = cases.filter((studyCase) => studyCase.meta.isVerified);

  const refreshSummary = async () => {
    setIsSyncing(true);
    try {
      if (!token) {
        return;
      }

      const response = await fetch(`${API_BASE}/api/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      const summary = result?.data?.summary;

      if (summary) {
        setApiSummary({
          totalStudents: Number(summary.totalStudents) || 0,
          totalMetricsAnalyzed: Number(summary.totalMetricsAnalyzed) || 0,
          systemPrecision: Number(summary.systemPrecision) || 0,
          totalRulesApplied: Number(summary.totalRulesApplied) || 0,
        });
      }

      setLastSynced(new Date());
    } catch (error) {
      console.error('Failed to refresh dashboard summary:', error);
      setLastSynced(new Date());
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    void refreshSummary();
  }, [token]);

  const liveTotals = {
    totalStudents: apiSummary?.totalStudents ?? cases.length,
    totalMetricsAnalyzed: apiSummary?.totalMetricsAnalyzed ?? 0,
    systemPrecision: apiSummary?.systemPrecision ?? 0,
    totalRulesApplied: apiSummary?.totalRulesApplied ?? pendingReviews.length,
  };

  const stats: StatCard[] = [
    {
      label: 'Imported students',
      value: liveTotals.totalStudents,
      detail: 'From Moodle logs, rubrics, essays, and messages',
      icon: Users,
      tone: 'lav',
    },
    {
      label: 'Pipeline coverage',
      value: liveTotals.totalMetricsAnalyzed,
      detail: 'Descriptive, correlation, clustering, RF, Bayesian',
      icon: BarChart3,
      tone: 'sky',
    },
    {
      label: 'Review queue',
      value: pendingReviews.length,
      detail: 'Draft feedback waiting for teacher approval',
      icon: ShieldCheck,
      tone: 'amber',
    },
    {
      label: 'System precision',
      value: `${liveTotals.systemPrecision}%`,
      detail: 'Latest validated model score',
      icon: CheckCircle2,
      tone: 'teal',
    },
  ];

  const workflowSteps: PipelineStep[] = [
    {
      title: 'Import data',
      description: 'Bring in Moodle logs, rubrics, essays, and messages.',
      href: '/import',
      icon: Database,
      status: cases.length > 0 ? 'Ready' : 'Start here',
    },
    {
      title: 'Run analysis',
      description: 'Launch the model pipeline and generate analytics.',
      href: '/pipeline',
      icon: BrainCircuit,
      status: cases.length > 0 ? 'Ready to run' : 'Waiting on data',
    },
    {
      title: 'Inspect students',
      description: 'Open cards and individual profile evidence.',
      href: '/students',
      icon: Users,
      status: selectedCase ? 'Available' : 'No cases loaded',
    },
    {
      title: 'Approve feedback',
      description: 'Review AI drafts before they reach students.',
      href: selectedCase ? `/teacher-decision/${selectedCase.student.student_id}` : '/students',
      icon: BookOpen,
      status: pendingReviews.length > 0 ? `${pendingReviews.length} waiting` : 'Clear',
    },
    {
      title: 'Track growth',
      description: 'Monitor longitudinal progress and revision uptake over time.',
      href: '/reports',
      icon: Sparkles,
      status: cases.length > 0 ? 'Tracking' : 'Pending',
    },
  ];

  const studentChartData = useMemo(() => {
    return cases
      .slice()
      .sort((left, right) => Number(right.student.total_score || 0) - Number(left.student.total_score || 0))
      .slice(0, 8)
      .map((studyCase, index) => ({
        name: studyCase.meta.studentName.split(' ')[0],
        score: Number(studyCase.student.total_score || 0),
        fill: index === 0 ? 'var(--lav)' : index < 3 ? 'var(--teal)' : 'rgba(148,163,184,0.7)',
      }));
  }, [cases]);

  const recentSignals = useMemo(() => {
    const sourceCase = selectedCase ?? cases[0] ?? null;
    if (!sourceCase) {
      return [];
    }

    return sourceCase.recentActivity.slice(0, 4).map((entry) => ({
      title: entry.action,
      time: entry.time,
      icon: entry.icon,
    }));
  }, [cases, selectedCase]);

  return (
    <div className="relative space-y-8 pb-16">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute left-[-8rem] top-[-6rem] h-64 w-64 rounded-full bg-[rgba(139,92,246,0.12)] blur-3xl" />
        <div className="absolute right-[-7rem] top-24 h-72 w-72 rounded-full bg-[rgba(20,184,166,0.14)] blur-3xl" />
      </div>

      <section className="rounded-[32px] border border-[var(--border)] bg-[linear-gradient(145deg,rgba(15,23,42,0.96),rgba(8,15,31,0.9))] p-6 shadow-[0_30px_90px_rgba(2,6,23,0.45)] md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.04)] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)] font-navigation">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--teal)] animate-pulse" />
              Professor workflow dashboard
            </div>
            <div>
              <h1 className="font-editorial text-4xl italic leading-none text-[var(--text-primary)] md:text-5xl">
                One page for import, analysis, review, and growth.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-sec)] md:text-base">
                The dashboard keeps the professor on a single path: load evidence, run the AI pipeline, inspect student profiles, approve feedback, and monitor progress over time.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void refreshSummary()}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--lav-border)] bg-[var(--lav-dim)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--lav-border)]"
            >
              {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Sync live data
            </button>
            <Link
              to="/import"
              className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,var(--lav),var(--teal))] px-4 py-3 text-sm font-semibold text-white shadow-[0_0_30px_var(--lav-glow)] transition-transform hover:-translate-y-0.5"
            >
              Import evidence
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const toneClass = stat.tone === 'lav'
              ? 'bg-[rgba(139,92,246,0.14)] text-[var(--lav)]'
              : stat.tone === 'teal'
                ? 'bg-[rgba(20,184,166,0.14)] text-[var(--teal)]'
                : stat.tone === 'amber'
                  ? 'bg-[rgba(245,158,11,0.14)] text-[var(--amber)]'
                  : 'bg-[rgba(59,130,246,0.14)] text-[var(--blue)]';

            return (
              <article key={stat.label} className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)] font-navigation">{stat.detail}</span>
                </div>
                <div className="mt-4 text-[10px] uppercase tracking-[0.26em] text-[var(--text-muted)] font-navigation">{stat.label}</div>
                <div className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{stat.value}</div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        {workflowSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <Link
              key={step.title}
              to={step.href}
              className="group rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-5 transition-all hover:-translate-y-1 hover:border-[var(--lav-border)] hover:bg-[rgba(255,255,255,0.05)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.05)] text-[var(--lav)] transition-transform group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-navigation">
                  0{index + 1}
                </span>
              </div>
              <h2 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-sec)]">{step.description}</p>
              <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] font-navigation">
                <span>{step.status}</span>
                <ArrowRight className="h-4 w-4 text-[var(--lav)] transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[28px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.26em] text-[var(--text-muted)] font-navigation">Cohort growth snapshot</div>
              <h3 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">Highest scoring students</h3>
            </div>
            <div className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-muted)]">
              {verifiedCases.length} verified / {cases.length} cases
            </div>
          </div>

          <div className="mt-5 h-[320px]">
            {studentChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentChartData} margin={{ top: 10, right: 8, bottom: 0, left: -12 }}>
                  <CartesianGrid stroke="rgba(148,163,184,0.15)" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(226,232,240,0.9)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(226,232,240,0.9)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid rgba(148,163,184,0.18)',
                      borderRadius: '16px',
                      color: '#f8fafc',
                    }}
                  />
                  <Bar dataKey="score" radius={[14, 14, 8, 8]}>
                    {studentChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-[24px] border border-dashed border-[var(--border)] text-sm text-[var(--text-muted)]">
                Import data to see growth trends and student performance.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-[28px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.26em] text-[var(--text-muted)] font-navigation">Recent activity</div>
              <h3 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">Latest case signals</h3>
            </div>
            <Link to="/students" className="text-sm text-[var(--lav)] transition-colors hover:text-white">Open students</Link>
          </div>

          <div className="mt-5 space-y-3">
            {recentSignals.length > 0 ? recentSignals.map((signal) => (
              <div key={`${signal.time}-${signal.title}`} className="rounded-[20px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">{signal.title}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">{signal.time}</div>
                  </div>
                  <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    {signal.icon}
                  </span>
                </div>
              </div>
            )) : (
              <div className="rounded-[20px] border border-dashed border-[var(--border)] p-5 text-sm text-[var(--text-muted)]">
                No case activity yet. Import a dataset to populate the workflow.
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link to="/pipeline" className="rounded-[18px] border border-[var(--lav-border)] bg-[var(--lav-dim)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--lav-border)]">
              Launch pipeline
            </Link>
            <Link to={selectedCase ? `/teacher-decision/${selectedCase.student.student_id}` : '/students'} className="rounded-[18px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--lav-border)]">
              Review feedback
            </Link>
          </div>

          <div className="mt-4 text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Last sync: {lastSynced ? lastSynced.toLocaleTimeString() : 'Pending'}
          </div>
        </article>
      </section>
    </div>
  );
};