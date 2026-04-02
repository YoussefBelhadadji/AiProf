import React from 'react';
import { MessageSquare, MessageSquareQuote, Zap, Clock, Network, HelpCircle } from 'lucide-react';
import type { DialogueMessage, InstructorComment } from '../data/diagnostic';

interface CommunicationTraceProps {
  messages: DialogueMessage[];
  comments: InstructorComment[];
  title?: string;
  subtitle?: string;
}

export const CommunicationTrace: React.FC<CommunicationTraceProps> = ({
  messages,
  comments,
  title = 'Teacher-Student Dialogue',
  subtitle = 'Workbook-backed exchange and Moodle comment trace.',
}) => {
  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare size={18} className="text-[var(--lav)] opacity-50" />
          <h3 className="font-navigation text-xs uppercase tracking-widest font-bold text-[var(--text-primary)]">{title}</h3>
        </div>
        <p className="font-body text-xs text-[var(--text-muted)] italic">{subtitle}</p>
      </div>

      {/* Help-Seeking Analytical Profile */}
      <div className="glass-card p-8 border-[var(--border)] bg-[rgba(196,181,253,0.05)]">
        <div className="flex items-center gap-3 mb-6">
           <Network className="w-5 h-5 text-[var(--lav)]" />
           <h4 className="font-navigation text-xs uppercase tracking-widest font-bold text-[var(--lav)]">Help-Seeking Analytical Profile</h4>
           <span className="ml-auto font-forensic text-xs text-[var(--text-muted)] opacity-50">Zimmerman (2008) Framework</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-deep)]">
              <div className="font-navigation text-xs uppercase tracking-widest text-[var(--text-muted)] mb-2">Help-Seeking Frequency</div>
              <div className="font-editorial text-2xl italic text-[var(--text-primary)]">
                {messages.filter(m => m.intent).length > 3 ? 'High' : messages.filter(m => m.intent).length > 1 ? 'Moderate' : messages.filter(m => m.intent).length === 1 ? 'Low' : 'None'}
              </div>
           </div>
           
           <div className="p-5 rounded-xl border border-[var(--lav-border)] bg-[var(--lav-dim)]">
              <div className="font-navigation text-xs uppercase tracking-widest text-[var(--lav)] mb-2">Dominant Intent</div>
              <div className="font-editorial text-2xl italic text-[var(--text-primary)]">
                 {(() => {
                    const intents = messages.map(m => m.intent).filter(Boolean) as string[];
                    if (intents.length === 0) return 'N/A';
                    const counts = intents.reduce((acc, val) => { acc[val] = (acc[val] || 0) + 1; return acc; }, {} as Record<string, number>);
                    const dominant = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
                    return dominant;
                 })()}
              </div>
           </div>
           
           <div className="p-5 rounded-xl border border-[var(--teal-border)] bg-[rgba(45,212,191,0.05)] flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                 <Zap className="w-4 h-4 text-[var(--teal)]" />
                 <span className="font-navigation text-xs uppercase tracking-widest text-[var(--teal)]">Feedback Uptake Link</span>
              </div>
              <div className="font-body text-xs text-[var(--text-sec)] leading-relaxed italic">
                 Evidence of active dialogue following instructor diagnostic feedback.
              </div>
           </div>
        </div>
      </div>

      {/* Message Stream */}
      <div className="space-y-6">
        {messages.length === 0 ? (
          <div className="p-10 border border-dashed border-[var(--border)] rounded-2xl text-center text-xs text-[var(--text-muted)] uppercase tracking-widest italic">
             No message trace detected in this forensic window.
          </div>
        ) : (
          messages.map((entry, index) => {
            const isTeacher = entry.role === 'teacher';
            return (
              <div key={index} className={`flex ${isTeacher ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] relative ${isTeacher ? 'pl-4' : 'pr-4'}`}>
                   <div className={`absolute top-0 bottom-0 w-1 ${isTeacher ? 'left-0 bg-[var(--lav)]' : 'right-0 bg-[var(--teal)]'} opacity-20 rounded-full`}></div>
                   <div className="glass-card p-6 border-[var(--border)] bg-[var(--bg-deep)]">
                      <div className="flex items-center gap-3 mb-3">
                         <span className={`font-navigation text-xs uppercase font-bold tracking-widest ${isTeacher ? 'text-[var(--lav)]' : 'text-[var(--teal)]'}`}>
                            {isTeacher ? 'Instructor Trace' : 'Learner Signal'}
                         </span>
                         <span className="font-forensic text-xs text-[var(--text-muted)] opacity-50">{entry.date}</span>
                         <span className="font-forensic text-xs text-[var(--text-muted)] border-l border-[var(--border)] pl-3">{entry.topic}</span>
                         {entry.intent && (
                           <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-[var(--border)] bg-[#0a0f1e]">
                             <HelpCircle size={10} className={
                               entry.intent === 'Clarification Request' ? 'text-[var(--lav)]' :
                               entry.intent === 'Procedural Question' ? 'text-[var(--teal)]' :
                               entry.intent === 'Language Assistance' ? 'text-[#fbbf24]' :
                               'text-[var(--blue)]'
                             } />
                             <span className={`font-navigation text-xs uppercase tracking-widest font-bold ${
                               entry.intent === 'Clarification Request' ? 'text-[var(--lav)]' :
                               entry.intent === 'Procedural Question' ? 'text-[var(--teal)]' :
                               entry.intent === 'Language Assistance' ? 'text-[#fbbf24]' :
                               'text-[var(--blue)]'
                             }`}>{entry.intent}</span>
                           </div>
                         )}
                      </div>
                      <p className="font-editorial text-lg italic text-[var(--text-primary)] leading-relaxed">
                         {entry.message}
                      </p>
                   </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Formal Instructor Comments */}
      <div className="space-y-6 pt-10 border-t border-[var(--border)]">
        {comments.map((comment, index) => (
          <div key={index} className="glass-card p-10 bg-[var(--lav-dim)] border-[var(--lav-border)] relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <MessageSquareQuote className="w-32 h-32" />
             </div>

             <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-3">
                   <div className="p-2 rounded-lg bg-[var(--bg-deep)] border border-[var(--lav-border)]">
                      <MessageSquareQuote className="w-5 h-5 text-[var(--lav)]" />
                   </div>
                   <div>
                      <h4 className="font-navigation text-xs uppercase tracking-widest font-bold text-[var(--text-primary)]">Formal Instructor Assessment</h4>
                      <div className="flex items-center gap-3 mt-1">
                         <span className="font-forensic text-xs text-[var(--lav)] uppercase font-bold">{comment.assessment}</span>
                         <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]"></span>
                         <span className="font-forensic text-xs text-[var(--text-muted)]">Grade: {comment.grade}</span>
                      </div>
                   </div>
                </div>
                <div className="flex flex-col items-end">
                   <div className="flex items-center gap-2 text-xs font-forensic text-[var(--text-muted)]">
                      <Clock className="w-3 h-3" />
                      Viewed: {comment.viewedAt}
                   </div>
                </div>
             </div>

             <p className="font-editorial text-2xl italic text-[var(--text-primary)] leading-relaxed mb-8">
                &quot;{comment.comment}&quot;
             </p>

             {comment.note && (
               <div className="p-5 rounded-xl bg-[var(--bg-deep)] border border-[var(--lav-border)] border-dashed">
                  <div className="flex items-center gap-2 mb-2">
                     <Zap className="w-3.5 h-3.5 text-[var(--lav)] opacity-50" />
                     <span className="font-navigation text-xs uppercase tracking-widest font-bold text-[var(--lav)]">Private Method Note</span>
                  </div>
                  <p className="font-body text-xs text-[var(--text-sec)] italic leading-relaxed">{comment.note}</p>
               </div>
             )}
          </div>
        ))}
      </div>
    </div>
  );
};

