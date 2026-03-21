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

export interface PipelineLayoutProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
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
  { id: 9, name: 'Diagnosis Engine', icon: AlertOctagon, path: '/pipeline/9' },
  { id: 10, name: 'Feedback Delivery', icon: MessageSquare, path: '/pipeline/10' },
  { id: 11, name: 'Intervention Tracking', icon: ShieldAlert, path: '/pipeline/11' },
  { id: 12, name: 'Revision Cycle', icon: RefreshCw, path: '/pipeline/12' },
];

export function PipelineLayout({ children, rightPanel }: PipelineLayoutProps) {
  const location = useLocation();

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
                <span className={clsx('font-navigation text-[9px] font-bold', isActive ? 'text-[var(--lav)]' : '')}>
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
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <aside className="w-[360px] shrink-0 border-l border-[var(--border)] bg-[var(--bg-base)] flex flex-col hidden xl:flex overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-[var(--lav)]" size={18} />
              <h3 className="font-navigation text-sm uppercase tracking-widest text-[var(--text-primary)]">Pedagogical Interpretation</h3>
            </div>

            {rightPanel ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                {rightPanel}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                <ActivitySquare size={48} className="mb-4 text-[var(--text-muted)]" />
                <p className="font-body text-xs text-[var(--text-sec)]">Select an analytic view to see pedagogical insights.</p>
              </div>
            )}

            <div className="mt-8 p-4 rounded-lg bg-[var(--lav-glow)] border border-[var(--lav-border)]">
              <h4 className="font-navigation text-[10px] uppercase tracking-widest text-[var(--lav)] mb-2">Dissertation Note</h4>
              <p className="font-body text-[11px] text-[var(--text-sec)] leading-relaxed">
                These observations are automatically synthesised for the quantitative analysis workflow. Use the export controls to capture them by station.
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
          LIVE ANALYSIS
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
      <button className="text-[var(--lav)] hover:border-[var(--lav-border)] hover:bg-[var(--lav-glow)] border border-transparent px-4 py-2 rounded-md transition-all font-navigation font-medium text-xs tracking-wider uppercase flex items-center gap-2">
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
