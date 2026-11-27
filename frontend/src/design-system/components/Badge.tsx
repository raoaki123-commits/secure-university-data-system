import React from 'react';
import { cn } from '../utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'verified' | 'shield' | 'confidential' | 'pending' | 'neutral' | 'danger';
  size?: 'sm' | 'md';
  hasDot?: boolean;
  pulseDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  hasDot = false,
  pulseDot = false,
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center font-mono font-medium tracking-wide rounded-full border transition-colors select-none';

  const variants = {
    verified:
      'bg-status-verified/10 text-status-verified border-status-verified/30',
    shield:
      'bg-shield-500/10 text-shield-400 border-shield-500/30',
    confidential:
      'bg-status-confidential/15 text-purple-300 border-status-confidential/35',
    pending:
      'bg-status-pending/10 text-status-pending border-status-pending/30',
    neutral:
      'bg-void-surface text-slate-300 border-border-default',
    danger:
      'bg-status-danger/10 text-status-danger border-status-danger/30',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const dotColors = {
    verified: 'bg-status-verified',
    shield: 'bg-shield-400',
    confidential: 'bg-status-confidential',
    pending: 'bg-status-pending',
    neutral: 'bg-slate-400',
    danger: 'bg-status-danger',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {hasDot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulseDot && (
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                dotColors[variant]
              )}
            />
          )}
          <span
            className={cn('relative inline-flex rounded-full h-1.5 w-1.5', dotColors[variant])}
          />
        </span>
      )}
      {children}
    </span>
  );
};

