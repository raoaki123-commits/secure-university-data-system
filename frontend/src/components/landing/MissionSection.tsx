import React from 'react';
import { HeartHandshake, Shield, Sparkles } from 'lucide-react';
import { Badge } from '../../design-system/components/Badge';

export const MissionSection: React.FC = () => {
  return (
    <section id="mission" className="py-24 border-b border-border-default bg-void-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
          {/* Left Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Badge variant="shield" size="md">
              COMMUNITY SDG MISSION
            </Badge>

            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-100">
              Dismantling the "Chilling Effect" in Higher Education
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              When students fear that seeking mental health counseling, academic recovery workshops, or
              emergency financial grants creates digital footprints accessible to professors or peers,
              they retreat into silence. This institutional chilling effect directly undermines student
              retention and equity.
            </p>

            <p className="text-sm text-slate-400 leading-relaxed">
              Developed by Team SHTKS (26O2227) under the Community SDG category, our project proves
              that modern machine learning can operate within zero-knowledge cryptographic boundaries,
              democratizing access to high-value resources while respecting absolute human dignity.
            </p>

            {/* SDG Pill Badges */}
            <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono">
              <span className="px-3 py-1.5 rounded-sm bg-void-elevated border border-border-default text-slate-300">
                SDG 4: Quality Education
              </span>
              <span className="px-3 py-1.5 rounded-sm bg-void-elevated border border-border-default text-slate-300">
                SDG 9: Industry & Innovation
              </span>
              <span className="px-3 py-1.5 rounded-sm bg-void-elevated border border-border-default text-slate-300">
                SDG 16: Strong Institutions
              </span>
            </div>
          </div>

          {/* Right Column: Values Grid (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-md border border-border-default bg-void-surface">
              <div className="flex items-center gap-3 mb-2">
                <span className="p-2 rounded-sm bg-brand-500/10 text-brand-400 border border-brand-500/30">
                  <Shield className="h-4 w-4" />
                </span>
                <h3 className="font-display text-sm font-semibold text-slate-100">
                  Privacy as a Fundamental Right
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Academic exploration must be fearless. Sensitive queries are never logged, monetized,
                or shared with third-party networks.
              </p>
            </div>

            <div className="p-5 rounded-md border border-border-default bg-void-surface">
              <div className="flex items-center gap-3 mb-2">
                <span className="p-2 rounded-sm bg-shield-500/10 text-shield-400 border border-shield-500/30">
                  <Sparkles className="h-4 w-4" />
                </span>
                <h3 className="font-display text-sm font-semibold text-slate-100">
                  Contextual Equity
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Resources are matched based on semantic necessity and learning profile, not popularity
                algorithms that favor privileged demographics.
              </p>
            </div>

            <div className="p-5 rounded-md border border-border-default bg-void-surface">
              <div className="flex items-center gap-3 mb-2">
                <span className="p-2 rounded-sm bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  <HeartHandshake className="h-4 w-4" />
                </span>
                <h3 className="font-display text-sm font-semibold text-slate-100">
                  Campus-Wide Collaboration
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Empowering university staff and student unions to govern independent trust nodes,
                ensuring decentralized accountability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
