import React, { useEffect, useMemo, type ReactNode } from 'react';
import { BarChart3, Database, MessageSquareCheck, PlayCircle, RefreshCw, Users, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { autoLoadCases } from '../services/casesApi';
import { getTaskOptions, mapParsedCaseToStudyCase, useStudyScopeStore } from '../state/studyScope';
import { useAuthStore } from '../state/authStore';

interface ResearchShellProps {
  children: ReactNode;
}

export const ResearchShell: React.FC<ResearchShellProps> = ({ children }) => {
  const location = useLocation();
  const { cases, importCases, selectedCaseId, selectCase, selectTask, selectedTaskByCase } = useStudyScopeStore();
  const token = useAuthStore(state => state.token);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    if (cases.length === 0 && token) {
      autoLoadCases(token)
        .then(parsed => {
          if (parsed && parsed.length > 0) {
            importCases(parsed.map(mapParsedCaseToStudyCase));
          }
        })
        .catch(err => console.error('Failed to auto-load cases:', err));
    }
  }, [cases.length, token, importCases]);

  const currentCase = useMemo(() => {
    return cases.find((studyCase) => studyCase.id === selectedCaseId) ?? cases[0] ?? null;
  }, [cases, selectedCaseId]);

  const currentStudentId = currentCase?.student.student_id ?? '9263';
  const currentTask = currentCase ? (selectedTaskByCase[currentCase.id] ?? 'case-overview') : 'case-overview';
  const taskOptions = useMemo(() => getTaskOptions(currentCase), [currentCase]);
  const pendingReviewCount = cases.filter((studyCase) => studyCase.meta.ungradedAssignments > 0).length;

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: BarChart3, detail: 'Cohort status' },
    { label: 'Import Data', path: '/import', icon: Database, detail: 'Moodle and rubric files' },
    { label: 'Run Pipeline', path: '/pipeline', icon: PlayCircle, detail: 'Launch analysis flow' },
    { label: 'Students', path: '/students', icon: Users, detail: 'Learner profiles' },
    { label: 'Review Feedback', path: `/teacher-decision/${currentStudentId}`, icon: MessageSquareCheck, detail: 'Approve AI drafts' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text-primary)] font-body flex overflow-hidden">
      <aside className="w-[19rem] bg-[var(--bg-sidebar)] border-r border-[var(--border)] flex flex-col z-20">
        <div className="p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-[linear-gradient(135deg,var(--lav),var(--teal))] flex items-center justify-center shadow-[0_0_20px_var(--lav-glow)]">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-navigation font-bold text-base tracking-tight text-white">WriteLens</div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Professor workflow</div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-4 space-y-3">
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-[var(--text-muted)] font-navigation">
              <span>Workspace</span>
              <span className="text-[var(--teal)]">Live</span>
            </div>
            <div className="text-sm font-semibold text-[var(--text-primary)]">{user?.displayName || 'Professor Workspace'}</div>
            <div className="flex items-center justify-between text-xs text-[var(--text-sec)]">
              <span>{cases.length} imported cases</span>
              <span>{pendingReviewCount} pending review</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <div className="px-3 pb-2 text-[10px] uppercase tracking-[0.28em] text-[var(--text-muted)] font-navigation">5-step workflow</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 rounded-2xl border px-3 py-3 transition-all ${
                  isActive
                    ? 'border-[var(--lav-border)] bg-[var(--lav-dim)] text-[var(--text-primary)]'
                    : 'border-transparent text-[var(--text-sec)] hover:border-[var(--border)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${isActive ? 'bg-[var(--lav)] text-white' : 'bg-[rgba(255,255,255,0.04)] text-[var(--text-muted)] group-hover:text-[var(--lav)]'}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-navigation text-sm font-semibold tracking-wide">{item.label}</span>
                  <span className="block truncate text-xs text-[var(--text-muted)]">{item.detail}</span>
                </span>
                {isActive && <ChevronRight className="h-4 w-4 text-[var(--lav)]" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--border)] space-y-3 bg-[rgba(0,0,0,0.18)]">
          <div className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-4">
            <div className="text-[10px] uppercase tracking-[0.26em] text-[var(--text-muted)] font-navigation mb-2">Selected case</div>
            <div className="text-sm font-semibold truncate">{currentCase?.meta.studentName || 'No case selected'}</div>
            <div className="mt-2 text-xs text-[var(--text-sec)]">{currentCase?.clusterName || 'Load data to see learner profiles'}</div>
          </div>
          <Link
            to={`/teacher-decision/${currentStudentId}`}
            className="flex items-center justify-between rounded-2xl border border-[var(--lav-border)] bg-[var(--lav-dim)] px-4 py-3 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--lav-border)]"
          >
            <span className="font-navigation font-semibold tracking-wide">Open feedback review</span>
            <RefreshCw className="h-4 w-4 text-[var(--lav)]" />
          </Link>
        </div>
      </aside>

      <main id="main-content" className="flex-1 flex flex-col relative overflow-hidden">
        <header className="flex flex-col gap-4 border-b border-[var(--border)] bg-[rgba(2,6,23,0.86)] px-6 py-5 backdrop-blur-xl md:flex-row md:items-end md:justify-between md:px-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)] font-navigation">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1 text-[var(--teal)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--teal)] animate-pulse" />
                Professor workspace
              </span>
              <span>Linear analysis flow</span>
            </div>
            <div>
              <h1 className="font-editorial text-3xl italic text-[var(--text-primary)] md:text-4xl">Student analysis, one clear path</h1>
              <p className="mt-2 max-w-3xl text-sm text-[var(--text-sec)]">
                Move from data import to model review, student profiles, feedback approval, and growth tracking without juggling scattered research pages.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="min-w-[12rem] rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-4 py-3">
              <span className="mb-1 block text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)] font-navigation">Current case</span>
              <select
                value={currentCase?.id ?? ''}
                onChange={(event) => selectCase(event.target.value)}
                aria-label="Select learner case"
                className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none"
              >
                <option value="" disabled className="bg-[var(--bg-deep)]">Select a learner</option>
                {cases.map((studyCase) => (
                  <option key={studyCase.id} value={studyCase.id} className="bg-[var(--bg-deep)] text-white">
                    {studyCase.meta.studentName}
                  </option>
                ))}
              </select>
            </label>

            <label className="min-w-[12rem] rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-4 py-3">
              <span className="mb-1 block text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)] font-navigation">Focused task</span>
              <select
                value={currentTask}
                onChange={(event) => selectTask(event.target.value)}
                aria-label="Select learner task"
                className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none"
                disabled={!currentCase}
              >
                {taskOptions.length > 0 ? (
                  taskOptions.map((task) => (
                    <option key={task.id} value={task.id} className="bg-[var(--bg-deep)] text-white">
                      {task.label}
                    </option>
                  ))
                ) : (
                  <option value="case-overview" className="bg-[var(--bg-deep)] text-white">Full case overview</option>
                )}
              </select>
            </label>

            <div className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-right">
              <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)] font-navigation">Queue</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">{pendingReviewCount} feedback items</div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-5 md:p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};
