import { useState } from 'react';
import { Menu, LayoutDashboard, Users, FileText, FileEdit, Lightbulb, Search, BookOpen, Settings as SettingsIcon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { GlassCard } from '../components/GlassCard';
import { getSelectedStudyCase, getSelectedTask, getSelectedTaskId, useStudyScopeStore } from '../state/studyScope';

export interface ResearchShellProps {
  children: React.ReactNode;
}

function InterpretationPanel() {
  const cases = useStudyScopeStore((state) => state.cases);
  const selectedCaseId = useStudyScopeStore((state) => state.selectedCaseId);
  const selectedTaskByCase = useStudyScopeStore((state) => state.selectedTaskByCase);
  const selectedCase = getSelectedStudyCase({ cases, selectedCaseId });
  const selectedTask = getSelectedTask(
    selectedCase,
    getSelectedTaskId({ selectedCaseId, selectedTaskByCase })
  );

  return (
    <div className="w-[400px] shrink-0 border-l border-[var(--border)] bg-[var(--bg-base)] hidden xl:flex flex-col h-full sticky top-[60px] overflow-y-auto">
      <div className="p-6">
        <h3 className="text-xs font-navigation uppercase tracking-widest text-[var(--text-sec)] mb-4 pb-2 border-b border-[var(--border)]">
          Teaching Meaning
        </h3>

        <div className="flex flex-col gap-6">
          <section>
            <div className="flex items-center gap-2 mb-3 text-[var(--lav)] font-medium font-navigation">
              <Lightbulb size={16} /> Quick Summary
            </div>
            <GlassCard className="p-4 text-sm leading-relaxed text-[var(--text-sec)]">
              Current selection: {selectedCase.meta.studentName}. {selectedTask ? `Selected exercise: ${selectedTask.title}.` : 'Full case overview is active.'} Start with the highlighted scope, then move to the teacher report when you want a printable interpretation.
            </GlassCard>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3 text-[var(--teal)] font-medium font-navigation">
              <Search size={16} /> What To Notice
            </div>
            <GlassCard className="p-4 text-sm text-[var(--text-primary)]">
              <ul className="space-y-3">
                <li className="flex gap-2 items-start">
                  <span className="text-[var(--teal)] mt-0.5">*</span>
                  Imported student cases in session: {cases.length}. Active course: {selectedCase.meta.courseTitle}.
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-[var(--teal)] mt-0.5">*</span>
                  Support priority: {selectedCase.riskLevel}. Learner profile: {selectedCase.clusterName}.
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-[var(--teal)] mt-0.5">*</span>
                  Use the top scope bar to confirm the active student, exercise, sections, and indicators before reading any chart.
                </li>
              </ul>
            </GlassCard>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3 text-[var(--gold)] font-medium font-navigation">
              <BookOpen size={16} /> Research Lens
            </div>
            <GlassCard className="p-4 text-xs text-[var(--text-sec)] font-forensic">
              <p className="mb-2">Hattie (2009) - Visible Learning</p>
              <p>Zimmerman (2002) - Self-regulation</p>
            </GlassCard>
          </section>
        </div>
      </div>
    </div>
  );
}

export function ResearchShell({ children }: ResearchShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const cases = useStudyScopeStore((state) => state.cases);
  const selectedCaseId = useStudyScopeStore((state) => state.selectedCaseId);
  const selectedTaskByCase = useStudyScopeStore((state) => state.selectedTaskByCase);
  const selectedStationIds = useStudyScopeStore((state) => state.selectedStationIds);
  const selectedVariableIds = useStudyScopeStore((state) => state.selectedVariableIds);
  const selectedCase = getSelectedStudyCase({ cases, selectedCaseId });
  const selectedTask = getSelectedTask(
    selectedCase,
    getSelectedTaskId({ selectedCaseId, selectedTaskByCase })
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-deep)]">
      <header className="h-[60px] shrink-0 z-50 bg-[var(--glass-bg)] backdrop-blur-[16px] border-b border-[var(--border)] px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            className="text-[var(--text-sec)] hover:text-[var(--text-primary)] transition-colors xl:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu size={20} />
          </button>
          <div className="font-editorial italic text-lg text-[var(--lav)] font-medium">
            WriteLens
          </div>

          <nav className="hidden md:flex items-center gap-1 font-navigation text-sm ml-4">
            <NavItem to="/dashboard" icon={LayoutDashboard} label="Overview" active={location.pathname === '/dashboard' || location.pathname === '/'} />
            <NavItem to="/students" icon={Users} label="Student Cases" active={location.pathname.startsWith('/students')} />
            <NavItem to="/reports" icon={FileText} label="Teacher Report" active={location.pathname.startsWith('/reports')} />
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button 
            className="text-[var(--text-sec)] hover:text-[var(--lav)] transition-colors flex items-center gap-2 text-sm font-navigation"
            onClick={() => navigate('/notes')}
          >
            <FileEdit size={16} />
            <span className="hidden sm:inline">Notes</span>
          </button>
          <div className="w-px h-6 bg-[var(--border)] hidden sm:block"></div>

          <Link to="/settings" className="text-[var(--text-sec)] hover:text-[var(--lav)] transition-colors" title="Settings">
            <SettingsIcon size={18} />
          </Link>

          <button 
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity ml-2 bg-transparent border-none p-0"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--lav-glow)] border border-[var(--lav-border)] flex items-center justify-center text-[var(--lav)] relative font-editorial font-bold text-sm">
              {selectedCase.meta.instructor.charAt(0)}
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--teal)] border-2 border-[var(--bg-base)]" />
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)] hidden sm:inline">{selectedCase.meta.instructor}</span>
          </button>
        </div>
      </header>

      <div className="shrink-0 border-b border-[var(--border)] bg-[var(--bg-base)]/90 backdrop-blur-[10px] px-4 lg:px-6 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="min-w-0">
            <p className="font-navigation text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Current Teaching Scope</p>
            <p className="font-body text-sm text-[var(--text-primary)] mt-1">
              <span className="font-medium">{selectedCase.meta.studentName}</span>
              <span className="text-[var(--text-muted)]"> · </span>
              <span>{selectedTask ? selectedTask.title : 'Full case overview'}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-[var(--border)] px-3 py-1 font-navigation text-[10px] uppercase tracking-widest text-[var(--teal)] bg-[var(--teal-dim)]">
              {selectedStationIds.length} sections
            </span>
            <span className="rounded-full border border-[var(--border)] px-3 py-1 font-navigation text-[10px] uppercase tracking-widest text-[var(--lav)] bg-[var(--lav-glow)]">
              {selectedVariableIds.length} indicators
            </span>
            <button
              onClick={() => navigate('/reports')}
              className="rounded-full border border-[var(--border)] px-3 py-1 font-navigation text-[10px] uppercase tracking-widest text-[var(--text-sec)] hover:text-[var(--text-primary)] hover:border-[var(--border-bright)] transition-colors"
            >
              Open teacher report
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <main className="flex-1 overflow-y-auto w-full">
          <div className="animate-in fade-in fill-mode-both duration-300 min-h-full">
            {children}
          </div>
        </main>

        <InterpretationPanel />
      </div>
    </div>
  );
}

function NavItem({ to, icon: Icon, label, active }: { to: string; icon: React.ElementType; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={clsx(
        'flex items-center gap-2 px-4 py-2 rounded-md transition-all',
        active
          ? 'bg-[var(--lav-glow)] text-[var(--lav)]'
          : 'text-[var(--text-sec)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)]'
      )}
    >
      <Icon size={16} />
      {label}
    </Link>
  );
}
