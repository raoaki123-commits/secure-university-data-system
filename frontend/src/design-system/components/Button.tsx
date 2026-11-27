import React, { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'shield' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-void-base disabled:pointer-events-none disabled:opacity-50 select-none';

    const variants = {
      primary:
        'bg-brand-500 text-slate-50 hover:bg-brand-600 active:bg-brand-700 shadow-subtle hover:shadow-brand-glow',
      secondary:
        'bg-void-elevated text-slate-100 hover:bg-void-overlay border border-border-default hover:border-border-hover',
      shield:
        'bg-shield-500 text-void-950 hover:bg-shield-400 active:bg-shield-600 shadow-subtle hover:shadow-shield-glow font-semibold',
      outline:
        'bg-transparent text-slate-200 border border-border-default hover:bg-void-surface hover:border-border-hover',
      ghost:
        'bg-transparent text-slate-300 hover:bg-void-surface hover:text-slate-100',
      danger:
        'bg-status-danger/10 text-status-danger hover:bg-status-danger/20 border border-status-danger/30',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={disabled || isLoading ? undefined : { scale: 0.985 }}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-current" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

