import type { LucideIcon } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  className 
}: EmptyStateProps) {
  return (
    <GlassCard className={`flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-[var(--border)] bg-transparent ${className}`}>
      <div className="p-4 rounded-full bg-[var(--bg-raised)] text-[var(--text-muted)] mb-4">
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-editorial italic text-[var(--text-primary)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--text-sec)] max-w-sm mx-auto mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 bg-[var(--lav)] hover:bg-[var(--lav-glow)] text-white text-xs font-navigation uppercase tracking-widest rounded-full transition-all shadow-[0_0_15px_var(--lav-glow)]"
        >
          {actionLabel}
        </button>
      )}
    </GlassCard>
  );
}
