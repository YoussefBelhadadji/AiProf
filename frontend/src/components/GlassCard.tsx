import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 'low' | 'mid' | 'high';
  accent?: 'lav' | 'teal' | 'gold' | 'red' | 'none';
  glow?: boolean;
  pedagogicalLabel?: string;
  children: React.ReactNode;
}

export function GlassCard({
  elevation = 'low',
  accent = 'none',
  glow = false,
  pedagogicalLabel,
  className,
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'glass-card p-4 relative group',
          {
            'bg-[var(--bg-card)]': elevation === 'low',
            'bg-[var(--bg-raised)]': elevation === 'mid',
            'bg-[var(--bg-high)]': elevation === 'high',
            'accent-lav': accent === 'lav',
            'accent-teal': accent === 'teal',
            'accent-gold': accent === 'gold',
            'accent-red': accent === 'red',
            'glow-lav': glow && accent === 'lav',
          },
          className
        )
      )}
      {...props}
    >
      {children}
      {pedagogicalLabel && (
        <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--bg-high)] border border-[var(--border)] text-[var(--text-sec)] text-xs p-2 rounded -bottom-10 left-0 w-max max-w-xs z-50 pointer-events-none">
          {pedagogicalLabel}
        </div>
      )}
    </div>
  );
}
