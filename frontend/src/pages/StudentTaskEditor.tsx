import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, FileText, Info, Save, Send, X } from 'lucide-react';
import { StudentShell } from '../layouts/StudentShell';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Atoms';

import { useStudyScopeStore, getSelectedStudyCase } from '../store/studyScope';

export function StudentTaskEditor() {
  const navigate = useNavigate();
  const cases = useStudyScopeStore((state) => state.cases);
  const selectedCaseId = useStudyScopeStore((state) => state.selectedCaseId);
  const selectedCase = getSelectedStudyCase({ cases, selectedCaseId });

  // Source draft from latest artifact
  const artifacts = selectedCase?.writing.artifacts || [];
  const latestArtifact = artifacts[artifacts.length - 1];

  const [draftText, setDraftText] = useState(latestArtifact?.text || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [lastSaved, setLastSaved] = useState('Just now');
  const [wordCount, setWordCount] = useState(draftText.trim().split(/\s+/).filter(Boolean).length);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [helpCategory, setHelpCategory] = useState('none');
  const [reflectionNote, setReflectionNote] = useState('');
  const targetWords = 800;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setDraftText(text);
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
  };

  const handleSave = async () => {
    if (!selectedCase) return;
    setIsSaving(true);
    setSaveError('');

    try {
      // Using WriteLens API (PORT 5000) - POST endpoint for processing
      const API_BASE = 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: selectedCaseId,
          taskId: latestArtifact?.id,
          content: draftText,
          helpCategory,
          reflectionNote
        }),
      });

      if (!response.ok) throw new Error('Failed to save draft');

      // On success, reload data
      await response.json();
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Draft save failed:', err instanceof Error ? err.message : String(err));
      setSaveError('Failed to sync with server. Please try again.');
    } finally {
      setIsSaving(false);
      setIsModalOpen(false);
    }
  };

  return (
    <StudentShell>
      {/* Top sticky action bar */}
      <div className="sticky top-0 z-40 bg-[var(--bg-base)]/90 backdrop-blur-xl border-b border-[var(--border)] px-4 lg:px-8 py-3 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <button 
               onClick={() => navigate('/student-dashboard')}
               className="p-2 text-[var(--text-sec)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)] rounded-full transition-all"
            >
               <ArrowLeft size={18} />
            </button>
            <div className="hidden sm:block">
                <h2 className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                   <FileText size={14} className="text-blue-500" />
                   {latestArtifact?.title || 'Current Writing Task'}
                </h2>
                <div className="flex items-center gap-2 mt-0.5 text-xs uppercase font-navigation tracking-wider text-[var(--text-muted)]">
                   <span>Draft Revision</span> â€¢ 
                   <span className={isSaving ? 'text-[var(--lav)]' : saveError ? 'text-rose-500' : 'text-emerald-500'}>
                      {isSaving ? 'Saving...' : saveError ? saveError : `Saved ${lastSaved}`}
                   </span>
                </div>
            </div>
         </div>

          <div className="flex items-center gap-3">
             <Button variant="ghost" onClick={handleSave} disabled={isSaving} className="hidden md:flex items-center gap-2 text-xs h-auto py-2">
                <Save size={14} /> Save Draft
             </Button>
             <Button onClick={() => setIsModalOpen(true)} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_15px_var(--blue-glow)] border-transparent flex items-center gap-2 text-xs h-auto py-2">
                <Send size={14} /> Submit Draft
             </Button>
          </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-4 lg:p-6 pb-32 flex flex-col lg:flex-row gap-6 lg:gap-8 h-[calc(100vh-140px)]">
         
         {/* Left Column: Resources and Instructions */}
         <div className="lg:w-[350px] shrink-0 h-full overflow-y-auto space-y-6 pr-2 custom-scrollbar">
            
            <section className="space-y-4">
               <h3 className="text-xs font-navigation uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
                  <Info size={14} /> Assignment Details
               </h3>
                <GlassCard className="p-5 border-[var(--border)] bg-[var(--bg-base)] text-sm">
                   <h4 className="font-navigation text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">Prompt</h4>
                   <p className="text-[var(--text-primary)] leading-relaxed mb-4">
                      {selectedCase?.meta.dominantNeed ? `Based on your diagnostic profile, focus on: ${selectedCase.meta.dominantNeed}.` : 'Write a persuasive essay based on the assignment guidelines and your current feedback.'}
                   </p>

                  <div className="space-y-3 pt-4 border-t border-[var(--border)]/50">
                     <div className="flex justify-between items-center text-[var(--text-sec)]">
                        <span className="flex items-center gap-1.5"><Clock size={14} /> Deadline</span>
                        <span className="font-medium text-[var(--text-primary)]">Nov 12, 11:59 PM</span>
                     </div>
                     <div className="flex justify-between items-center text-[var(--text-sec)]">
                        <span className="flex items-center gap-1.5"><FileText size={14} /> Format</span>
                        <span className="font-medium text-[var(--text-primary)]">APA Style</span>
                     </div>
                     <div className="flex justify-between items-center text-[var(--text-sec)]">
                        <span className="flex items-center gap-1.5"><BookOpen size={14} /> Rubric</span>
                        <button className="text-blue-500 font-medium hover:underline text-xs">View Rubric</button>
                     </div>
                  </div>
               </GlassCard>
            </section>

            <section className="space-y-4">
               <h3 className="text-xs font-navigation uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
                  <BookOpen size={14} /> Helpful Resources
               </h3>
               <GlassCard className="p-4 border-[var(--border)] bg-[var(--bg-raised)]/30 space-y-3">
                  <a href="#" className="block p-3 rounded-lg bg-[var(--bg-base)] border border-[var(--border)] hover:border-blue-500/50 hover:shadow-sm transition-all text-sm group">
                     <span className="font-medium text-[var(--text-primary)] group-hover:text-blue-500 transition-colors block mb-1">Toulmin Model Basics</span>
                     <span className="text-xs text-[var(--text-muted)] line-clamp-2">Learn how to structure your claims, evidence, and warrants effectively.</span>
                  </a>
                  <a href="#" className="block p-3 rounded-lg bg-[var(--bg-base)] border border-[var(--border)] hover:border-blue-500/50 hover:shadow-sm transition-all text-sm group">
                     <span className="font-medium text-[var(--text-primary)] group-hover:text-blue-500 transition-colors block mb-1">Academic Transitions</span>
                     <span className="text-xs text-[var(--text-muted)] line-clamp-2">Examples of transition words for acknowledging counterarguments.</span>
                  </a>
               </GlassCard>
            </section>

         </div>

         {/* Right Column: Writing Canvas */}
         <div className="flex-1 h-full flex flex-col min-w-0">
            <GlassCard className="flex-1 flex flex-col border-[var(--border)] shadow-sm overflow-hidden bg-[var(--bg-base)]">
               
               {/* Editor Toolbar (Simulated) */}
               <div className="h-12 border-b border-[var(--border)] bg-[var(--bg-raised)]/50 px-4 flex items-center justify-between">
                  <div className="flex gap-2 text-[var(--text-muted)]">
                     <span className="px-2 font-serif font-bold cursor-pointer hover:text-[var(--text-primary)]">B</span>
                     <span className="px-2 font-serif italic cursor-pointer hover:text-[var(--text-primary)]">I</span>
                     <span className="px-2 font-serif underline cursor-pointer hover:text-[var(--text-primary)]">U</span>
                     <div className="w-px h-4 bg-[var(--border)] mx-1 self-center" />
                     <span className="text-xs font-navigation uppercase flex items-center px-2 cursor-pointer hover:text-[var(--text-primary)]">H1</span>
                     <span className="text-xs font-navigation uppercase flex items-center px-2 cursor-pointer hover:text-[var(--text-primary)]">H2</span>
                  </div>
               </div>

               {/* Writing Area */}
               <textarea 
                  className="w-full flex-1 p-8 sm:p-12 text-base md:text-lg font-body leading-relaxed text-[var(--text-primary)] bg-transparent  resize-none placeholder-[var(--text-muted)]"
                  placeholder="Start writing your draft here..."
                  value={draftText}
                  onChange={handleTextChange}
                  spellCheck="false"
               />
               
               {/* Word Count Footer */}
               <div className="h-10 border-t border-[var(--border)] flex items-center justify-between px-6 bg-[var(--bg-base)] shrink-0">
                  <div className="flex items-center gap-3">
                     <div className="w-32 bg-[var(--bg-deep)] rounded-full h-1.5 overflow-hidden border border-[var(--border)]">
                        <div 
                           className={`h-full rounded-full transition-all duration-300 ${wordCount >= targetWords ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                           style={{ width: `${Math.min(100, (wordCount / targetWords) * 100)}%` }} 
                        />
                     </div>
                     <span className={`text-xs font-navigation uppercase tracking-widest font-bold ${wordCount >= targetWords ? 'text-emerald-500' : 'text-[var(--text-muted)]'}`}>
                        {wordCount} / {targetWords} words
                     </span>
                  </div>
                  {wordCount >= targetWords && (
                     <span className="text-xs text-emerald-500 uppercase tracking-widest font-navigation font-bold hidden sm:inline">
                        Target Reached
                     </span>
                  )}
               </div>
            </GlassCard>
         </div>

      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-deep)] border border-[var(--border)] rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)] bg-[var(--bg-base)]">
               <h3 className="font-editorial text-xl italic text-[var(--text-primary)]">Finalize Submission</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-sec)] hover:text-[var(--text-primary)]">
                 <X size={20} />
               </button>
            </div>
            
            <div className="p-6 space-y-6">
               <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                 <h4 className="text-xs uppercase font-bold tracking-widest text-[var(--blue)] mb-2">Help-Seeking Strategy</h4>
                 <p className="text-sm font-body text-[var(--text-primary)] leading-relaxed">
                   Before analyzing your writing, the system can flag specific areas for your instructor. Do you have a specific request?
                 </p>
               </div>

               <div className="space-y-4">
                 <div>
                   <label className="block text-xs font-navigation uppercase tracking-widest text-[var(--text-muted)] mb-3">
                     I need guidance with:
                   </label>
                   <select 
                     value={helpCategory} 
                     onChange={(e) => setHelpCategory(e.target.value)}
                     className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)]  focus:border-[var(--blue)] transition-colors appearance-none"
                   >
                     <option value="none">No specific help needed at this time</option>
                     <option value="procedural_help">Task Instructions / Procedural</option>
                     <option value="language_help">Grammar, Vocabulary & Flow</option>
                     <option value="argument_help">Claims, Evidence & Reasoning</option>
                     <option value="feedback_clarification">Understanding previous feedback</option>
                   </select>
                 </div>

                 <div>
                   <label className="block text-xs font-navigation uppercase tracking-widest text-[var(--text-muted)] mb-3">
                     Reflection Note (Optional)
                   </label>
                   <textarea
                     value={reflectionNote}
                     onChange={(e) => setReflectionNote(e.target.value)}
                     placeholder="Briefly reflect on your progress or state the specific question you have for your instructor..."
                     className="w-full h-24 bg-[var(--bg-base)] border border-[var(--border)] rounded-xl p-4 text-sm text-[var(--text-primary)]  focus:border-[var(--blue)] transition-colors resize-none placeholder-[var(--text-muted)]/50"
                   />
                 </div>
               </div>
            </div>

            <div className="p-5 border-t border-[var(--border)] bg-[var(--bg-base)] flex justify-end gap-3">
               <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-xs h-9">
                 Cancel
               </Button>
               <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_15px_var(--blue-glow)] border-transparent flex items-center gap-2 text-xs h-9">
                 <Send size={14} /> {isSaving ? 'Submitting...' : 'Confirm Submission'}
               </Button>
            </div>
          </div>
        </div>
      )}
    </StudentShell>
  );
}

