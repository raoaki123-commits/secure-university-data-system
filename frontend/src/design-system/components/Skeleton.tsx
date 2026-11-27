import React from 'react';
import { cn } from '../utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  ...props
}) => {
  const variantStyles = {
    rectangular: 'rounded-sm',
    circular: 'rounded-full',
    text: 'rounded-sm h-4 w-full',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-void-elevated/70 border border-border-subtle',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
};

