import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Search,
  Filter,
  Clock,
  Eye,
  X,
  Code,
} from 'lucide-react';
import { Card } from '../../../../design-system/components/Card';
import { Badge } from '../../../../design-system/components/Badge';
import { Button } from '../../../../design-system/components/Button';
import { Modal } from '../../../../design-system/components/Modal';
import { adminApi, type AuditLogItem } from '../../../../services/adminApi';

interface AdminAuditLogsViewProps {
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const AdminAuditLogsView: React.FC<AdminAuditLogsViewProps> = ({ onShowToast }) => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [totalLogs, setTotalLogs] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [actionFilter, setActionFilter] = useState<string>('');
  const [adminEmailFilter, setAdminEmailFilter] = useState<string>('');
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getAuditLogs({
        action: actionFilter,
        admin_email: adminEmailFilter,
        target_type: targetTypeFilter !== 'all' ? targetTypeFilter : undefined,
        limit: 50,
      });
      if (res.logs) {
        setLogs(res.logs);
        setTotalLogs(res.total);
      }
    } catch {
      onShowToast('Failed to load audit logs.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [actionFilter, adminEmailFilter, targetTypeFilter, onShowToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionBadge = (action: string): 'danger' | 'neutral' | 'verified' | 'pending' => {
    if (action.includes('SUSPEND') || action.includes('DELETE') || action.includes('REJECT')) {
      return 'danger';
    }
    if (action.includes('ACTIVATE') || action.includes('APPROVED') || action.includes('CREATE')) {
      return 'verified';
    }
    if (action.includes('ROLE')) {
      return 'pending';
    }
    return 'neutral';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-slate-100 tracking-tight">
              Administrative & Security Audit Trail
            </h1>
            <Badge variant="neutral" size="sm">{totalLogs} Records</Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Immutable log of all role mutations, status suspensions, and administrative actions
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 border-border-default/70 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            placeholder="Filter by action (e.g. USER_SUSPENDED, ROLE_CHANGED)..."
            className="w-full bg-void-surface border border-border-default rounded-sm pl-9 pr-4 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
          {actionFilter && (
            <button
              onClick={() => setActionFilter('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={adminEmailFilter}
            onChange={(e) => setAdminEmailFilter(e.target.value)}
            placeholder="Filter by Admin Email..."
            className="bg-void-surface border border-border-default rounded-sm px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />

          <div className="flex items-center gap-1.5 bg-void-surface border border-border-default rounded-sm px-2.5 py-1.5 text-xs font-mono text-slate-300">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={targetTypeFilter}
              onChange={(e) => setTargetTypeFilter(e.target.value)}
              aria-label="Filter audit logs by target type"
              className="bg-transparent focus:outline-none text-slate-200 cursor-pointer"
            >
              <option value="all" className="bg-void-surface text-slate-200">All Target Types</option>
              <option value="user" className="bg-void-surface text-slate-200">Users</option>
              <option value="resource" className="bg-void-surface text-slate-200">Resources</option>
              <option value="event" className="bg-void-surface text-slate-200">Events</option>
              <option value="service" className="bg-void-surface text-slate-200">Services</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="border-border-default/70 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-slate-800/40 rounded animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <FileText className="h-8 w-8 text-slate-600 mx-auto" />
            <div className="font-mono text-xs text-slate-400">No audit records match the selected filters.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-border-default/60 bg-void-surface/50 text-slate-400">
                  <th className="py-3 px-4 font-medium">Timestamp</th>
                  <th className="py-3 px-4 font-medium">Action</th>
                  <th className="py-3 px-4 font-medium">Administrator</th>
                  <th className="py-3 px-4 font-medium">Target</th>
                  <th className="py-3 px-4 font-medium">IP Address</th>
                  <th className="py-3 px-4 font-medium text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default/40">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-void-surface/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-slate-500" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getActionBadge(log.action)} size="sm">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-200">{log.admin_email}</td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="capitalize">{log.target_type || 'system'}</span>
                      {log.target_id && (
                        <span className="text-[10px] text-slate-500 ml-1 truncate">
                          ({log.target_id.slice(-6)})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] font-mono">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
                        title="View Full Record Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Audit Detail Modal */}
      {selectedLog && (
        <Modal
          isOpen={Boolean(selectedLog)}
          onClose={() => setSelectedLog(null)}
          title={`Audit Record — ${selectedLog.action}`}
          maxWidth="md"
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-void-surface rounded-sm border border-border-default space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-border-default/50">
                <span className="text-slate-400">Action:</span>
                <Badge variant={getActionBadge(selectedLog.action)} size="sm">
                  {selectedLog.action}
                </Badge>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border-default/50">
                <span className="text-slate-400">Admin Email:</span>
                <span className="text-slate-100">{selectedLog.admin_email}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border-default/50">
                <span className="text-slate-400">Admin ID:</span>
                <span className="text-slate-400 text-[11px]">{selectedLog.admin_id}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border-default/50">
                <span className="text-slate-400">Target Type:</span>
                <span className="text-slate-200 capitalize">{selectedLog.target_type || 'system'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border-default/50">
                <span className="text-slate-400">Target ID:</span>
                <span className="text-slate-300 text-[11px]">{selectedLog.target_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border-default/50">
                <span className="text-slate-400">Origin IP:</span>
                <span className="text-accent-cyan">{selectedLog.ip_address || '127.0.0.1'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Timestamp:</span>
                <span className="text-slate-300">{new Date(selectedLog.timestamp).toISOString()}</span>
              </div>
            </div>

            {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-slate-400 mb-2">
                  <Code className="h-3.5 w-3.5 text-brand-400" />
                  <span>Payload Details</span>
                </div>
                <pre className="p-3 bg-void-surface rounded-sm border border-border-default text-[11px] text-slate-200 overflow-x-auto">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedLog(null)}>
                Close Record
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
