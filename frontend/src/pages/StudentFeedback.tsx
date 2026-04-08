import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, MessageSquare, BookOpen, Clock, FileEdit, Loader } from 'lucide-react';
import { StudentShell } from '../layouts/StudentShell';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Atoms';

import { useStudyScopeStore, getSelectedStudyCase } from '../store/studyScope';
import { useAuthStore } from '../store/authStore';

/**
 * Sanitize HTML content by removing dangerous tags and attributes.
 * Whitelist only safe HTML elements: p, h1-h6, br, strong, em, u, li, ul, ol, blockquote
 */
function sanitizeHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html; // Browser parses HTML
  
  // Define allowed tags
  const allowedTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BR', 'STRONG', 'EM', 'U', 'LI', 'UL', 'OL', 'BLOCKQUOTE', 'DIV', 'SPAN'];
  const allowedAttributes = ['class', 'id', 'style'];
  
  // Recursively clean elements
  function cleanNode(node: Node): Node {
    if (node.nodeType === Node.TEXT_NODE) return node;
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      if (!allowedTags.includes(element.tagName)) {
        // Replace disallowed tags with their text content
        const textNode = document.createTextNode(element.textContent || '');
        return textNode;
      }
      
      // Remove dangerous attributes
      const attrs = Array.from(element.attributes);
      attrs.forEach(attr => {
        if (!allowedAttributes.includes(attr.name) && !attr.name.startsWith('data-')) {
          element.removeAttribute(attr.name);
        }
      });
      
      // Remove event handlers
      Object.keys(element).forEach(key => {
        if (key.startsWith('on')) {
          (element as any)[key] = null;
        }
      });
      
      // Recursively clean children
      Array.from(element.childNodes).forEach((child, index) => {
        element.replaceChild(cleanNode(child), element.childNodes[index]);
      });
    }
    
    return node;
  }
  
  cleanNode(div);
  return div.innerHTML;
}

export function StudentFeedback() {
  const navigate = useNavigate();
  const cases = useStudyScopeStore((state) => state.cases);
  const selectedCaseId = useStudyScopeStore((state) => state.selectedCaseId);
  const selectedCase = getSelectedStudyCase({ cases, selectedCaseId });

  const { token } = useAuthStore();
  const [liveFeedback, setLiveFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const artifacts = selectedCase?.writing.artifacts || [];
  const latestArtifact = artifacts[artifacts.length - 1];

  useEffect(() => {
    async function fetchFeedback() {
      if (!selectedCase) {
        setLoading(false);
        return;
      }
      try {
        const API_BASE = 'http://localhost:5000/api';
        const studentId = selectedCase.student.student_id;
        
        // Fetch real feedback data from WriteLens API (PORT 5000)
        const res = await fetch(`${API_BASE}/student/${studentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
           const data = await res.json();
           setLiveFeedback(data.feedback || null);
        }
      } catch (e) {
         // Feedback fetch failed - will use case data
         console.warn("Could not fetch live feedback from WriteLens API:", e instanceof Error ? e.message : String(e));
      }
      setLoading(false);
    }
    fetchFeedback();
  }, [selectedCase, token]);

  // Derive feedback from the adaptive engine output or live feedback
  const isApproved = liveFeedback && (liveFeedback.status === 'approved' || liveFeedback.status === 'overridden');

  const feedbackData = {
    title: latestArtifact?.title || 'Current Writing Task',
    date: isApproved && liveFeedback.approved_at ? new Date(liveFeedback.approved_at + 'Z').toLocaleDateString() : (latestArtifact?.date || 'Today'),
    status: isApproved ? 'Reviewed' : (selectedCase?.riskLevel === 'critical' ? 'Needs Revision' : 'Developing'),
    strengths: (selectedCase?.student as Record<string, any>)?.rule_matches
      ?.filter((m: any) => m.priority < 3)
      .map((m: any, i: number) => ({ id: i, text: m.pedagogical_interpretation })) || [],
    weaknesses: (selectedCase?.student as Record<string, any>)?.rule_matches
      ?.filter((m: any) => m.priority >= 3)
      .map((m: any, i: number) => ({ 
        id: i, 
        text: m.pedagogical_interpretation, 
        priority: m.priority >= 5 ? 'High' : 'Medium',
        resource: m.adaptive_feedback_type || 'Writing Resource'
      })) || [],
    teacherNote: isApproved 
         ? (liveFeedback.final_message || liveFeedback.teacher_edited_message) 
         : (liveFeedback?.status === 'pending' || liveFeedback?.status === 'draft' ? 'Your draft is currently under review by your instructor.' : (selectedCase?.student.personalized_feedback || 'Your draft is being processed by the adaptive engine.')),
    draftHtml: latestArtifact?.text || '<p>No draft content available.</p>',
  };

  if (loading) {
     return (
       <StudentShell>
         <div className="flex h-screen items-center justify-center">
            <Loader className="animate-spin text-[var(--lav)]" size={32} />
         </div>
       </StudentShell>
     );
  }

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
                  <MessageSquare size={14} className="text-[var(--lav)]" />
                  Feedback: {feedbackData.title}
               </h2>
               <div className="flex items-center gap-2 mt-0.5 text-xs uppercase font-navigation tracking-wider text-[var(--text-muted)]">
                  <span>Draft 1</span> â€¢ 
                  <span>Returned {feedbackData.date}</span>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-3">
            {isApproved ? (
              <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-navigation uppercase tracking-wider font-bold mr-2">
                 <CheckCircle2 size={12} /> Feedback Ready
              </span>
            ) : (
              <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-navigation uppercase tracking-wider font-bold mr-2">
                 <Clock size={12} /> Under Review
              </span>
            )}
            <Button 
               onClick={() => navigate('/student-task-editor')} 
               className="bg-[var(--lav)] hover:bg-[var(--lav-glow)] text-white shadow-[0_0_15px_var(--lav-glow)] border-transparent flex items-center gap-2 text-xs h-auto py-2"
            >
               <FileEdit size={14} /> Revise Now <ArrowRight size={14} className="ml-1" />
            </Button>
         </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-4 lg:p-6 pb-32 flex flex-col lg:flex-row gap-6 lg:gap-8 h-[calc(100vh-140px)]">
         
         {/* Left Column: Original Draft */}
         <div className="flex-1 h-full flex flex-col min-w-0">
            <h3 className="text-xs font-navigation uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2 mb-4">
               <FileEdit size={14} /> My Submission
            </h3>
            
            <GlassCard className="flex-1 overflow-y-auto border-[var(--border)] shadow-sm bg-[var(--bg-base)]">
               {/* FIX: Sanitized HTML rendering to prevent XSS attacks */}
               <div 
                  className="p-8 sm:p-12 text-base md:text-lg font-body leading-relaxed text-[var(--text-primary)] prose prose-invert max-w-none prose-p:mb-6 prose-headings:font-editorial prose-headings:font-medium prose-headings:mb-6 prose-mark:text-inherit"
                  dangerouslySetInnerHTML={{ __html: useMemo(() => sanitizeHtml(feedbackData.draftHtml), [feedbackData.draftHtml]) }}
               />
            </GlassCard>
            <p className="text-xs text-center font-navigation uppercase tracking-widest text-[var(--text-muted)] mt-3">
               Highlights correspond to teacher feedback on the right.
            </p>
         </div>

         {/* Right Column: Structured Feedback */}
         <div className="lg:w-[450px] shrink-0 h-full overflow-y-auto space-y-6 pr-2 custom-scrollbar">
            
            <h3 className="text-xs font-navigation uppercase tracking-widest text-[var(--text-primary)] font-bold flex items-center gap-2 mb-4">
               <MessageSquare size={14} className="text-[var(--lav)]" /> Instructor Feedback
            </h3>

            {/* Teacher Note */}
            <GlassCard className="p-5 border-[var(--lav-border)] bg-[var(--lav-dim)] shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-[var(--lav)]" />
               <p className="font-body text-sm leading-relaxed text-[var(--text-primary)]">
                  "{feedbackData.teacherNote}"
               </p>
               <p className="text-xs font-navigation uppercase tracking-widest text-[var(--text-muted)] mt-3 flex items-center gap-1.5">
                  â€” WriteLens Adaptive Engine
               </p>
            </GlassCard>

            {/* Top Priority Weaknesses */}
            <section className="space-y-4">
               <h4 className="text-xs font-navigation uppercase tracking-widest text-rose-500 border-b border-[var(--border)] pb-2 flex items-center gap-2 font-bold">
                  <AlertTriangle size={14} /> Top Revision Priorities
               </h4>
               
               {(feedbackData.weaknesses || []).map((item: any) => (
                  <GlassCard key={item.id} className="p-5 border-rose-500/20 bg-rose-50 dark:bg-rose-950/10 shadow-sm transition-all hover:bg-rose-100 dark:hover:bg-rose-950/20">
                     <p className="text-sm font-body leading-relaxed text-[var(--text-primary)] mb-4">
                        {item.text}
                     </p>
                     <div className="flex justify-between items-center border-t border-[var(--border)] pt-3">
                        <span className="text-xs font-navigation uppercase tracking-wider text-rose-500 font-bold bg-rose-500/10 px-2 py-0.5 rounded">
                           {item.priority} Priority
                        </span>
                        <a href="#" className="flex items-center gap-1 text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors">
                           <BookOpen size={12} /> {item.resource}
                        </a>
                     </div>
                  </GlassCard>
               ))}
            </section>

            {/* Strengths */}
            <section className="space-y-4">
               <h4 className="text-xs font-navigation uppercase tracking-widest text-emerald-500 border-b border-[var(--border)] pb-2 flex items-center gap-2 font-bold mt-8">
                  <CheckCircle2 size={14} /> Current Strengths
               </h4>
               
               <div className="space-y-3">
                  {feedbackData.strengths.map((item: any) => (
                     <div key={item.id} className="flex gap-3 text-sm p-4 rounded-xl border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/10">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                        <p className="font-body text-[var(--text-primary)] leading-snug">{item.text}</p>
                     </div>
                  ))}
               </div>
            </section>

         </div>

      </div>
    </StudentShell>
  );
}

