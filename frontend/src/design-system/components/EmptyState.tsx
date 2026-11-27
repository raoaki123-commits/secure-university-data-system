import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { cn } from '../utils';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-md border border-border-default bg-void-surface/50',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-void-elevated border border-border-default text-slate-400 mb-4">
        {icon || <ShieldAlert className="h-6 w-6 text-brand-400" />}
      </div>
      <h4 className="font-display text-base font-semibold text-slate-200">{title}</h4>
      <p className="mt-1.5 max-w-sm text-xs text-slate-400 leading-relaxed mb-5">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

