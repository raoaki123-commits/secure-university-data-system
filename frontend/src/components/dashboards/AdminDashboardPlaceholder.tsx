import React from 'react';
import { DashboardLayout } from './DashboardLayout';
import { RbacLiveTester } from './RbacLiveTester';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import {
  ShieldAlert,
  Users,
  Database,
  BarChart3,
  FileText,
  Key,
  Cpu,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateHome: () => void;
}

export const AdminDashboardPlaceholder: React.FC<AdminDashboardProps> = ({ onNavigateHome }) => {
  const adminFeatures = [
    {
      icon: <Users className="h-5 w-5 text-accent-cyan" />,
      title: 'User & Role Lifecycle Governance',
      desc: 'Provision faculty/staff accounts, review registration queues, enforce MFA, and revoke compromised JWT session tokens.',
      status: 'RBAC Root',
    },
    {
      icon: <Database className="h-5 w-5 text-brand-400" />,
      title: 'Resource & Event Catalog Management',
      desc: 'Audit system-wide academic listings, manage database indexing, purge stale records, and verify cryptographic hashes.',
      status: 'MongoDB Admin',
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-accent-emerald" />,
      title: 'Aggregated Differential Privacy Analytics',
      desc: 'Inspect university-wide resource usage metrics aggregated with Laplace DP noise (epsilon = 0.5) to prevent re-identification.',
      status: 'DP Protected',
    },
    {
      icon: <FileText className="h-5 w-5 text-accent-amber" />,
      title: 'Cryptographic Audit & Access Logs',
      desc: 'Immutable append-only access log tracking authentication attempts, key rotations, and homomorphic dot-product jobs.',
      status: 'Audit Trail',
    },
    {
      icon: <Key className="h-5 w-5 text-status-danger" />,
      title: 'Cluster Provisioning Key Management',
      desc: 'Rotate cluster ADMIN_PROVISION_KEY secrets and configure university domain whitelisting.',
      status: 'Root Secret',
    },
    {
      icon: <Cpu className="h-5 w-5 text-accent-violet" />,
      title: 'CKKS & MPC Node Orchestration',
      desc: 'Monitor multi-party computation node heartbeats, polynomial ring modulus degrees (N=8192), and encryption latencies.',
      status: 'Cluster Ops',
    },
  ];

  return (
    <DashboardLayout
      title="Administrative Security & Platform Governance Console"
      subtitle="Highest-privilege administration hub: user lifecycle, audit trail inspection, cryptographic parameters, and platform-wide privacy enforcement."
      roleBadge="danger"
      onNavigateHome={onNavigateHome}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-base font-semibold text-slate-200">
            Administrator Privileged Operations & Control Surfaces
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Admin Provisioning Key Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminFeatures.map((feat, idx) => (
            <Card key={idx} className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="p-2 rounded bg-void-surface border border-border-default">
                  {feat.icon}
                </div>
                <Badge variant="danger">{feat.status}</Badge>
              </div>
              <div>
                <h4 className="font-display text-sm font-semibold text-slate-100">{feat.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{feat.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-md bg-status-danger/10 border border-status-danger/30 flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-status-danger shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-slate-200 font-mono">
            Elevated Role Safeguard Enforced
          </p>
          <p className="text-slate-300 leading-relaxed">
            Administrative access confirmed via cluster secret validation. The backend ensures that public self-registration cannot elevate privileges without this verified secret. Interactive audit log search and user role modification interfaces will be enabled in Phase 5.
          </p>
        </div>
      </div>

      <RbacLiveTester />
    </DashboardLayout>
  );
};
