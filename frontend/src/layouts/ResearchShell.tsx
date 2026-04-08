import React, { useEffect, type ReactNode } from 'react';
import {
  LayoutDashboard,
  Users,
  Inbox,
  BarChart3,
  Briefcase,
  Settings,
  Search,
  Bell,
  ChevronDown,
  FileText,
  ClipboardList,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { autoLoadCases } from '../services/casesApi';
import { mapParsedCaseToStudyCase, useStudyScopeStore } from '../store/studyScope';
import { useAuthStore } from '../store/authStore';
import { normalizeTeacherDisplayName } from '../utils/teacherDisplay';

interface ResearchShellProps {
  children: ReactNode;
}

type NavSubItem = { label: string; path: string; icon: React.ElementType };

type NavItem = {
  label: string;
  path: string;
  icon: React.ElementType;
  subItems?: NavSubItem[];
};

const MENU: NavItem[] = [
  { label: 'Dashboard',   path: '/dashboard',   icon: LayoutDashboard },
  { label: 'Learners',    path: '/students',    icon: Users           },
  { label: 'Submissions', path: '/submissions', icon: Inbox           },
  {
    label: 'Reports',
    path: '/reports',
    icon: BarChart3,
    subItems: [
      { label: 'Analysis Reports', path: '/reports',       icon: ClipboardList },
      { label: 'Final Reports',    path: '/reports/final', icon: FileText      },
    ],
  },
  { label: 'Portfolio', path: '/portfolio', icon: Briefcase },
  { label: 'Settings',  path: '/settings',  icon: Settings  },
];

export const ResearchShell: React.FC<ResearchShellProps> = ({ children }) => {
  const location = useLocation();
  const { cases, importCases } = useStudyScopeStore();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (cases.length === 0 && token) {
      autoLoadCases(token)
        .then((parsed) => {
          if (parsed && parsed.length > 0) {
            importCases(parsed.map(mapParsedCaseToStudyCase));
          }
        })
        .catch((err) => {
            // /api/auto-load is optional — backend may not implement it yet
            if (import.meta.env.DEV) console.debug('[ResearchShell] auto-load skipped:', err?.message);
          });
    }
  }, [cases.length, token, importCases]);

  const displayName = normalizeTeacherDisplayName(user?.displayName, user?.username, user?.role);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const path = location.pathname;

  function isItemActive(item: NavItem): boolean {
    if (item.path === '/dashboard') return path === '/dashboard';
    if (item.path === '/students')
      return path.startsWith('/students') || path.startsWith('/student-profile');
    return path === item.path || path.startsWith(`${item.path}/`);
  }

  function isSubItemActive(sub: NavSubItem): boolean {
    // Exact match for parent routes to avoid /reports matching /reports/final
    if (sub.path === '/reports') return path === '/reports';
    return path === sub.path || path.startsWith(`${sub.path}/`);
  }

  return (
    <div className="writelens-shell flex min-h-screen overflow-hidden bg-[#f1f5f9] font-(family-name:--font-body) text-slate-900">
      <aside className="z-20 flex w-60 shrink-0 flex-col border-r border-slate-200/80 bg-[#f8f9fd]">
        {/* Logo */}
        <div className="border-b border-slate-200/60 px-5 py-6">
          <Link to="/dashboard" className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3b82f6] text-lg font-bold text-white shadow-sm shadow-blue-500/25">
              W
            </span>
            <span className="font-semibold tracking-tight text-slate-900">WriteLens</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Menu
          </p>

          {MENU.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
            const hasSubItems = !!item.subItems?.length;

            return (
              <div key={item.path}>
                <Link
                  to={item.subItems ? item.subItems[0].path : item.path}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-50 text-[#3b82f6]'
                      : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      active ? 'bg-white text-[#3b82f6] shadow-sm' : 'text-slate-400'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" strokeWidth={2} />
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {hasSubItems && active && (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                  )}
                </Link>

                {/* Sub-items — shown when parent is active */}
                {hasSubItems && active && (
                  <div className="ml-10.5 mt-1 space-y-0.5 border-l-2 border-blue-100 pl-3 pb-1">
                    {item.subItems!.map((sub) => {
                      const SubIcon = sub.icon;
                      const subActive = isSubItemActive(sub);
                      return (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                            subActive
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-slate-500 hover:bg-white/70 hover:text-slate-800'
                          }`}
                        >
                          <SubIcon
                            className={`h-3.5 w-3.5 shrink-0 ${
                              subActive ? 'text-blue-500' : 'text-slate-400'
                            }`}
                            strokeWidth={2}
                          />
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200/60 px-4 py-4">
          <p className="text-[11px] text-slate-400">
            AI-powered writing analysis —{' '}
            <span className="text-slate-600">{cases.length} cases loaded</span>
          </p>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex flex-wrap items-center gap-4 border-b border-slate-200/80 bg-white px-6 py-4 md:px-8">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-500">
              {greeting()},{' '}
              <span className="font-semibold text-slate-900">{displayName}</span>
            </p>
          </div>

          <div className="relative flex min-w-50 max-w-md flex-1 items-center">
            <Search
              className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search cohort, essays, reports…"
              className="w-full rounded-xl border border-slate-200/90 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-[#3b82f6]/20 transition-shadow focus:border-blue-200 focus:bg-white focus:ring-4"
              aria-label="Search workspace"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="relative rounded-xl border border-slate-200/90 bg-white p-2.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white" />
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white py-1.5 pl-1.5 pr-3 text-left transition-colors hover:bg-slate-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-violet-500 text-xs font-semibold text-white">
                {displayName.slice(0, 2).toUpperCase()}
              </span>
              <span className="hidden max-w-40 truncate text-sm font-medium text-slate-800 sm:block">
                {displayName}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </header>

        <main id="main-content" className="custom-scrollbar flex-1 overflow-y-auto p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
