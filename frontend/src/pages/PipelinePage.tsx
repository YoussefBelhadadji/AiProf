import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Database, MessageSquareCheck, PlayCircle, Users } from 'lucide-react';
import { STUDY_STATIONS, useStudyScopeStore } from '../state/studyScope';

type WorkflowPhase = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  accent: 'lav' | 'teal' | 'amber' | 'sky' | 'rose';
};

export const PipelinePage: React.FC = () => {
  const cases = useStudyScopeStore((state) => state.cases);
  const selectedCaseId = useStudyScopeStore((state) => state.selectedCaseId);

  const activeCase = useMemo(() => {
    return cases.find((studyCase) => studyCase.id === selectedCaseId) ?? cases[0] ?? null;
  }, [cases, selectedCaseId]);

  const pendingReviews = cases.filter((studyCase) => studyCase.meta.ungradedAssignments > 0).length;

  const phases: WorkflowPhase[] = [
    {
      title: 'Prepare data',
      description: 'Load the workbook evidence and validate the imported case list.',
      icon: Database,
      href: '/import',
      accent: 'lav',
    },
    {
      title: 'Run analysis',
      description: 'Start the descriptive, model, and feedback pipeline from one hub.',
      icon: PlayCircle,
      href: '/pipeline/S01',
      accent: 'teal',
    },
    {
      title: 'Inspect profiles',
      description: 'Open the learner cards and compare evidence across students.',
      icon: Users,
      href: '/students',
      accent: 'sky',
    },
    {
      title: 'Approve feedback',
      description: 'Review the AI draft before it is released to students.',
      icon: MessageSquareCheck,
      href: activeCase ? `/teacher-decision/${activeCase.student.student_id}` : '/students',
      accent: 'amber',
    },
    {
      title: 'Track growth',
      description: 'Monitor longitudinal progress and revision uptake over time.',
      icon: BarChart3,
      href: '/dashboard',
      accent: 'rose',
    },
  ];

  const groupedStations = STUDY_STATIONS.reduce<Record<string, typeof STUDY_STATIONS>>((groups, station) => {
    const list = groups[station.group] ?? [];
    groups[station.group] = [...list, station];
    return groups;
  }, {});

  return (
    <div className="space-y-8 pb-16">
      <section className="rounded-[32px] border border-[var(--border)] bg-[linear-gradient(145deg,rgba(15,23,42,0.96),rgba(8,15,31,0.92))] p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.04)] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)] font-navigation">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--lav)] animate-pulse" />
              Analysis pipeline hub
            </div>
            <div>
              <h1 className="font-editorial text-4xl italic leading-none text-[var(--text-primary)] md:text-5xl">
                Run the full analysis pipeline without losing the professor's context.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-sec)] md:text-base">
                This page keeps the research architecture intact while presenting it as a simple flow: prepare evidence, analyze it, inspect students, approve feedback, and track growth.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/import"
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--lav-border)] bg-[var(--lav-dim)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--lav-border)]"
            >
              Import evidence
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,var(--lav),var(--teal))] px-4 py-3 text-sm font-semibold text-white shadow-[0_0_30px_var(--lav-glow)] transition-transform hover:-translate-y-0.5"
            >
              Back to overview
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
          <div className="rounded-[20px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-4">
            <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)] font-navigation">Loaded cases</div>
            <div className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{cases.length}</div>
          </div>
          <div className="rounded-[20px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-4">
            <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)] font-navigation">Review queue</div>
            <div className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{pendingReviews}</div>
          </div>
          <div className="rounded-[20px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-4">
            <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)] font-navigation">Active student</div>
            <div className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{activeCase?.meta.studentName || 'No case selected'}</div>
          </div>
          <div className="rounded-[20px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-4">
            <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)] font-navigation">Station groups</div>
            <div className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{Object.keys(groupedStations).length}</div>
          </div>
          <div className="rounded-[20px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-4">
            <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)] font-navigation">Stations</div>
            <div className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{STUDY_STATIONS.length}</div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        {phases.map((phase, index) => {
          const Icon = phase.icon;
          const toneClass = phase.accent === 'lav'
            ? 'text-[var(--lav)] bg-[rgba(139,92,246,0.12)]'
            : phase.accent === 'teal'
              ? 'text-[var(--teal)] bg-[rgba(20,184,166,0.12)]'
              : phase.accent === 'amber'
                ? 'text-[var(--amber)] bg-[rgba(245,158,11,0.12)]'
                : phase.accent === 'sky'
                  ? 'text-[var(--blue)] bg-[rgba(59,130,246,0.12)]'
                  : 'text-[var(--rose)] bg-[rgba(244,63,94,0.12)]';

          return (
            <Link
              key={phase.title}
              to={phase.href}
              className="group rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-5 transition-all hover:-translate-y-1 hover:border-[var(--lav-border)] hover:bg-[rgba(255,255,255,0.05)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)] font-navigation">
                  0{index + 1}
                </span>
              </div>
              <h2 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">{phase.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-sec)]">{phase.description}</p>
              <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] font-navigation">
                <span>Open step</span>
                <ArrowRight className="h-4 w-4 text-[var(--lav)] transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-[28px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.26em] text-[var(--text-muted)] font-navigation">Station map</div>
              <h3 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">Five phases, twelve stations</h3>
            </div>
            <Link to="/pipeline/S01" className="rounded-full border border-[var(--lav-border)] bg-[var(--lav-dim)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--lav-border)]">
              Start at S01
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {Object.entries(groupedStations).map(([group, stations]) => (
              <div key={group} className="rounded-[22px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)] font-navigation">{group}</div>
                    <div className="mt-1 text-sm text-[var(--text-sec)]">{stations.length} stations in this phase</div>
                  </div>
                  <Link to={stations[0] ? `/pipeline/S${String(stations[0].id).padStart(2, '0')}` : '/pipeline/S01'} className="text-sm text-[var(--lav)] transition-colors hover:text-white">
                    Open first station
                  </Link>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {stations.map((station) => (
                    <Link
                      key={station.id}
                      to={`/pipeline/S${String(station.id).padStart(2, '0')}`}
                      className="rounded-xl border border-[var(--border)] bg-[rgba(2,6,23,0.5)] px-3 py-2 text-left transition-colors hover:border-[var(--lav-border)] hover:bg-[rgba(255,255,255,0.04)]"
                    >
                      <div className="text-xs uppercase tracking-[0.2em] text-[var(--lav)] font-navigation">{station.id}</div>
                      <div className="mt-1 text-sm text-[var(--text-primary)]">{station.label}</div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.26em] text-[var(--text-muted)] font-navigation">What the professor sees</div>
              <h3 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">Ready-made entry points</h3>
            </div>
            <Link to="/students" className="text-sm text-[var(--lav)] transition-colors hover:text-white">Open students</Link>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-[20px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-4">
              <div className="text-sm font-semibold text-[var(--text-primary)]">If you just imported data</div>
              <p className="mt-2 text-sm leading-6 text-[var(--text-sec)]">Jump into the pipeline hub, run the flow, and inspect the generated student cards.</p>
            </div>
            <div className="rounded-[20px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-4">
              <div className="text-sm font-semibold text-[var(--text-primary)]">If the model is ready</div>
              <p className="mt-2 text-sm leading-6 text-[var(--text-sec)]">Open the review queue, approve the AI draft, and keep a visible decision trail.</p>
            </div>
            <div className="rounded-[20px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-4">
              <div className="text-sm font-semibold text-[var(--text-primary)]">If you need progress context</div>
              <p className="mt-2 text-sm leading-6 text-[var(--text-sec)]">Check the growth view to see who improved, who stalled, and where to intervene next.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link to="/import" className="rounded-[18px] border border-[var(--lav-border)] bg-[var(--lav-dim)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--lav-border)]">
              Import evidence
            </Link>
            <Link to={activeCase ? `/teacher-decision/${activeCase.student.student_id}` : '/students'} className="rounded-[18px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--lav-border)]">
              Review feedback
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
};