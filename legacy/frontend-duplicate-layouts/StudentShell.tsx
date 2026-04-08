// LEGACY - Moved during architecture refactor on 2026-04-08
// Duplicate of the canonical file in frontend/src/layouts/StudentShell.tsx.
// The layouts/ folder is the authoritative location. Kept for reference only.

﻿import { useState, useEffect } from 'react';
import { Menu, Home, CheckSquare, Bell, LogOut, TrendingUp, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useStudyScopeStore, getSelectedStudyCase, mapParsedCaseToStudyCase } from '../../store/studyScope';
import { autoLoadCases } from '../../services/casesApi';
import { useAuthStore } from '../../store/authStore';

export interface StudentShellProps {
  children: React.ReactNode;
}

export function StudentShell({ children }: StudentShellProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // For prototype purposes, we'll try to get the active student name if a case is loaded,
  // otherwise fallback to "Student"
  const cases = useStudyScopeStore((state) => state.cases);
  const selectedCaseId = useStudyScopeStore((state) => state.selectedCaseId);
  const importCases = useStudyScopeStore((state) => state.importCases);
  const token = useAuthStore(state => state.token);
  
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

  const selectedCase = getSelectedStudyCase({ cases, selectedCaseId });
  const studentName = selectedCase?.meta.studentName || 'Student Learner';

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-[var(--bg-deep)]">
      <header className="h-[70px] shrink-0 z-50 bg-[var(--bg-base)] border-b border-[var(--border)] px-4 lg:px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <button
            className="text-[var(--text-sec)] hover:text-[var(--text-primary)] transition-all md:hidden p-2 rounded-lg hover:bg-[var(--bg-raised)]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu size={22} />
          </button>
          <div className="font-editorial italic text-2xl text-[var(--text-primary)] font-medium tracking-tight">
            WriteLens <span className="text-[var(--text-muted)] text-lg not-italic font-navigation ml-2">| Student</span>
          </div>

          <nav className="hidden md:flex items-center gap-1 font-navigation text-sm ml-8">
            <NavItem to="/student-dashboard" icon={Home} label="Home" active={location.pathname === '/student-dashboard'} />
            <NavItem to="/student-tasks" icon={CheckSquare} label="My Tasks" active={location.pathname.startsWith('/student-tasks')} />
            <NavItem to="/student-report" icon={TrendingUp} label="My Progress" active={location.pathname === '/student-report'} />
            <NavItem to="/student-settings" icon={Settings} label="Settings" active={location.pathname === '/student-settings'} />
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => {
              /* FIX: Replace alert with proper UI notification in future sprint */
              console.log('Notifications: You have 0 new messages');
            }} 
            className="relative text-[var(--text-sec)] hover:text-[var(--text-primary)] transition-colors" 
            title="Notifications"
            aria-label="View notifications (0 new messages)"
          >
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[var(--bg-base)]"></span>
          </button>
          
          <div className="w-px h-6 bg-[var(--border)] hidden sm:block"></div>

          <div className="flex items-center gap-3 group cursor-pointer">
             <div className="w-10 h-10 rounded-full bg-[var(--bg-raised)] border border-[var(--border)] flex items-center justify-center text-[var(--text-primary)] font-navigation font-bold text-lg">
                {studentName.charAt(0)}
             </div>
             <div className="hidden sm:flex flex-col items-start leading-none">
                <span className="text-sm font-navigation font-medium text-[var(--text-primary)]">{studentName}</span>
                <span className="text-xs font-body text-[var(--text-muted)] mt-1">Learner Account</span>
             </div>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--border)] bg-[var(--bg-base)] px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
          <Link to="/student-dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-navigation text-[var(--text-sec)] hover:bg-[var(--bg-raised)] transition-all" onClick={() => setIsMobileMenuOpen(false)}>
            <Home size={18} /> Home
          </Link>
          <Link to="/student-tasks" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-navigation text-[var(--text-sec)] hover:bg-[var(--bg-raised)] transition-all" onClick={() => setIsMobileMenuOpen(false)}>
            <CheckSquare size={18} /> My Tasks
          </Link>
          <Link to="/student-report" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-navigation text-[var(--text-sec)] hover:bg-[var(--bg-raised)] transition-all" onClick={() => setIsMobileMenuOpen(false)}>
            <TrendingUp size={18} /> My Progress
          </Link>
          <Link to="/student-settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-navigation text-[var(--text-sec)] hover:bg-[var(--bg-raised)] transition-all" onClick={() => setIsMobileMenuOpen(false)}>
            <Settings size={18} /> Settings
          </Link>
          <Link to="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-navigation text-red-400 hover:bg-red-400/10 transition-all mt-4 border-t border-[var(--border)] pt-4" onClick={() => setIsMobileMenuOpen(false)}>
            <LogOut size={18} /> Sign Out
          </Link>
        </div>
      )}

      <main className="flex-1 overflow-y-auto w-full">
        <div className="animate-in fade-in fill-mode-both duration-400 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ to, icon: Icon, label, active }: { to: string; icon: React.ElementType; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={clsx(
        'flex items-center gap-2 px-5 py-2.5 rounded-full transition-all',
        active
          ? 'bg-[var(--bg-raised)] text-[var(--text-primary)] font-medium shadow-sm border border-[var(--border)]'
          : 'text-[var(--text-sec)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)]/50'
      )}
    >
      <Icon size={18} className={active ? "text-[var(--blue)]" : ""} />
      {label}
    </Link>
  );
}

