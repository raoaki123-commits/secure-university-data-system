import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'pills' | 'underline';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'pills',
  className,
}) => {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 p-1 bg-void-surface rounded-sm border border-border-default',
        variant === 'underline' && 'bg-transparent border-b border-t-0 border-x-0 rounded-none p-0 gap-4',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 rounded-sm select-none',
              isActive
                ? 'text-slate-100 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-void-elevated/50'
            )}
          >
            {isActive && variant === 'pills' && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-void-elevated rounded-sm border border-border-default shadow-subtle"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            {isActive && variant === 'underline' && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute -bottom-px left-0 right-0 h-0.5 bg-brand-500"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'px-1.5 py-0.2 rounded-full text-[10px] font-mono',
                    isActive
                      ? 'bg-brand-500/20 text-brand-300'
                      : 'bg-void-base text-slate-500'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};

