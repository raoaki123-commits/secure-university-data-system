import React from 'react';
import { DashboardLayout } from './DashboardLayout';
import { RbacLiveTester } from './RbacLiveTester';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import {
  BookOpen,
  Calendar,
  HeartHandshake,
  Sliders,
  Sparkles,
  Bookmark,
  ShieldCheck,
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigateHome: () => void;
}

export const StudentDashboardPlaceholder: React.FC<StudentDashboardProps> = ({ onNavigateHome }) => {
  const studentFeatures = [
    {
      icon: <BookOpen className="h-5 w-5 text-accent-cyan" />,
      title: 'Explore Academic Resources',
      desc: 'Peer study guides, lab archives, open textbooks, and departmental research papers.',
      status: 'Protected',
    },
    {
      icon: <Calendar className="h-5 w-5 text-accent-amber" />,
      title: 'Discover Campus Events',
      desc: 'Hackathons, academic guest lectures, cultural gatherings, and career workshops.',
      status: 'Active',
    },
    {
      icon: <HeartHandshake className="h-5 w-5 text-accent-emerald" />,
      title: 'Confidential University Services',
      desc: 'Mental wellness counseling, accessibility stipends, tutoring, and emergency grants.',
      status: 'Zero-Knowledge',
    },
    {
      icon: <Sliders className="h-5 w-5 text-accent-violet" />,
      title: 'Manage Privacy Preferences',
      desc: 'Configure homomorphic noise parameters, topic weights, and sensitive filter thresholds.',
      status: 'Encrypted',
    },
    {
      icon: <Sparkles className="h-5 w-5 text-brand-400" />,
      title: 'Personalized Recommendations',
      desc: 'Blind inference scores generated via CKKS encrypted matrix dot product.',
      status: 'CKKS 128-bit',
    },
    {
      icon: <Bookmark className="h-5 w-5 text-slate-300" />,
      title: 'Saved Academic Stash',
      desc: 'Locally cached resource bookmarks encrypted with client session key.',
      status: 'Private',
    },
  ];

  return (
    <DashboardLayout
      title="Student Academic & Privacy Hub"
      subtitle="Discover personalized academic materials, confidential campus resources, and student activities with mathematical zero-knowledge privacy guarantees."
      roleBadge="verified"
      onNavigateHome={onNavigateHome}
    >
      {/* Role Capabilities Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-base font-semibold text-slate-200">
            Student Role Capabilities & Permitted Portals
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Phase 4 RBAC Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studentFeatures.map((feat, idx) => (
            <Card key={idx} className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="p-2 rounded bg-void-surface border border-border-default">
                  {feat.icon}
                </div>
                <Badge variant="shield">{feat.status}</Badge>
              </div>
              <div>
                <h4 className="font-display text-sm font-semibold text-slate-100">{feat.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{feat.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Phase 5 Notice Card */}
      <div className="p-4 rounded-md bg-brand-500/10 border border-brand-500/30 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-brand-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-slate-200 font-mono">
            Phase 4 Verification Point — Authentication & Role Redirection
          </p>
          <p className="text-slate-300 leading-relaxed">
            Your login as <code className="text-brand-300">STUDENT</code> has successfully authenticated via Flask JWT and routed to this verified student environment. Interactive real-time resource feeds, encrypted bookmarks, and vector sliders will be rendered in Phase 5.
          </p>
        </div>
      </div>

      {/* Backend RBAC Live Prober */}
      <RbacLiveTester />
    </DashboardLayout>
  );
};
