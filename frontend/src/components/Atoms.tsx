import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- STATUS CHIP ---
export interface StatusChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant: 'lav' | 'teal' | 'gold' | 'red';
}
export function StatusChip({ variant, className, children, ...props }: StatusChipProps) {
  return (
    <span className={twMerge(clsx('chip', `chip-${variant}`, className))} {...props}>
      {children}
    </span>
  );
}

// --- PHOSPHOR INDICATOR ---
export function PhosphorIndicator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge(clsx('phosphor inline-block', className))} {...props} />
  );
}

// --- BUTTONS ---
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', isLoading, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={twMerge(
          clsx(`btn-${variant} flex items-center justify-center gap-2 whitespace-nowrap`, {
            'opacity-70 cursor-wait': isLoading,
          }, className)
        )}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {isLoading ? 'Processing...' : children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// --- DUAL LAYER PROGRESS BAR ---
export interface DualLayerProgressBarProps {
  confidenceLow: number;
  confidenceHigh: number;
  actualValue: number;
  label?: string;
  colorClass?: string;
  className?: string;
}
export function DualLayerProgressBar({
  confidenceLow,
  confidenceHigh,
  actualValue,
  label,
  colorClass = 'text-[var(--lav)]',
  className,
}: DualLayerProgressBarProps) {
  const confWidth = Math.max(0, confidenceHigh - confidenceLow);

  return (
    <div className={twMerge(clsx('w-full flex flex-col gap-1.5', className, colorClass))}>
      {label && <div className="text-xs font-body text-[var(--text-sec)]">{label}</div>}
      <div className="progress-track w-full">
        <div
          className="progress-confidence"
          style={{
            left: `${confidenceLow}%`,
            width: `${confWidth}%`,
          }}
        />
        <div
          className="progress-actual shadow-[0_0_10px_currentColor]"
          style={{ width: `${actualValue}%` }}
        />
      </div>
    </div>
  );
}

// --- STUDY PROGRESS TIMELINE ---
export interface TimelineStep {
  label: string;
  status: 'completed' | 'current' | 'upcoming';
}

export function StudyProgressTimeline({ steps, className }: { steps: TimelineStep[]; className?: string }) {
  return (
    <div className={twMerge('flex items-center w-full gap-2 md:gap-4', className)}>
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-2 group flex-1 min-w-0">
            <div
              className={clsx(
                'w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-navigation text-[10px] md:text-xs border transition-all duration-500 shrink-0 font-bold',
                {
                  'bg-[var(--teal)] border-[var(--teal)] text-[var(--bg-deep)] shadow-[0_0_15px_var(--teal-dim)]': step.status === 'completed',
                  'bg-[var(--lav)] border-[var(--lav)] text-[var(--bg-deep)] shadow-[0_0_15px_var(--lav-glow)] scale-110': step.status === 'current',
                  'bg-transparent border-[var(--border)] text-[var(--text-muted)]': step.status === 'upcoming',
                }
              )}
            >
              {step.status === 'completed' ? 'OK' : i + 1}
            </div>
            <span
              className={clsx(
                'text-[8px] md:text-[9px] uppercase tracking-widest font-navigation transition-colors text-center truncate w-full px-1',
                {
                  'text-[var(--teal)]': step.status === 'completed',
                  'text-[var(--lav)] font-bold': step.status === 'current',
                  'text-[var(--text-muted)]': step.status === 'upcoming',
                }
              )}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={clsx(
                'h-[1px] flex-1 mb-5 md:mb-6 transition-colors duration-500 min-w-[10px]',
                step.status === 'completed' ? 'bg-[var(--teal)]' : 'bg-[var(--border)]'
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
