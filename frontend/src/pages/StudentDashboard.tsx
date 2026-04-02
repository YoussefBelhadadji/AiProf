import { useNavigate } from 'react-router-dom';
import { FileText, Clock, AlertCircle, ArrowRight, CheckCircle2, MessageSquare, BookOpen, Star, Sparkles, TrendingUp } from 'lucide-react';
import { StudentShell } from '../layouts/StudentShell';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Atoms';
import { EmptyState } from '../components/EmptyState';
import { useStudyScopeStore, getSelectedStudyCase } from '../state/studyScope';

export function StudentDashboard() {
  const navigate = useNavigate();
  const cases = useStudyScopeStore((state) => state.cases);
  const selectedCaseId = useStudyScopeStore((state) => state.selectedCaseId);
  const selectedCase = getSelectedStudyCase({ cases, selectedCaseId });

  // Fallback data if no case is selected
  const studentName = selectedCase?.meta.studentName || 'Student';
  
  // Derive live data from selectedCase
  const artifacts = selectedCase?.writing.artifacts || [];
  const latestArtifact = artifacts[artifacts.length - 1];
  
  const activeTask = {
    id: latestArtifact?.id || 'new-task',
    title: latestArtifact?.title || 'Current Writing Task',
    status: latestArtifact?.status || 'draft_needed',
    deadline: selectedCase?.meta.periodCovered || 'End of Term',
    wordCount: `${latestArtifact?.wordCount || 0} / 800`,
  };

  const recentFeedback = artifacts.slice(-3).reverse().map(a => ({
    id: a.id,
    title: a.title,
    date: a.date || 'Recent',
    score: (a as any).score ? `${(a as any).score}/100` : 'Pending',
    read: true 
  }));

  return (
    <StudentShell>
      <div className="max-w-5xl mx-auto p-6 lg:p-10 space-y-10 pb-32">
        {/* Welcome Header */}
        <header className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-4xl lg:text-5xl font-editorial font-medium text-[var(--text-primary)] tracking-tight">
            Welcome back, {studentName.split(' ')[0]}.
          </h1>
          <p className="text-base text-[var(--text-sec)] max-w-2xl font-body leading-relaxed">
            Here is an overview of your current writing tasks and recent feedback. Stay focused, you're making steady progress.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: Current Task & Feedback */}
          <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* Current Actionable Task */}
            <section>
               <h2 className="text-sm font-navigation uppercase tracking-widest text-[var(--text-primary)] font-bold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  Action Required
               </h2>
               <GlassCard className="p-6 md:p-8 border-[var(--blue-glow)] bg-[var(--blue-dim)] group hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start mb-6">
                     <div className="flex items-center gap-3">
                        <div className="p-3 bg-[var(--bg-base)] rounded-xl text-blue-500 shadow-sm border border-[var(--border)]">
                           <FileText size={24} strokeWidth={1.5} />
                        </div>
                        <div>
                           <p className="font-navigation text-xs uppercase tracking-widest text-blue-500 mb-1">Current Assignment</p>
                           <h3 className="text-xl font-editorial font-medium text-[var(--text-primary)]">{activeTask.title}</h3>
                        </div>
                     </div>
                     <span className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-navigation uppercase tracking-wider font-bold shadow-sm">
                        Draft 1 Pending
                     </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                     <div className="bg-[var(--bg-base)]/50 p-4 rounded-xl border border-[var(--border)]/50">
                        <p className="text-xs font-navigation uppercase tracking-wider text-[var(--text-muted)] mb-1">Deadline</p>
                        <p className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                           <Clock size={14} className="text-rose-500" /> {activeTask.deadline}
                        </p>
                     </div>
                     <div className="bg-[var(--bg-base)]/50 p-4 rounded-xl border border-[var(--border)]/50">
                        <p className="text-xs font-navigation uppercase tracking-wider text-[var(--text-muted)] mb-1">Target Length</p>
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                           {activeTask.wordCount} words
                        </p>
                     </div>
                  </div>

                  <Button 
                     onClick={() => navigate('/student-task-editor')} 
                     className="w-full sm:w-auto px-8 py-4 h-auto text-sm shadow-[0_0_15px_var(--blue-glow)] bg-blue-600 hover:bg-blue-700 text-white border-transparent"
                  >
                     Continue Writing Draft <ArrowRight size={16} className="ml-2" />
                  </Button>
               </GlassCard>
            </section>

            {/* Recent Feedback Feed */}
            <section>
               <h2 className="text-sm font-navigation uppercase tracking-widest text-[var(--text-primary)] font-bold mb-4">
                  Recent Feedback
               </h2>
               <div className="space-y-4">
                  {recentFeedback.length > 0 ? (
                    recentFeedback.map(item => (
                       <button
                          key={item.id}
                          onClick={() => navigate('/student-feedback')}
                          className="w-full text-left"
                       >
                          <GlassCard className={`p-5 flex items-center justify-between group transition-all hover:bg-[var(--bg-raised)] ${!item.read ? 'border-l-4 border-l-[var(--lav)] bg-[var(--lav-dim)]/30' : 'border border-[var(--border)]'}`}>
                             <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-lg ${!item.read ? 'bg-[var(--lav)] text-white shadow-md' : 'bg-[var(--bg-deep)] text-[var(--text-muted)] border border-[var(--border)]'}`}>
                                   <MessageSquare size={18} />
                                </div>
                                <div>
                                   <h4 className={`text-base font-body ${!item.read ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-sec)]'}`}>
                                      {item.title}
                                   </h4>
                                   <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1.5">
                                      <Clock size={12} /> {item.date} {item.read && <span className="ml-2 flex items-center gap-1 text-emerald-500"><CheckCircle2 size={12}/> Reviewed</span>}
                                   </p>
                                </div>
                             </div>
                             <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                   <p className="text-xs font-navigation uppercase tracking-wider text-[var(--text-muted)]">Grade</p>
                                   <p className="text-sm font-medium text-[var(--text-primary)]">{item.score}</p>
                                </div>
                                <ArrowRight size={16} className={`transition-transform group-hover:translate-x-1 ${!item.read ? 'text-[var(--lav)]' : 'text-[var(--text-muted)]'}`} />
                             </div>
                          </GlassCard>
                       </button>
                    ))
                  ) : (
                    <EmptyState 
                      icon={MessageSquare}
                      title="No feedback yet"
                      description="Your instructor or the adaptive engine hasn't returned any feedback for your task drafts yet."
                    />
                  )}
               </div>
            </section>
          </div>

          {/* Sidebar: Progress & Resources */}
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-100">
             
             {/* Reflection & Metacognition (Stage 5) */}
             <GlassCard className="p-6 border-[var(--lav-border)] bg-[var(--lav-dim)]/30 overflow-hidden relative group">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-[var(--lav-glow)] rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
                <h3 className="text-xs font-navigation uppercase tracking-widest text-[var(--lav)] mb-4 flex items-center gap-2 relative z-10">
                   <Sparkles size={14} /> Reflection Task
                </h3>
                <p className="text-sm font-editorial italic text-[var(--text-primary)] mb-4 relative z-10">
                  "How did your planning strategy change between your first draft and this current version?"
                </p>
                <Button variant="ghost" className="w-full text-xs h-9 border-[var(--lav-border)] text-[var(--lav)] relative z-10">
                  Complete Reflection
                </Button>
             </GlassCard>

             {/* Progress Overview */}
             <GlassCard className="p-6 border-[var(--border)] group cursor-pointer hover:bg-[var(--bg-base)]/60 transition-all" onClick={() => navigate('/student-report')}>
                <div className="flex justify-between items-center mb-5">
                   <h3 className="text-xs font-navigation uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
                      <TrendingUp size={14} className="text-[var(--lav)]" /> Progress Overview
                   </h3>
                   <ArrowRight size={14} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-all" />
                </div>
                <div className="space-y-3">
                   <div className="flex justify-between items-center text-sm py-2 border-b border-[var(--border)]/50">
                      <span className="text-[var(--text-sec)]">Revisions Made</span>
                      <span className="font-navigation font-bold text-[var(--text-primary)]">{selectedCase?.student.revision_frequency || 0}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm py-2">
                      <span className="text-[var(--text-sec)]">Feedback Viewed</span>
                      <span className="font-navigation font-bold text-emerald-500">{selectedCase?.student.feedback_views ? '100%' : '0%'}</span>
                   </div>
                   <div className="mt-4 h-1 w-full bg-[var(--bg-deep)] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[var(--lav)] to-[var(--blue)] shadow-[0_0_10px_var(--lav-glow)]" style={{ width: '72%' }} />
                   </div>
                </div>
             </GlassCard>

             {/* Helpful Resources */}
             <GlassCard className="p-6 border border-amber-500/20 bg-amber-50 dark:bg-amber-950/10">
                <h3 className="text-xs font-navigation uppercase tracking-widest text-amber-700 dark:text-amber-500 mb-4 flex items-center gap-2">
                   <BookOpen size={14} /> Writing Resources
                </h3>
                <div className="space-y-3 text-sm">
                   <a href="#" className="flex gap-3 p-3 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-amber-900 dark:text-amber-200 group">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <div>
                         <span className="font-medium block mb-0.5 group-hover:text-amber-700 dark:group-hover:text-amber-400">Academic Transition Words</span>
                         <span className="text-xs opacity-70">Improve flow between paragraphs</span>
                      </div>
                   </a>
                   <a href="#" className="flex gap-3 p-3 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-amber-900 dark:text-amber-200 group">
                      <Star size={16} className="shrink-0 mt-0.5" />
                      <div>
                         <span className="font-medium block mb-0.5 group-hover:text-amber-700 dark:group-hover:text-amber-400">Argumentation Structure</span>
                         <span className="text-xs opacity-70">Review the Toulmin model basics</span>
                      </div>
                   </a>
                </div>
             </GlassCard>

          </div>
        </div>
      </div>
    </StudentShell>
  );
}

