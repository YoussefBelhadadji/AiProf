import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Lightbulb } from 'lucide-react';

export interface PedagogicalInsightBadgeProps {
  label: string;
  observation: string;
  implication?: string;
  action?: string;
  citation: string;
  urgency?: 'info' | 'positive' | 'monitor' | 'urgent';
  className?: string;
}

export function PedagogicalInsightBadge({
  label,
  observation,
  implication,
  action,
  citation,
  urgency = 'info',
  className,
}: PedagogicalInsightBadgeProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'rounded-lg p-4 border border-[var(--border)] relative overflow-hidden min-w-0 w-full',
          {
            'bg-[var(--lav-glow)] border-[var(--lav-border)] text-[var(--lav)]': urgency === 'info',
            'bg-[var(--blue-dim)] border-[var(--border-bright)] text-[var(--blue)]': urgency === 'positive',
            'bg-[var(--violet-dim)] border-[var(--border-bright)] text-[var(--violet)]': urgency === 'monitor',
            'bg-[var(--navy-dim)] border-[var(--border-bright)] text-[var(--navy)]': urgency === 'urgent',
          },
          className
        )
      )}
    >
      <div className="flex gap-3 relative z-10 min-w-0 items-start">
        <div className="shrink-0 mt-0.5">
          <Lightbulb size={18} className="drop-shadow-md" />
        </div>
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <span className="font-navigation font-medium uppercase tracking-wider text-xs break-words leading-relaxed">
            {label}
          </span>
          <div className="text-[var(--text-primary)] font-body text-sm leading-relaxed break-words">
            <span className="font-medium mr-1">{observation}</span>
            {implication && <span className="text-[var(--text-sec)]">{implication}</span>}
          </div>
          {action && (
            <div className="text-sm font-body mt-1 font-medium underline underline-offset-4 decoration-[var(--border-bright)] hover:text-[var(--text-primary)] transition-colors inline-block max-w-full break-words leading-relaxed">
              {action}
            </div>
          )}
          <div className="mt-3 text-xs font-forensic text-[var(--text-muted)] flex items-start gap-1.5 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50 block mt-1 shrink-0" />
            <span className="break-words leading-relaxed">{citation}</span>
          </div>
        </div>
      </div>
      
      {/* Decorative background glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-current opacity-[0.03] blur-2xl pointer-events-none" />
    </div>
  );
}

