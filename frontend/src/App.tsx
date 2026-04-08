import React, { Suspense, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ResearchShell } from './layouts/ResearchShell';

// Initial route loads
import { Dashboard } from './pages/Dashboard.tsx';

// ── Learners feature (feature/learners) ──────────────────────────────────────
const LearnersList = React.lazy(() => import('./features/learners/LearnersList').then(m => ({ default: m.LearnersList })));
const StudentProfilePage = React.lazy(() => import('./features/learners/StudentProfile').then(m => ({ default: m.StudentProfile })));

// Lazy loaded routes (Sprint 3: Performance)
const LearnerRegistry = React.lazy(() => import('./pages/Students').then(module => ({ default: module.Students })));
const StudentProfile = React.lazy(() => import('./pages/StudentProfile').then(module => ({ default: module.StudentProfile })));
const Groups = React.lazy(() => import('./pages/Groups').then(module => ({ default: module.Groups })));
const Tasks = React.lazy(() => import('./pages/Tasks').then(module => ({ default: module.Tasks })));
const Reports = React.lazy(() => import('./pages/Reports').then(module => ({ default: module.Reports })));
const Notes = React.lazy(() => import('./pages/Notes').then(module => ({ default: module.Notes })));
const Import = React.lazy(() => import('./pages/Import').then(module => ({ default: module.Import })));
const PipelinePage = React.lazy(() => import('./pages/PipelinePage').then(module => ({ default: module.PipelinePage })));
const Settings = React.lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));
const NotFound = React.lazy(() => import('./pages/NotFound').then(module => ({ default: module.NotFound })));
const StationRouter = React.lazy(() => import('./pages/StationRouter').then(module => ({ default: module.StationRouter })));
const Thresholds = React.lazy(() => import('./pages/Thresholds').then(module => ({ default: module.Thresholds })));
const AuditLogs = React.lazy(() => import('./pages/AuditLogs').then(module => ({ default: module.AuditLogs })));
const Reliability = React.lazy(() => import('./pages/Reliability').then(module => ({ default: module.Reliability })));
const Diagnostics = React.lazy(() => import('./pages/Diagnostics').then(module => ({ default: module.Diagnostics })));
const TeacherDecisionPanel = React.lazy(() => import('./pages/TeacherDecisionPanel').then(module => ({ default: module.TeacherDecisionPanel })));
const RuleManagement = React.lazy(() => import('./pages/RuleManagement').then(module => ({ default: module.RuleManagement })));
const FeedbackTemplateManagement = React.lazy(() => import('./pages/FeedbackTemplateManagement').then(module => ({ default: module.FeedbackTemplateManagement })));
const Submissions = React.lazy(() => import('./pages/Submissions').then(module => ({ default: module.Submissions })));
const SubmissionDetailPage = React.lazy(() => import('./pages/SubmissionDetailPage').then(module => ({ default: module.SubmissionDetailPage })));
const StudentSubmissionsPage = React.lazy(() => import('./pages/StudentSubmissionsPage').then(module => ({ default: module.StudentSubmissionsPage })));
const FinalReports = React.lazy(() => import('./pages/FinalReports').then(module => ({ default: module.FinalReports })));
const StudentFinalReportPage = React.lazy(() => import('./pages/StudentFinalReportPage').then(module => ({ default: module.StudentFinalReportPage })));
const Portfolio = React.lazy(() => import('./pages/Portfolio').then(module => ({ default: module.Portfolio })));

// Loading fallback UI
const PageLoader = () => (
  <div className="min-h-screen bg-[var(--bg-deep)] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-[var(--border)] border-t-[var(--lav)] rounded-full animate-spin"></div>
      <div className="font-navigation text-xs uppercase tracking-widest text-[var(--lav)] animate-pulse">
        Initializing Workspace
      </div>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <a href="#main-content" className="skip-link font-navigation text-sm">Skip to main content</a>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="/forgot-password" element={<Navigate to="/dashboard" replace />} />
            <Route path="/reset-password" element={<Navigate to="/dashboard" replace />} />

            {/* Authenticated Research Space */}
            <Route path="/*" element={
              <ProtectedRoute>
                <ResearchShell>
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="submissions" element={<Submissions />} />
                    <Route path="submissions/student/:studentId" element={<StudentSubmissionsPage />} />
                    <Route path="submissions/:submissionId" element={<SubmissionDetailPage />} />
                    <Route path="reports/final" element={<FinalReports />} />
                    <Route path="reports/final/:studentId" element={<StudentFinalReportPage />} />
                    <Route path="portfolio" element={<Portfolio />} />
                    {/* ── Learners feature routes ── */}
                    <Route path="students" element={<LearnersList />} />
                    <Route path="students/:studentId" element={<StudentProfilePage />} />
                    {/* Legacy student routes – kept for backward compatibility */}
                    <Route path="students-old" element={<LearnerRegistry />} />
                    <Route path="student-profile/:id" element={<StudentProfile />} />
                    <Route path="groups" element={<Groups />} />
                    <Route path="tasks" element={<Tasks />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="diagnostics" element={<Diagnostics />} />
                    <Route path="notes" element={<Notes />} />
                    <Route path="import" element={<Import />} />
                    <Route path="pipeline" element={<PipelinePage />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="pipeline/:id" element={<StationRouter />} />
                    <Route path="teacher-decision/:studentId" element={<TeacherDecisionPanel />} />
                    
                    {/* Management Routes */}
                    <Route path="thresholds" element={<Thresholds />} />
                    <Route path="rules" element={<RuleManagement />} />
                    <Route path="templates" element={<FeedbackTemplateManagement />} />
                    <Route path="logs" element={<AuditLogs />} />
                    <Route path="reliability" element={<Reliability />} />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ResearchShell>
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  // Allow direct access to dashboard without authentication
  // Set workspace access flag if not already set
  React.useEffect(() => {
    if (!sessionStorage.getItem('writelens-research-access')) {
      sessionStorage.setItem('writelens-research-access', 'granted');
    }
  }, []);

  return children;
}

export default App;

