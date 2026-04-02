import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GlassCard } from './GlassCard';

export interface MetricCardProps {
  value: string | number;
  label: string;
  interpretation: string;
  accent?: 'lav' | 'teal' | 'gold' | 'red';
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  className?: string;
}

export function MetricCard({
  value,
  label,
  interpretation,
  accent = 'lav',
  trend,
  trendDirection,
  icon: Icon,
  className,
}: MetricCardProps) {
  return (
    <GlassCard accent={accent} className={twMerge(clsx('flex flex-col gap-2 min-w-0', className))}>
      <div className="flex items-center gap-2 text-[var(--text-sec)] font-body text-sm font-medium min-w-0">
        {Icon && <Icon size={16} />}
        <span className="break-words">{label}</span>
      </div>
      <div className="flex flex-wrap items-baseline gap-3 min-w-0">
        <span className="font-forensic text-3xl font-medium text-[var(--text-primary)] break-words">
          {value}
        </span>
        {trend && (
          <span
            className={clsx('text-xs font-mono font-medium break-words', {
              'text-[var(--blue)]': trendDirection === 'up',
              'text-[var(--navy)]': trendDirection === 'down',
              'text-[var(--violet)]': trendDirection === 'neutral',
            })}
          >
            {trendDirection === 'up' ? '^' : trendDirection === 'down' ? 'v' : '>'} {trend}
          </span>
        )}
      </div>
      <div className="mt-1 pt-2 border-t border-[var(--border)] text-[var(--text-sec)] text-xs leading-relaxed break-words">
        {interpretation}
      </div>
    </GlassCard>
  );
}
