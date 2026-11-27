import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Cpu, Lock, Sparkles, BookOpen, ChevronDown } from 'lucide-react';
import { Button } from '../../design-system/components/Button';
import { Badge } from '../../design-system/components/Badge';
import { HeroCoreCanvas } from './HeroCoreCanvas';

export interface HeroSectionProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenAuth }) => {
  const handleScrollToHowItWorks = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.querySelector('#how-it-works');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen pt-28 pb-16 flex flex-col justify-center overflow-hidden border-b border-border-default"
    >
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-brand-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-shield-500/8 blur-[110px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Narrative & Actions (7 Cols) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 flex flex-col text-left space-y-6 z-10"
        >
          {/* Eyebrow Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="shield" size="md" hasDot pulseDot>
              TEAM SHTKS (26O2227)
            </Badge>
            <span className="hidden sm:inline-block text-xs font-mono text-slate-500">·</span>
            <span className="text-xs font-mono text-slate-400">
              COMMUNITY SDG · PRIVACY-PRESERVING AI
            </span>
          </div>

          {/* Main Cinematic Headline */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-50 leading-[1.08]">
            Confidential <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-400 to-shield-400">Intelligence.</span>
            <br />
            Academic Discovery.
          </h1>

          {/* Supporting Technical Description */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
            A real-time, privacy-preserving recommendation platform for university communities.
            Discover academic resources, campus events, and sensitive support services without ever
            revealing your personal profile or browsing habits to the central server.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onOpenAuth('register')}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Get Started
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={handleScrollToHowItWorks}
              leftIcon={<Sparkles className="h-4 w-4 text-shield-400" />}
            >
              Explore How It Works
            </Button>
          </div>

          {/* Cryptographic Trust Metrics Row */}
          <div className="pt-8 border-t border-border-subtle grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div>
              <div className="font-display text-xl font-bold text-slate-100 flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-shield-400" />
                128-bit
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                CKKS Lattice Security
              </p>
            </div>

            <div>
              <div className="font-display text-xl font-bold text-slate-100 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-status-verified" />
                Zero
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Cleartext Profile Ingestion
              </p>
            </div>

            <div>
              <div className="font-display text-xl font-bold text-slate-100 flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-brand-400" />
                2-Party
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Oblivious Secret Sharing
              </p>
            </div>

            <div>
              <div className="font-display text-xl font-bold text-slate-100 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-purple-400" />
                100%
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                FERPA-Aligned Services
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Column: 3D Cryptographic Lattice Core (5 Cols) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 relative flex items-center justify-center min-h-[360px] sm:min-h-[480px]"
        >
          <div className="w-full h-[360px] sm:h-[480px] rounded-lg border border-border-default/80 bg-void-surface/50 backdrop-blur-sm relative overflow-hidden shadow-elevated">
            {/* Interactive 3D Canvas */}
            <HeroCoreCanvas className="w-full h-full" />

            {/* Micro-telemetry overlay */}
            <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-sm bg-void-950/85 backdrop-blur-md border border-border-default flex items-center justify-between text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-status-verified animate-ping" />
                CORE INFERENCE: HOMOMORPHIC
              </span>
              <span className="text-shield-300">N=8192 · d=64</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Downward Scroll Cue */}
      <div className="mt-8 flex justify-center">
        <a
          href="#how-it-works"
          onClick={handleScrollToHowItWorks}
          className="text-slate-500 hover:text-slate-300 transition-colors p-2 flex flex-col items-center gap-1 text-[11px] font-mono"
        >
          <span>EXPLORE PIPELINE</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </a>
      </div>
    </section>
  );
};

