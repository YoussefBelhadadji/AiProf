import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { StatusChip } from './Atoms';
import type { RevisionSequenceStep } from '../data/diagnostic';

const kindTone = {
  draft: 'gold',
  feedback: 'red',
  revision: 'lav',
  resource: 'teal',
  final: 'teal',
} as const;

interface GrowthTimelineProps {
  sequence: RevisionSequenceStep[];
}

export function GrowthTimeline({ sequence }: GrowthTimelineProps) {
  if (!sequence || sequence.length === 0) {
    return (
      <div className="p-8 text-center text-[var(--text-sec)] border border-[var(--border)] rounded-xl bg-[var(--bg-deep)]">
        No revision events logged for this sequence.
      </div>
    );
  }

  return (
    <div className="relative pl-8 border-l border-[var(--border)] space-y-8">
      {sequence.map((step) => (
        <motion.div 
          key={`${step.timestamp}-${step.phase}`} 
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Timeline Dot */}
          <div className={clsx(
            "absolute -left-[41px] w-6 h-6 rounded-full border-[3px] border-[var(--bg-base)] flex items-center justify-center shadow-md",
            step.kind === 'feedback' ? "bg-red-500" : step.kind === 'draft' ? "bg-amber-500" : "bg-[var(--lav)]"
          )}>
            {step.kind === 'final' && <CheckCircle2 size={12} className="text-white" />}
          </div>

          <div className="bg-[var(--bg-deep)] border border-[var(--border)] p-6 rounded-2xl shadow-md hover:border-[var(--lav-border)] transition-colors group">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] group-hover:text-[var(--lav)] transition-colors">{step.timestamp}</span>
                  <StatusChip variant={kindTone[step.kind] as any} className="px-2 py-0.5 text-xs">{step.kind}</StatusChip>
                </div>
                <h4 className="font-navigation font-semibold text-[var(--text-primary)] mb-2 text-lg">{step.phase}</h4>
                <p className="font-body text-sm text-[var(--text-sec)] leading-relaxed">{step.detail}</p>
              </div>
              {step.kind === 'feedback' && (
                <div className="shrink-0 flex items-center justify-center">
                  <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 max-w-[200px] text-center">
                    <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Teacher Action</p>
                    <p className="text-xs text-[var(--text-primary)] font-medium italic leading-snug">Intervention Triggered</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

