import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { HowItWorksSection } from './HowItWorksSection';
import { FeaturesSection } from './FeaturesSection';
import { PrivacySection } from './PrivacySection';
import { TechStackSection } from './TechStackSection';
import { MissionSection } from './MissionSection';
import { CtaSection } from './CtaSection';
import { Footer } from './Footer';
import { AuthModal } from './AuthModal';
import { DesignSystemShowcase } from '../../design-system/DesignSystemShowcase';
import { Sliders, Eye } from 'lucide-react';

export interface LandingPageProps {
  onOpenPortal?: () => void;
  onNavigateFullscreenAuth?: (mode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenPortal,
  onNavigateFullscreenAuth,
}) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showTokensView, setShowTokensView] = useState(false);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  if (showTokensView) {
    return (
      <div className="relative">
        {/* Floating Toggle to Return to Landing Page */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowTokensView(false)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-brand-500 text-slate-50 font-mono text-xs font-semibold shadow-brand-glow hover:bg-brand-600 transition-all border border-brand-400"
          >
            <Eye className="h-4 w-4" />
            Return to Cinematic Landing Page
          </button>
        </div>
        <DesignSystemShowcase />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void text-slate-100 flex flex-col selection:bg-brand-500/30 selection:text-brand-200">
      {/* Floating Design System Inspector Pill for Mentors & Evaluators */}
      <div className="fixed bottom-5 right-5 z-40 hidden sm:block">
        <button
          onClick={() => setShowTokensView(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-void-elevated/90 backdrop-blur-md border border-border-default text-slate-400 hover:text-slate-100 hover:border-brand-500/50 text-[11px] font-mono shadow-subtle transition-all"
          title="Inspect Phase 2 Design Tokens & Components"
        >
          <Sliders className="h-3.5 w-3.5 text-brand-400" />
          <span>Tokens & Component Catalog</span>
        </button>
      </div>

      {/* Navigation */}
      <Navbar onOpenAuth={handleOpenAuth} onOpenPortal={onOpenPortal} />

      {/* Main Page Flow */}
      <main className="flex-1">
        <HeroSection onOpenAuth={handleOpenAuth} />
        <HowItWorksSection />
        <FeaturesSection />
        <PrivacySection />
        <TechStackSection />
        <MissionSection />
        <CtaSection onOpenAuth={handleOpenAuth} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Auth & Onboarding Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onOpenPortal={onOpenPortal}
        onNavigateFullscreen={onNavigateFullscreenAuth}
      />
    </div>
  );
};
