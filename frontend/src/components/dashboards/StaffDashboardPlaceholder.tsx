import React from 'react';
import { DashboardLayout } from './DashboardLayout';
import { RbacLiveTester } from './RbacLiveTester';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import {
  LifeBuoy,
  HeartHandshake,
  CalendarCheck,
  Building2,
  ShieldCheck,
  Megaphone,
} from 'lucide-react';

interface StaffDashboardProps {
  onNavigateHome: () => void;
}

export const StaffDashboardPlaceholder: React.FC<StaffDashboardProps> = ({ onNavigateHome }) => {
  const staffFeatures = [
    {
      icon: <LifeBuoy className="h-5 w-5 text-accent-emerald" />,
      title: 'Confidential Support Services',
      desc: 'Administer student counseling intake, disability accommodations, and emergency housing stipends.',
      status: 'High Sensitivity',
    },
    {
      icon: <CalendarCheck className="h-5 w-5 text-accent-cyan" />,
      title: 'Campus Life & Event Scheduling',
      desc: 'Publish university orientation calendars, wellness fairs, and career development initiatives.',
      status: 'Community',
    },
    {
      icon: <Building2 className="h-5 w-5 text-brand-400" />,
      title: 'Campus Facilities & Service Catalog',
      desc: 'Update clinic operating hours, food pantry locations, library quiet zones, and tech equipment loaners.',
      status: 'Operational',
    },
    {
      icon: <Megaphone className="h-5 w-5 text-accent-amber" />,
      title: 'Broadcast Institutional Announcements',
      desc: 'Dispatch emergency weather alerts, health advisory notices, and financial aid application deadlines.',
      status: 'Verified',
    },
    {
      icon: <HeartHandshake className="h-5 w-5 text-accent-violet" />,
      title: 'Student Wellness Resource Management',
      desc: 'Curate peer tutoring programs, psychological resilience workshops, and campus community partnerships.',
      status: 'Active',
    },
  ];

  return (
    <DashboardLayout
      title="Campus Staff Support & Operations Portal"
      subtitle="Publish and maintain critical university wellness, accessibility, and campus life resources with strict data protection compliance."
      roleBadge="shield"
      onNavigateHome={onNavigateHome}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-base font-semibold text-slate-200">
            Staff Role Capabilities & Permitted Portals
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Phase 4 RBAC Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffFeatures.map((feat, idx) => (
            <Card key={idx} className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="p-2 rounded bg-void-surface border border-border-default">
                  {feat.icon}
                </div>
                <Badge variant="verified">{feat.status}</Badge>
              </div>
              <div>
                <h4 className="font-display text-sm font-semibold text-slate-100">{feat.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{feat.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-md bg-accent-emerald/10 border border-accent-emerald/30 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-accent-emerald shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-slate-200 font-mono">
            Staff Role Authentication Confirmed
          </p>
          <p className="text-slate-300 leading-relaxed">
            Your login as <code className="text-brand-300">STAFF</code> has verified access to university support catalogs and welfare management. Live service publishing interfaces will be delivered in Phase 5.
          </p>
        </div>
      </div>

      <RbacLiveTester />
    </DashboardLayout>
  );
};
