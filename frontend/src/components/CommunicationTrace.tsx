import { MessageSquare, MessageSquareQuote } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { StatusChip } from './Atoms';
import type { DialogueMessage, InstructorComment } from '../data/diagnostic';

interface CommunicationTraceProps {
  messages: DialogueMessage[];
  comments: InstructorComment[];
  title?: string;
  subtitle?: string;
}

export function CommunicationTrace({
  messages,
  comments,
  title = 'Teacher-Student Dialogue',
  subtitle = 'Workbook-backed exchange and Moodle comment trace.',
}: CommunicationTraceProps) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare size={16} className="text-[var(--lav)]" />
          <h3 className="font-navigation text-sm uppercase tracking-widest text-[var(--text-primary)]">{title}</h3>
        </div>
        <p className="font-body text-xs text-[var(--text-sec)]">{subtitle}</p>
      </div>

      <div className="space-y-3">
        {messages.map((entry, index) => {
          const isTeacher = entry.role === 'teacher';
          return (
            <div key={`${entry.date}-${entry.topic}-${index}`} className={`flex ${isTeacher ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`max-w-[92%] rounded-xl border px-4 py-3 ${
                  isTeacher
                    ? 'bg-[var(--lav-glow)] border-[var(--lav-border)]'
                    : 'bg-[var(--bg-raised)] border-[var(--border)]'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <StatusChip variant={isTeacher ? 'lav' : 'teal'}>{isTeacher ? 'Teacher' : 'Student'}</StatusChip>
                  <span className="font-navigation text-[10px] uppercase tracking-widest text-[var(--text-muted)]">{entry.date}</span>
                  <span className="font-forensic text-[10px] text-[var(--text-sec)]">{entry.topic}</span>
                </div>
                <p className="font-body text-sm leading-relaxed text-[var(--text-primary)]">{entry.message}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        {comments.map((comment, index) => (
          <GlassCard key={`${comment.assessment}-${index}`} accent="lav" glow className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquareQuote size={16} className="text-[var(--gold)]" />
              <h4 className="font-navigation text-xs uppercase tracking-widest text-[var(--gold)]">Instructor Comment</h4>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <StatusChip variant="gold">{comment.assessment}</StatusChip>
              <span className="font-forensic text-[10px] text-[var(--text-sec)]">Grade: {comment.grade}</span>
              <span className="font-forensic text-[10px] text-[var(--text-muted)]">Viewed: {comment.viewedAt}</span>
            </div>
            <p className="font-body text-sm leading-relaxed text-[var(--text-primary)]">{comment.comment}</p>
            {comment.note && (
              <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-4 py-3">
                <div className="font-navigation text-[10px] uppercase tracking-widest text-[var(--lav)] mb-1">Teacher Note</div>
                <p className="font-body text-sm text-[var(--text-sec)]">{comment.note}</p>
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
