import React, { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      type = 'button', // Ensures forms don't randomly submit
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    // Structural Base
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--lav)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] whitespace-nowrap';

    // Sizing Matrix
    const sizes = {
      sm: 'h-9 px-3 text-xs gap-1.5',
      md: 'h-11 px-5 text-sm gap-2',
      lg: 'h-14 px-8 text-base gap-2.5',
      icon: 'h-11 w-11 shrink-0',
    };

    // Variant Matrix tied directly to Phase 1 OKLCH Tokens
    const variants = {
      primary:
        'bg-[var(--lav)] text-white hover:bg-[var(--color-primary-600)] dark:hover:bg-[var(--color-primary-500)] focus-visible:ring-[var(--lav)] border border-transparent shadow-sm',
      secondary:
        'bg-[var(--bg-raised)] text-[var(--text-primary)] hover:bg-[var(--color-neutral-200)] dark:hover:bg-[var(--color-neutral-800)] border border-[var(--border)] focus-visible:ring-[var(--border)]',
      destructive:
        'bg-[var(--color-danger-500)] text-white hover:bg-[var(--color-danger-600)] focus-visible:ring-[var(--color-danger-500)] border border-transparent shadow-sm',
      ghost:
        'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)] focus-visible:ring-[var(--border)]',
      link:
        'bg-transparent text-[var(--lav)] hover:underline underline-offset-4 focus-visible:ring-[var(--lav)] px-0 h-auto',
    };

    const widthClass = fullWidth ? 'w-full' : '';
    const finalClassName = `${baseStyles} ${sizes[size]} ${variants[variant]} ${widthClass} ${className}`.trim();

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        aria-disabled={disabled || isLoading}
        aria-label={size === 'icon' && !ariaLabel && typeof children !== 'string' ? "Button icon" : ariaLabel}
        className={finalClassName}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" aria-hidden="true" />}
        
        {!isLoading && leftIcon && (
          <span className="shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        
        {size !== 'icon' && <span className="truncate">{children}</span>}
        {size === 'icon' && !isLoading && children}
        
        {!isLoading && rightIcon && (
          <span className="shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
