// LEGACY - Moved during architecture refactor on 2026-04-08
// This was an earlier simplified app shell (3 routes). Real app is frontend/src/App.tsx.
// Do NOT import or use. Kept for historical reference only.
import { ResearchShell } from '../components/common/ResearchShell';
import { Route, Routes } from 'react-router-dom';
import { BarChart3, Users, FileText, Network } from 'lucide-react';

function PlaceholderContent({ title, icon: Icon }: { title: string; icon: React.ElementType }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-6">
      <div className="w-16 h-16 rounded-2xl bg-[var(--bg-high)] border border-[var(--border)] flex items-center justify-center">
        <Icon className="w-8 h-8 text-[var(--lav)]" />
      </div>
      <div>
        <h2 className="font-editorial text-3xl italic text-[var(--text-primary)] mb-2">{title}</h2>
        <p className="text-[var(--text-muted)] text-sm font-navigation uppercase tracking-widest">
          Ready for implementation
        </p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  return (
    <ResearchShell>
      <Routes>
        <Route path="/dashboard" element={<PlaceholderContent title="Cohort Dashboard" icon={BarChart3} />} />
        <Route path="/students" element={<PlaceholderContent title="Student Profiles" icon={Users} />} />
        <Route path="/reports" element={<PlaceholderContent title="Reports" icon={FileText} />} />
        <Route path="/framework" element={<PlaceholderContent title="System Framework" icon={Network} />} />
        <Route path="*" element={<PlaceholderContent title="Cohort Dashboard" icon={BarChart3} />} />
      </Routes>
    </ResearchShell>
  );
}
