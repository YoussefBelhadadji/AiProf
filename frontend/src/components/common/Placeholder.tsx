import React, { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Construction, Sparkles, Beaker, Clock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility to merge tailwind classes safely
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PlaceholderProps {
  title: string;
  description?: string;
  status?: 'Draft' | 'Stable' | 'In Development' | 'Experimental';
  comingSoon?: boolean;
  actions?: ReactNode;
  icon?: 'construction' | 'beaker' | 'sparkles';
  className?: string;
}

export const Placeholder: React.FC<PlaceholderProps> = ({
  title,
  description = "This module is currently being finalized in the research laboratory. Access will be granted shortly.",
  status = 'In Development',
  comingSoon = true,
  actions,
  icon = 'beaker',
  className
}) => {
  const IconComponent = {
    construction: Construction,
    beaker: Beaker,
    sparkles: Sparkles
  }[icon];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "glass-card premium-blur p-12 flex flex-col items-center text-center max-w-2xl mx-auto my-12 relative overflow-hidden",
        className
      )}
    >
      {/* Background Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--lav-glow)] rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[var(--blue-glow)] rounded-full blur-[80px] pointer-events-none" />

      {/* Hero Icon Area */}
      <div className="relative mb-8">
        <div className="w-16 h-16 rounded-2xl bg-[var(--lav-dim)] border border-[var(--lav-border)] flex items-center justify-center animate-float">
          <IconComponent className="w-8 h-8 text-[var(--lav)]" />
        </div>
        {comingSoon && (
          <div className="absolute -top-2 -right-2 flex items-center gap-1.5 px-2.5 py-1 bg-[var(--bg-elevated)] border border-[var(--border-bright)] rounded-full shadow-lg">
            <Clock className="w-3 h-3 text-[var(--accent-amber)]" />
            <span className="text-[10px] font-navigation font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Scheduled
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4 relative z-10">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-navigation text-gradient-lav">
            {title}
          </h2>
          <div className={cn(
            "chip inline-flex items-center",
            status === 'Stable' ? 'chip-teal' : 'chip-amber'
          )}>
            {status}
          </div>
        </div>
        
        <p className="text-[var(--text-secondary)] font-body leading-relaxed max-w-lg">
          {description}
        </p>
      </div>

      {/* Action Slot */}
      {actions && (
        <div className="mt-10 flex gap-4">
          {actions}
        </div>
      )}

      {/* Status Indicators */}
      <div className="absolute bottom-4 right-6 flex items-center gap-2 opacity-40">
        <span className="text-[10px] font-forensic uppercase tracking-widest text-[var(--text-muted)]">
          Adaptive Engine v2.4-STUB
        </span>
        <div className="phosphor animate-pulse-subtle" />
      </div>
    </motion.div>
  );
};
