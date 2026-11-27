import React from 'react';
import { Menu, Home, Bookmark, Sparkles } from 'lucide-react';
import { StatusIndicator } from '../../../design-system/components/StatusIndicator';
import type { StudentNavTab } from './StudentSidebar';

interface StudentHeaderProps {
  activeTab: StudentNavTab;
  onOpenMobileSidebar: () => void;
  onNavigateHome: () => void;
  savedCount: number;
  onSelectTab: (tab: StudentNavTab) => void;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  activeTab,
  onOpenMobileSidebar,
  onNavigateHome,
  savedCount,
  onSelectTab,
}) => {
  const tabTitles: Record<StudentNavTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'Student Overview',
      subtitle: 'Your unified private discovery hub and academic feed',
    },
    resources: {
      title: 'Academic Resources Catalog',
      subtitle: 'Course study notes, peer guides, and departmental research archives',
    },
    events: {
      title: 'Campus Events & Symposia',
      subtitle: 'Collegiate hackathons, guest academic lectures, and career workshops',
    },
    services: {
      title: 'University Services & Welfare',
      subtitle: 'Confidential counseling, accessibility accommodations, and IT loaners',
    },
    recommendations: {
      title: 'Personalized Recommendations',
      subtitle: 'Curated university suggestions calibrated via privacy-preserving matching',
    },
    saved: {
      title: 'Saved Academic Stash',
      subtitle: 'Your personal bookmarked resources, events, and campus services',
    },
    history: {
      title: 'Recommendation History',
      subtitle: 'Timeline of past recommendations and recorded model feedback',
    },
    privacy: {
      title: 'Privacy Center & Cryptographic Controls',
      subtitle: 'Zero-Knowledge audit controls, noise parameters, and consent toggles',
    },
    profile: {
      title: 'Student Profile & Department',
      subtitle: 'Manage your verified institutional identity and academic affiliation',
    },
    settings: {
      title: 'Security & Account Settings',
      subtitle: 'Session governance, Argon2id password rotation, and notification preferences',
    },
  };

  const current = tabTitles[activeTab];

  return (
    <header className="sticky top-0 z-20 h-16 bg-void-elevated/90 backdrop-blur-md border-b border-border-default px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-sm text-slate-400 hover:text-slate-100 hover:bg-void-surface transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="font-display text-sm font-bold tracking-tight text-slate-100">
            {current.title}
          </h1>
          <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Quick actions & Indicators */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* CKKS Status Indicator */}
        <StatusIndicator
          status="online"
          label="CKKS-128b"
          subtext="Zero Cleartext"
          className="hidden lg:inline-flex py-0.5 px-2 text-[10px]"
        />

        {/* Quick Recommendations CTA */}
        <button
          onClick={() => onSelectTab('recommendations')}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-300 text-xs font-mono transition-all"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Recommendations</span>
        </button>

        {/* Saved Items Counter Shortcut */}
        <button
          onClick={() => onSelectTab('saved')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-void-surface hover:bg-void-elevated border border-border-default text-slate-300 text-xs font-mono transition-colors"
          title="View Saved Items"
        >
          <Bookmark className="h-3.5 w-3.5 text-accent-cyan" />
          <span className="hidden sm:inline">Saved:</span>
          <span className="font-semibold text-slate-100">{savedCount}</span>
        </button>

        <div className="h-4 w-px bg-border-default hidden sm:block" />

        {/* Return to Public Landing */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-void-surface hover:bg-void-elevated border border-border-default text-slate-400 hover:text-slate-100 text-xs font-mono transition-colors"
          title="Return to Public Landing Page"
        >
          <Home className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Landing</span>
        </button>
      </div>
    </header>
  );
};
