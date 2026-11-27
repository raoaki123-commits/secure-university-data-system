import React from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { Button } from '../../design-system/components/Button';
import { Badge } from '../../design-system/components/Badge';

export interface CtaSectionProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onOpenAuth }) => {
  return (
    <section className="relative py-24 overflow-hidden border-b border-border-default">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <Badge variant="shield" size="md" hasDot pulseDot>
          CAMPUS ONBOARDING READY
        </Badge>

        <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-50">
          Experience Zero-Knowledge <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-shield-300 to-brand-400">
            Academic Discovery Today
          </span>
        </h2>

        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          Join students, faculty, and university services in a trusted digital commons protected by
          cutting-edge cryptography.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Button
            variant="primary"
            size="lg"
            onClick={() => onOpenAuth('register')}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Create Your Account
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => onOpenAuth('login')}
            leftIcon={<Lock className="h-4 w-4 text-shield-400" />}
          >
            Sign In to Portal
          </Button>
        </div>

        <p className="pt-2 text-xs font-mono text-slate-500">
          Validated for accredited university domains (@*.edu · @*.ac.*)
        </p>
      </div>
    </section>
  );
};
