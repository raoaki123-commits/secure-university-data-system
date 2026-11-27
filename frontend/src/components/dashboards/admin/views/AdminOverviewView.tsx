import React from 'react';
import {
  Users,
  BookOpen,
  Calendar,
  Layers,
  Cpu,
  ShieldAlert,
  Clock,
  ArrowRight,
  UserCheck,
  UserX,
  FileText,
} from 'lucide-react';
import { Card } from '../../../../design-system/components/Card';
import { Badge } from '../../../../design-system/components/Badge';
import { Button } from '../../../../design-system/components/Button';
import type { AdminStats } from '../../../../services/adminApi';
import type { AdminNavTab } from '../AdminSidebar';

interface AdminOverviewViewProps {
  stats: AdminStats | null;
  isLoading: boolean;
  onNavigateTab: (tab: AdminNavTab) => void;
}

export const AdminOverviewView: React.FC<AdminOverviewViewProps> = ({
  stats,
  isLoading,
  onNavigateTab,
}) => {
  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-800/60 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-800/40 border border-border-default/40 rounded-sm animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { users, resources, events, services, recommendations, pending_approval_total, recent_activities } = stats;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title & System Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-slate-100 tracking-tight">
              Administrative Command Center
            </h1>
            <Badge variant="verified" size="sm">LIVE METRICS</Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time telemetry and resource authority for university secure enclave
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-sm bg-void-surface border border-border-default text-xs font-mono text-slate-300 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>MongoDB Enclave Synchronized</span>
          </div>
        </div>
      </div>

      {/* Pending Approvals Alert Banner */}
      {pending_approval_total > 0 && (
        <div className="p-4 rounded-sm bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-sm bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/40">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-amber-200">
                {pending_approval_total} PENDING SUBMISSION{pending_approval_total > 1 ? 'S' : ''} AWAITING REVIEW
              </div>
              <div className="text-[11px] text-amber-300/80 font-mono">
                {resources.pending_approval} Academic Resource{resources.pending_approval !== 1 ? 's' : ''} and{' '}
                {events.pending_approval} Event{events.pending_approval !== 1 ? 's' : ''} pending administrator verification.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {resources.pending_approval > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateTab('resources')}
                className="border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
              >
                Review Resources
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            )}
            {events.pending_approval > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateTab('events')}
                className="border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
              >
                Review Events
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Primary KPI Grid (Actual Database Figures) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registered Users */}
        <Card className="p-5 border-border-default/70 hover:border-border-hover transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Total Users</span>
            <div className="h-8 w-8 rounded-sm bg-brand-500/10 text-brand-300 border border-brand-500/30 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-slate-100">{users.total}</span>
            <span className="text-[11px] font-mono text-slate-400">accounts</span>
          </div>
          <div className="mt-3 pt-3 border-t border-border-default/50 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <UserCheck className="h-3 w-3" />
              {users.active} Active
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <UserX className="h-3 w-3" />
              {users.suspended} Suspended
            </span>
          </div>
        </Card>

        {/* Academic Resources */}
        <Card className="p-5 border-border-default/70 hover:border-border-hover transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Academic Resources</span>
            <div className="h-8 w-8 rounded-sm bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 flex items-center justify-center">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-slate-100">{resources.total}</span>
            <span className="text-[11px] font-mono text-slate-400">in catalog</span>
          </div>
          <div className="mt-3 pt-3 border-t border-border-default/50 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Verified & Live</span>
            {resources.pending_approval > 0 ? (
              <span className="text-amber-400 font-bold">{resources.pending_approval} Pending</span>
            ) : (
              <span className="text-emerald-400">All Approved</span>
            )}
          </div>
        </Card>

        {/* University Events */}
        <Card className="p-5 border-border-default/70 hover:border-border-hover transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Campus Events</span>
            <div className="h-8 w-8 rounded-sm bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-slate-100">{events.total}</span>
            <span className="text-[11px] font-mono text-slate-400">events listed</span>
          </div>
          <div className="mt-3 pt-3 border-t border-border-default/50 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Academic & Social</span>
            {events.pending_approval > 0 ? (
              <span className="text-amber-400 font-bold">{events.pending_approval} Pending</span>
            ) : (
              <span className="text-emerald-400">All Approved</span>
            )}
          </div>
        </Card>

        {/* University Services */}
        <Card className="p-5 border-border-default/70 hover:border-border-hover transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">University Services</span>
            <div className="h-8 w-8 rounded-sm bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-slate-100">{services.total}</span>
            <span className="text-[11px] font-mono text-slate-400">services</span>
          </div>
          <div className="mt-3 pt-3 border-t border-border-default/50 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="text-emerald-400">{services.active} Active Services</span>
            <span>{services.total - services.active} Inactive</span>
          </div>
        </Card>
      </div>

      {/* Role Breakdown & Interaction Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Breakdown by Role */}
        <Card className="p-5 lg:col-span-1 border-border-default/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-sm font-semibold text-slate-100">User Distribution</h3>
              <Badge variant="neutral" size="sm">Actual DB Registry</Badge>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Students</span>
                <span className="font-bold text-slate-200">{users.students}</span>
              </div>
              <div className="w-full bg-void-surface h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-500 h-full rounded-full"
                  style={{ width: `${users.total > 0 ? (users.students / users.total) * 100 : 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Faculty</span>
                <span className="font-bold text-slate-200">{users.faculty}</span>
              </div>
              <div className="w-full bg-void-surface h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-accent-cyan h-full rounded-full"
                  style={{ width: `${users.total > 0 ? (users.faculty / users.total) * 100 : 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Staff</span>
                <span className="font-bold text-slate-200">{users.staff}</span>
              </div>
              <div className="w-full bg-void-surface h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full"
                  style={{ width: `${users.total > 0 ? (users.staff / users.total) * 100 : 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Administrators</span>
                <span className="font-bold text-status-danger">{users.admins}</span>
              </div>
              <div className="w-full bg-void-surface h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-status-danger h-full rounded-full"
                  style={{ width: `${users.total > 0 ? (users.admins / users.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border-default/50">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-mono justify-center"
              onClick={() => onNavigateTab('users')}
            >
              Open User Directory
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </div>
        </Card>

        {/* Recommendation Engine Activity */}
        <Card className="p-5 lg:col-span-2 border-border-default/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-brand-400" />
                <h3 className="font-display text-sm font-semibold text-slate-100">
                  Recommendation Activity
                </h3>
              </div>
              <Badge variant="verified" size="sm">Baseline v1.0</Badge>
            </div>

            <p className="text-xs text-slate-400 font-mono mb-4">
              Aggregate student feedback and interaction signals captured anonymously under zero-cleartext guarantees.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-void-surface border border-border-default rounded-sm">
                <div className="text-[11px] font-mono text-slate-400">Feedback Recorded</div>
                <div className="font-display text-xl font-bold text-slate-100 mt-1">
                  {recommendations.total_feedback_events}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">Interaction signals</div>
              </div>

              <div className="p-3 bg-void-surface border border-border-default rounded-sm">
                <div className="text-[11px] font-mono text-slate-400">Algorithm Status</div>
                <div className="font-display text-sm font-bold text-accent-cyan mt-1">
                  Departmental Affinity
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">Content Heuristic</div>
              </div>

              <div className="p-3 bg-void-surface border border-border-default rounded-sm">
                <div className="text-[11px] font-mono text-slate-400">Security Ring</div>
                <div className="font-display text-sm font-bold text-emerald-400 mt-1">
                  Obfuscated ID Vector
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">Phase 6 TenSEAL ready</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border-default/50 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">
              Audit-compliant interaction logging enabled
            </span>
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-mono"
              onClick={() => onNavigateTab('recommendations')}
            >
              Telemetry Details
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Administrative Activity Ledger */}
      <Card className="p-5 border-border-default/70">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-status-danger" />
            <h3 className="font-display text-sm font-semibold text-slate-100">
              Recent Administrative Activity
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateTab('audit-logs')}
            className="text-xs font-mono text-slate-400 hover:text-slate-200"
          >
            View Full Audit Trail
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>

        {recent_activities.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-slate-500">
            No administrative activities recorded in audit ledger yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-border-default/60 text-slate-400">
                  <th className="py-2 px-3 font-medium">Timestamp</th>
                  <th className="py-2 px-3 font-medium">Action</th>
                  <th className="py-2 px-3 font-medium">Admin</th>
                  <th className="py-2 px-3 font-medium">Target Type</th>
                  <th className="py-2 px-3 font-medium">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default/40">
                {recent_activities.map((log) => (
                  <tr key={log.id} className="hover:bg-void-surface/50 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-slate-500" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-800 text-slate-200 border border-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{log.admin_email}</td>
                    <td className="py-2.5 px-3 text-slate-400">
                      <span className="capitalize">{log.target_type || 'system'}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
