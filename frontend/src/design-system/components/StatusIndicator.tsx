import React from 'react';
import { cn } from '../utils';

export interface StatusIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: 'online' | 'evaluating' | 'warning' | 'offline';
  label: string;
  subtext?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  className,
  status = 'online',
  label,
  subtext,
  ...props
}) => {
  const statusConfig = {
    online: {
      dot: 'bg-status-verified',
      ping: 'bg-status-verified',
      text: 'text-slate-200',
    },
    evaluating: {
      dot: 'bg-shield-400',
      ping: 'bg-shield-400',
      text: 'text-shield-300',
    },
    warning: {
      dot: 'bg-status-pending',
      ping: 'bg-status-pending',
      text: 'text-amber-300',
    },
    offline: {
      dot: 'bg-slate-500',
      ping: 'bg-slate-500',
      text: 'text-slate-400',
    },
  };

  const current = statusConfig[status];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2.5 px-3 py-1.5 rounded-sm bg-void-surface border border-border-default font-mono text-xs',
        className
      )}
      {...props}
    >
      <span className="relative flex h-2 w-2">
        {status !== 'offline' && (
          <span
            className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', current.ping)}
          />
        )}
        <span className={cn('relative inline-flex rounded-full h-2 w-2', current.dot)} />
      </span>
      <div className="flex flex-col">
        <span className={cn('font-medium leading-none', current.text)}>{label}</span>
        {subtext && <span className="text-[10px] text-slate-500 mt-0.5">{subtext}</span>}
      </div>
    </div>
  );
};

