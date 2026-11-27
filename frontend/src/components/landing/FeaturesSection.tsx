import React from 'react';
import {
  GraduationCap,
  Calendar,
  Lock,
  ShieldCheck,
  Sliders,
  Sparkles,
  ArrowUpRight,
  Fingerprint,
  UserCheck,
} from 'lucide-react';
import { Badge } from '../../design-system/components/Badge';

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-24 border-b border-border-default">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-left max-w-2xl space-y-3 mb-16">
          <Badge variant="shield" size="md">
            INTELLIGENT ECOSYSTEM
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-100">
            Engineered for Academic Rigor and Institutional Trust
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Every feature is designed with dual objectives: delivering hyper-relevant campus
            discovery while mathematically safeguarding individual privacy.
          </p>
        </div>

        {/* Asymmetric Bento Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Bento Feature 1: Large Span 8 Cols - Academic Resource Discovery */}
          <div className="md:col-span-8 p-7 rounded-md border border-border-default bg-void-surface hover:border-border-hover transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2 rounded-sm bg-brand-500/10 text-brand-400 border border-brand-500/30">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <Badge variant="verified" size="sm">
                  SEMANTIC TWO-TOWER TF
                </Badge>
              </div>

              <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-100 group-hover:text-brand-300 transition-colors mb-2">
                Curriculum-Aligned Academic Discovery
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                Trained on course syllabi, departmental study guides, and peer tutoring logs, our
                TensorFlow Two-Tower model maps academic content into a shared 64-dimensional latent
                space, recommending targeted resources without scraping personal transcripts.
              </p>
            </div>

            {/* Visual Micro-card */}
            <div className="mt-6 p-4 rounded-sm bg-void-elevated border border-border-default flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-300">
                <Sparkles className="h-4 w-4 text-brand-400" />
                <span>CS-402: Advanced Distributed Systems Notes</span>
              </div>
              <span className="text-status-verified bg-status-verified/10 px-2 py-0.5 rounded-full border border-status-verified/30">
                98% Semantic Fit
              </span>
            </div>
          </div>

          {/* Bento Feature 2: Span 4 Cols - Confidential Campus Services */}
          <div className="md:col-span-4 p-7 rounded-md border border-border-default bg-void-surface hover:border-shield-500/40 hover:shadow-shield-glow/20 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2 rounded-sm bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  <Lock className="h-5 w-5" />
                </span>
                <Badge variant="confidential" size="sm" hasDot pulseDot>
                  FERPA SECURE
                </Badge>
              </div>

              <h3 className="font-display text-lg font-bold text-slate-100 group-hover:text-purple-300 transition-colors mb-2">
                Confidential Support Services
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect with psychological counseling, emergency financial aid, and accessibility
                accommodations without generating digital footprints in centralized institutional logs.
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-border-subtle flex items-center justify-between text-xs font-mono text-purple-300">
              <span>Zero Cleartext Logging</span>
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>

          {/* Bento Feature 3: Span 4 Cols - University Event Discovery */}
          <div className="md:col-span-4 p-7 rounded-md border border-border-default bg-void-surface hover:border-border-hover transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2 rounded-sm bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Calendar className="h-5 w-5" />
                </span>
                <Badge variant="shield" size="sm">
                  REAL-TIME SYNC
                </Badge>
              </div>

              <h3 className="font-display text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mb-2">
                Campus Events & Symposia
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Personalized suggestions for guest lectures, hackathons, and research symposia
                matched to your academic focus and scheduling availability.
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-border-subtle flex items-center justify-between text-xs font-mono text-cyan-300">
              <span>Blind RSVP Integration</span>
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>

          {/* Bento Feature 4: Span 4 Cols - User-Controlled Cryptographic Autonomy */}
          <div className="md:col-span-4 p-7 rounded-md border border-border-default bg-void-surface hover:border-border-hover transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2 rounded-sm bg-brand-500/10 text-brand-400 border border-brand-500/30">
                  <Sliders className="h-5 w-5" />
                </span>
                <Badge variant="neutral" size="sm">
                  USER SOVEREIGNTY
                </Badge>
              </div>

              <h3 className="font-display text-lg font-bold text-slate-100 group-hover:text-brand-300 transition-colors mb-2">
                Cryptographic Key Autonomy
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Rotate your CKKS public keys with one click to instantly sever past vector history.
                Full GDPR "Right to be Forgotten" hard deletes all orphaned records.
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-border-subtle flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Instant Key Invalidation</span>
              <Fingerprint className="h-4 w-4 text-brand-400" />
            </div>
          </div>

          {/* Bento Feature 5: Span 4 Cols - Multi-Role Institutional Governance */}
          <div className="md:col-span-4 p-7 rounded-md border border-border-default bg-void-surface hover:border-border-hover transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2 rounded-sm bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <UserCheck className="h-5 w-5" />
                </span>
                <Badge variant="pending" size="sm">
                  STAKEHOLDER RBAC
                </Badge>
              </div>

              <h3 className="font-display text-lg font-bold text-slate-100 group-hover:text-amber-300 transition-colors mb-2">
                Four-Tier Role Governance
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Explicit permission boundaries tailored for Students, Faculty Advisors, Departmental
                Staff, and IT Compliance Administrators.
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-border-subtle flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Role-Isolated Audit Logs</span>
              <ShieldCheck className="h-4 w-4 text-amber-400" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
