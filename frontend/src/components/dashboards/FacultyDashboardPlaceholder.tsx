import React from 'react';
import { DashboardLayout } from './DashboardLayout';
import { RbacLiveTester } from './RbacLiveTester';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import {
  GraduationCap,
  FileCheck2,
  Users2,
  Award,
  UploadCloud,
  ShieldCheck,
} from 'lucide-react';

interface FacultyDashboardProps {
  onNavigateHome: () => void;
}

export const FacultyDashboardPlaceholder: React.FC<FacultyDashboardProps> = ({ onNavigateHome }) => {
  const facultyFeatures = [
    {
      icon: <GraduationCap className="h-5 w-5 text-accent-cyan" />,
      title: 'Explore Academic Literature',
      desc: 'Cross-departmental research papers, open syllabus archives, and curriculum benchmarks.',
      status: 'Curriculum',
    },
    {
      icon: <UploadCloud className="h-5 w-5 text-brand-400" />,
      title: 'Manage Academic Contributions',
      desc: 'Publish peer-reviewed lecture notes, reading lists, and lab manuals for student discovery.',
      status: 'Authoring',
    },
    {
      icon: <Users2 className="h-5 w-5 text-accent-amber" />,
      title: 'Advisee Resource Coordination',
      desc: 'Recommend sensitive academic support and specialized research stipends without viewing student personal records.',
      status: 'Confidential',
    },
    {
      icon: <Award className="h-5 w-5 text-accent-emerald" />,
      title: 'Departmental Colloquia & Events',
      desc: 'Schedule faculty seminars, guest academic lectures, and interdisciplinary symposia.',
      status: 'Public / Dept',
    },
    {
      icon: <FileCheck2 className="h-5 w-5 text-accent-violet" />,
      title: 'Resource Quality Moderation',
      desc: 'Verify peer-submitted academic study materials and attest to accuracy before recommendation indexing.',
      status: 'Peer Review',
    },
  ];

  return (
    <DashboardLayout
      title="Faculty Academic & Advising Hub"
      subtitle="Contribute verified instructional materials, mentor academic cohorts, and manage departmental research resources within a privacy-preserving framework."
      roleBadge="confidential"
      onNavigateHome={onNavigateHome}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-base font-semibold text-slate-200">
            Faculty Role Capabilities & Permitted Portals
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Phase 4 RBAC Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {facultyFeatures.map((feat, idx) => (
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

      <div className="p-4 rounded-md bg-accent-violet/10 border border-accent-violet/30 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-accent-violet shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-slate-200 font-mono">
            Faculty Role Authentication Confirmed
          </p>
          <p className="text-slate-300 leading-relaxed">
            Your login as <code className="text-brand-300">FACULTY</code> has granted access to faculty publishing pipelines and advising coordinates. Interactive resource submission forms and curriculum indexing will be activated in Phase 5.
          </p>
        </div>
      </div>

      <RbacLiveTester />
    </DashboardLayout>
  );
};
