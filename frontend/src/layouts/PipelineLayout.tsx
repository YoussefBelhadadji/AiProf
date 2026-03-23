import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileEdit, Database, ActivitySquare, Fingerprint, Grid,
  Map, BrainCircuit, Sparkles, AlertOctagon, MessageSquare,
  ShieldAlert, RefreshCw, ArrowLeft,
} from 'lucide-react';
import clsx from 'clsx';
import { StatusChip } from '../components/Atoms';
import { getSelectedStudyCase, useStudyScopeStore } from '../state/studyScope';

export interface PipelineLayoutProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
  verifiedEnabled?: boolean;
  unavailableTitle?: string;
  unavailableMessage?: string;
  unavailableContent?: React.ReactNode;
}

const stations = [
  { id: 1, name: 'Writing Task', icon: FileEdit, path: '/pipeline/1' },
  { id: 2, name: 'Data Integration', icon: Database, path: '/pipeline/2' },
  { id: 3, name: 'Submission Patterns', icon: ActivitySquare, path: '/pipeline/3' },
  { id: 4, name: 'Stylometric Analysis', icon: Fingerprint, path: '/pipeline/4' },
  { id: 5, name: 'Correlation Matrix', icon: Grid, path: '/pipeline/5' },
  { id: 6, name: 'Cluster Mapping', icon: Map, path: '/pipeline/6' },
  { id: 7, name: 'Predictive Model', icon: BrainCircuit, path: '/pipeline/7' },
  { id: 8, name: 'Bayesian Synthesis', icon: Sparkles, path: '/pipeline/8' },
  { id: 9, name: 'Diagnostic Signals', icon: AlertOctagon, path: '/pipeline/9' },
  { id: 10, name: 'Feedback Planning', icon: MessageSquare, path: '/pipeline/10' },
  { id: 11, name: 'Intervention Planning', icon: ShieldAlert, path: '/pipeline/11' },
  { id: 12, name: 'Revision Cycle', icon: RefreshCw, path: '/pipeline/12' },
];

export function PipelineLayout({
  children,
  rightPanel,
  verifiedEnabled = true,
  unavailableTitle = 'Verified Pipeline Unavailable',
  unavailableMessage = 'This station is hidden until the selected workbook case has verified live analytics for it.',
  unavailableContent,
}: PipelineLayoutProps) {
  const location = useLocation();
  const cases = useStudyScopeStore((state) => state.cases);
  const selectedCaseId = useStudyScopeStore((state) => state.selectedCaseId);
  const selectedCase = getSelectedStudyCase({ cases, selectedCaseId });
  const uniqueLearnerCount = new Set(cases.map((studyCase) => studyCase.meta.userId)).size;

  const stationAvailability: Record<number, boolean> = {
    1: Boolean(selectedCase),
    2: Boolean(selectedCase),
    3: Boolean(selectedCase),
    4: Boolean(selectedCase),
    5: Boolean(selectedCase),
    6: Boolean(selectedCase),
    7: Boolean(selectedCase),
    8: Boolean(selectedCase),
    9: Boolean(selectedCase),
    10: Boolean(selectedCase),
    11: Boolean(selectedCase),
    12: Boolean(selectedCase),
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-deep)]">
      <header className="h-[60px] shrink-0 z-50 bg-[var(--glass-bg)] backdrop-blur-[16px] border-b border-[var(--border)] px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-[var(--lav)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2 font-navigation text-sm font-medium bg-[var(--lav-glow)] px-3 py-1.5 rounded-md border border-[var(--lav-border)]">
            <ArrowLeft size={16} /> Exit Pipeline
          </Link>
          <div className="w-px h-6 bg-[var(--border)] hidden sm:block mx-2"></div>
          <div className="font-editorial italic text-lg text-[var(--text-primary)] font-medium hidden sm:block">
            Analytical Laboratory
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="w-[72px] shrink-0 border-r border-[var(--border)] bg-[var(--bg-base)] flex flex-col items-center py-4 gap-2 overflow-y-auto hidden md:flex z-10">
          {stations.map((station) => {
            const isActive = location.pathname.startsWith(station.path);
            const Icon = station.icon;
            const isEnabled = stationAvailability[station.id] ?? false;

            if (!isEnabled) {
              return (
                <Link
                  key={station.id}
                  to={station.path}
                  title={`Station ${String(station.id).padStart(2, '0')} - ${station.name} (preview unavailable state)`}
                  className={clsx(
                    'w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 relative group transition-all',
                    isActive
                      ? 'bg-[var(--bg-high)] border-l-2 border-[var(--gold)] shadow-[0_0_15px_var(--gold-dim)] text-[var(--gold)]'
                      : 'text-[var(--text-muted)] opacity-55 hover:bg-[var(--bg-raised)]'
                  )}
                >
                  <Icon size={20} />
                  <span className="font-navigation text-[10px] font-bold">
                    {String(station.id).padStart(2, '0')}
                  </span>

                  <div className="absolute left-14 bg-[var(--bg-high)] border border-[var(--border)] text-[var(--text-primary)] px-3 py-1.5 rounded shadow-xl text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 font-navigation font-medium">
                    <span className="text-[var(--gold)] mr-2">S{String(station.id).padStart(2, '0')}</span> {station.name} preview
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={station.id}
                to={station.path}
                title={`Station ${String(station.id).padStart(2, '0')} - ${station.name}`}
                className={clsx(
                  'w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all relative group',
                  isActive
                    ? 'bg-[var(--bg-high)] border-l-2 border-[var(--lav)] shadow-[0_0_15px_var(--lav-glow)]'
                    : 'hover:bg-[var(--bg-raised)] text-[var(--text-sec)]',
                )}
              >
                <Icon size={20} className={isActive ? 'text-[var(--lav)]' : 'group-hover:text-[var(--text-primary)]'} />
                <span className={clsx('font-navigation text-[10px] font-bold', isActive ? 'text-[var(--lav)]' : '')}>
                  {String(station.id).padStart(2, '0')}
                </span>

                {isActive && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--teal)] shadow-[0_0_8px_var(--teal)] animate-[phosphor-pulse_2s_ease-in-out_infinite]" />
                )}

                <div className="absolute left-14 bg-[var(--bg-high)] border border-[var(--border)] text-[var(--text-primary)] px-3 py-1.5 rounded shadow-xl text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 font-navigation font-medium">
                  <span className="text-[var(--lav)] mr-2">S{String(station.id).padStart(2, '0')}</span> {station.name}
                </div>
              </Link>
            );
          })}
        </div>

        <main className="flex-1 overflow-y-auto w-full relative bg-[var(--bg-deep)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="h-full"
            >
              {verifiedEnabled ? (
                children
              ) : (
                <div className="max-w-5xl mx-auto p-6 md:p-8 pb-32">
                  <div className="rounded-3xl border border-[var(--border-bright)] bg-[var(--bg-base)] p-8 md:p-10">
                    <h1 className="font-editorial italic text-4xl text-[var(--text-primary)]">{unavailableTitle}</h1>
                    <p className="mt-4 font-body text-sm text-[var(--text-sec)] max-w-3xl leading-relaxed">
                      {unavailableMessage}
                    </p>
                    <p className="mt-3 font-body text-sm text-[var(--text-sec)] max-w-3xl leading-relaxed">
                      {uniqueLearnerCount <= 1
                        ? 'The current workspace is in single-student study mode. All stations remain visible, but S06-S08 use case-level outputs when cohort-backed modelling is not available.'
                        : 'When the cohort is small, the station will fall back to case-level AI outputs. When the cohort is large enough, the same station switches to cohort-backed modelling.'}
                    </p>
                  </div>
                  {unavailableContent ? (
                    <div className="mt-6">
                      {unavailableContent}
                    </div>
                  ) : null}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <aside className="w-[380px] shrink-0 border-l border-[var(--border)] bg-[var(--bg-base)] hidden xl:flex overflow-y-auto">
          <div className="p-5 xl:p-6 space-y-5 min-w-0 w-full">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-[var(--lav)]" size={18} />
              <h3 className="font-navigation text-sm uppercase tracking-widest text-[var(--text-primary)]">Pedagogical Interpretation</h3>
            </div>

            {verifiedEnabled && rightPanel ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500 min-w-0">
                {rightPanel}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                <ActivitySquare size={48} className="mb-4 text-[var(--text-muted)]" />
                <p className="font-body text-xs text-[var(--text-sec)]">
                  {uniqueLearnerCount <= 1
                    ? 'Teacher interpretation is available across all stations. Cohort-backed analytics downgrade to case-level interpretation when the imported cohort is still small.'
                    : 'Teacher interpretation appears here for both case-level and cohort-backed analytics.'}
                </p>
              </div>
            )}

            <div className="mt-8 p-4 rounded-lg bg-[var(--lav-glow)] border border-[var(--lav-border)]">
              <h4 className="font-navigation text-[10px] uppercase tracking-widest text-[var(--lav)] mb-2">Dissertation Note</h4>
              <p className="font-body text-[11px] text-[var(--text-sec)] leading-relaxed">
                The pipeline shows only verified workbook evidence and explicitly gated analytics so that teacher interpretation remains grounded in real case data.
              </p>
            </div>
          </div>
        </aside>

        <style>{`
          @keyframes phosphor-pulse {
            0%, 100% { opacity: 1; box-shadow: 0 0 8px var(--teal); }
            50% { opacity: 0.6; box-shadow: 0 0 16px var(--teal), 0 0 32px var(--teal-dim); }
          }
        `}</style>
      </div>
    </div>
  );
}

export function StationHeader({ id, title, subtitle }: { id: number, title: string, subtitle?: string }) {
  return (
    <div className="relative mb-8 pb-4 border-b border-[var(--border)]">
      <div className="absolute -top-12 -left-4 font-editorial text-[96px] leading-none opacity-10 text-[var(--text-sec)] select-none pointer-events-none">
        {String(id).padStart(2, '0')}
      </div>
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-navigation text-2xl font-medium text-[var(--text-primary)] tracking-wide">
            {title}
          </h1>
          {subtitle && (
            <p className="font-navigation text-[10px] uppercase tracking-[0.2em] text-[var(--lav)] font-bold mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <StatusChip variant="teal" className="flex items-center gap-2 px-3 py-1 shadow-[0_0_10px_var(--teal-dim)]">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--teal)] animate-pulse shadow-[0_0_4px_var(--teal)]" />
          VERIFIED MODE
        </StatusChip>
      </div>
    </div>
  );
}

export function StationFooter({ prevPath, nextPath }: { prevPath?: string, nextPath?: string }) {
  return (
    <div className="mt-8 pt-6 border-t border-[var(--border)] flex justify-between items-center">
      <div>
        {prevPath && (
          <Link to={prevPath} className="text-[var(--text-sec)] hover:text-[var(--text-primary)] hover:border-[var(--border-bright)] border border-transparent px-4 py-2 rounded-md transition-all font-body text-sm flex items-center gap-2">
            <ArrowLeft size={16} /> Previous Station
          </Link>
        )}
      </div>
      <button disabled className="text-[var(--text-muted)] border border-transparent px-4 py-2 rounded-md transition-all font-navigation font-medium text-xs tracking-wider uppercase flex items-center gap-2 cursor-not-allowed opacity-60">
        <Sparkles size={14} /> Theoretical Framework
      </button>
      <div>
        {nextPath && (
          <Link to={nextPath} className="bg-[var(--lav)] text-[var(--bg-deep)] px-6 py-2 rounded-md transition-all hover:bg-[var(--gold)] font-body text-sm font-medium flex items-center gap-2 shadow-[0_0_15px_var(--lav-glow)] hover:-translate-y-px">
            Next <ArrowLeft size={16} className="rotate-180" />
          </Link>
        )}
      </div>
    </div>
  );
}
