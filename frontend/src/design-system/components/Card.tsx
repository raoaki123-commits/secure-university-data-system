import React, { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../utils';

export interface CardProps extends HTMLMotionProps<'div'> {
  interactive?: boolean;
  glow?: 'none' | 'brand' | 'shield';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, glow = 'none', children, ...props }, ref) => {
    const glowStyles = {
      none: '',
      brand: 'hover:shadow-brand-glow hover:border-brand-500/40',
      shield: 'hover:shadow-shield-glow hover:border-shield-500/40',
    };

    return (
      <motion.div
        ref={ref}
        whileHover={interactive ? { y: -2, transition: { duration: 0.15 } } : undefined}
        className={cn(
          'bg-void-surface text-slate-100 rounded-md border border-border-default shadow-subtle transition-all',
          interactive && 'hover:bg-void-elevated hover:border-border-hover cursor-pointer',
          glowStyles[glow],
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-5 pb-3 flex flex-col gap-1.5', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('font-display text-lg font-semibold tracking-tight text-slate-100', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-slate-400 leading-relaxed', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-5 pt-0 text-sm text-slate-300', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-5 pt-0 flex items-center justify-between border-t border-border-subtle mt-4', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

