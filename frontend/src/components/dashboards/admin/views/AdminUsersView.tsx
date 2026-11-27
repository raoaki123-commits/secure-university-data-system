import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Shield,
  Eye,
  Key,
  AlertCircle,
  X,
} from 'lucide-react';
import { Card } from '../../../../design-system/components/Card';
import { Badge } from '../../../../design-system/components/Badge';
import { Button } from '../../../../design-system/components/Button';
import { Modal } from '../../../../design-system/components/Modal';
import { adminApi, type AdminUser } from '../../../../services/adminApi';

interface AdminUsersViewProps {
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({ onShowToast }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [targetRole, setTargetRole] = useState<'student' | 'faculty' | 'staff' | 'admin'>('student');
  const [actionInProgress, setActionInProgress] = useState<boolean>(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getUsers({
        role: roleFilter,
        status: statusFilter,
        search: searchQuery,
        limit: 50,
      });
      if (res.users) {
        setUsers(res.users);
        setTotalUsers(res.total);
      }
    } catch {
      onShowToast('Failed to load user directory.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [roleFilter, statusFilter, searchQuery, onShowToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenRoleModal = (user: AdminUser) => {
    setSelectedUser(user);
    setTargetRole(user.role);
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser) return;
    setActionInProgress(true);
    try {
      const res = await adminApi.updateUserRole(selectedUser.id, targetRole);
      onShowToast(res.message || `Role updated to ${targetRole}.`, 'success');
      setIsRoleModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update user role.';
      onShowToast(msg, 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleOpenStatusModal = (user: AdminUser) => {
    setSelectedUser(user);
    setIsStatusModalOpen(true);
  };

  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    setActionInProgress(true);
    const newStatus = selectedUser.account_status === 'suspended' ? 'active' : 'suspended';
    try {
      const res = await adminApi.updateUserStatus(selectedUser.id, newStatus);
      onShowToast(
        res.message ||
          (newStatus === 'suspended'
            ? 'User account suspended; active tokens revoked.'
            : 'User account restored to active.'),
        'success'
      );
      setIsStatusModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update user status.';
      onShowToast(msg, 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  const getRoleBadgeVariant = (role: string): 'danger' | 'shield' | 'neutral' | 'verified' => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'faculty':
        return 'shield';
      case 'staff':
        return 'neutral';
      case 'student':
      default:
        return 'verified';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-slate-100 tracking-tight">
              User Directory & Authority
            </h1>
            <Badge variant="neutral" size="sm">{totalUsers} Registered</Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Manage roles, enforce suspensions, and inspect security tokens across all registered community members
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border-border-default/70 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user name or university email address..."
            className="w-full bg-void-surface border border-border-default rounded-sm pl-9 pr-4 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 bg-void-surface border border-border-default rounded-sm px-2.5 py-1.5 text-xs font-mono text-slate-300">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              aria-label="Filter users by role"
              className="bg-transparent focus:outline-none text-slate-200 cursor-pointer"
            >
              <option value="all" className="bg-void-surface text-slate-200">All Roles</option>
              <option value="student" className="bg-void-surface text-slate-200">Students</option>
              <option value="faculty" className="bg-void-surface text-slate-200">Faculty</option>
              <option value="staff" className="bg-void-surface text-slate-200">Staff</option>
              <option value="admin" className="bg-void-surface text-slate-200">Admins</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-void-surface border border-border-default rounded-sm px-2.5 py-1.5 text-xs font-mono text-slate-300">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter users by account status"
              className="bg-transparent focus:outline-none text-slate-200 cursor-pointer"
            >
              <option value="all" className="bg-void-surface text-slate-200">All Statuses</option>
              <option value="active" className="bg-void-surface text-slate-200">Active Only</option>
              <option value="suspended" className="bg-void-surface text-slate-200">Suspended Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users Data Table */}
      <Card className="border-border-default/70 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-slate-800/40 rounded animate-pulse" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Users className="h-8 w-8 text-slate-600 mx-auto" />
            <div className="font-mono text-xs text-slate-400">No users match your query parameters.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-border-default/60 bg-void-surface/50 text-slate-400">
                  <th className="py-3 px-4 font-medium">User / Email</th>
                  <th className="py-3 px-4 font-medium">Role</th>
                  <th className="py-3 px-4 font-medium">Department</th>
                  <th className="py-3 px-4 font-medium">Account Status</th>
                  <th className="py-3 px-4 font-medium">Last Login</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default/40">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-void-surface/40 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-semibold text-slate-100">{user.name}</div>
                        <div className="text-[11px] text-slate-400">{user.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
                        {user.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {user.department || <span className="text-slate-600">Unspecified</span>}
                    </td>
                    <td className="py-3 px-4">
                      {user.account_status === 'suspended' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          <UserX className="h-3 w-3" />
                          SUSPENDED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <UserCheck className="h-3 w-3" />
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-1.5 rounded-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
                          title="View Account Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenRoleModal(user)}
                          className="p-1.5 rounded-sm text-slate-400 hover:text-brand-300 hover:bg-brand-500/10 transition-colors"
                          title="Change Permitted Role"
                        >
                          <Shield className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenStatusModal(user)}
                          className={`p-1.5 rounded-sm transition-colors ${
                            user.account_status === 'suspended'
                              ? 'text-emerald-400 hover:bg-emerald-500/10'
                              : 'text-rose-400 hover:bg-rose-500/10'
                          }`}
                          title={user.account_status === 'suspended' ? 'Activate Account' : 'Suspend Account'}
                        >
                          {user.account_status === 'suspended' ? (
                            <UserCheck className="h-3.5 w-3.5" />
                          ) : (
                            <UserX className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* User Details Modal */}
      {selectedUser && isDetailModalOpen && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Account Security Dossier"
          maxWidth="md"
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-void-surface rounded-sm border border-border-default space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-border-default/50">
                <span className="text-slate-400">Account Name:</span>
                <span className="font-semibold text-slate-100">{selectedUser.name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border-default/50">
                <span className="text-slate-400">University Email:</span>
                <span className="text-slate-200">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border-default/50">
                <span className="text-slate-400">Enclave User ID:</span>
                <span className="text-slate-400 text-[11px]">{selectedUser.id}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border-default/50">
                <span className="text-slate-400">Assigned Role:</span>
                <Badge variant={getRoleBadgeVariant(selectedUser.role)} size="sm">
                  {selectedUser.role.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border-default/50">
                <span className="text-slate-400">Department:</span>
                <span className="text-slate-200">{selectedUser.department || 'Not configured'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border-default/50">
                <span className="text-slate-400">Account Status:</span>
                <span className={selectedUser.account_status === 'suspended' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {selectedUser.account_status ? selectedUser.account_status.toUpperCase() : 'ACTIVE'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border-default/50">
                <span className="text-slate-400">Token Version:</span>
                <span className="text-amber-400">v{selectedUser.token_version ?? 1} (Session Invalidation Counter)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Registered On:</span>
                <span className="text-slate-300">
                  {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-void-surface/60 border border-border-default rounded-sm flex items-start gap-2.5">
              <Key className="h-4 w-4 text-brand-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-400">
                Cryptographic session security is maintained via token versioning. Any status modification instantly bumps the user's token version and drops all active sessions.
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Role Assignment Modal */}
      {selectedUser && isRoleModalOpen && (
        <Modal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          title={`Assign Role — ${selectedUser.name}`}
          maxWidth="sm"
        >
          <div className="space-y-4 font-mono text-xs">
            <p className="text-slate-400">
              Select the new access tier for <span className="text-slate-200 font-semibold">{selectedUser.email}</span>.
              This modifies backend RBAC permissions immediately.
            </p>

            <div className="space-y-2">
              {(['student', 'faculty', 'staff', 'admin'] as const).map((r) => (
                <label
                  key={r}
                  className={`flex items-center justify-between p-3 rounded-sm border cursor-pointer transition-colors ${
                    targetRole === r
                      ? 'bg-brand-500/10 border-brand-500/50 text-slate-100'
                      : 'bg-void-surface border-border-default text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="role_select"
                      checked={targetRole === r}
                      onChange={() => setTargetRole(r)}
                      className="accent-brand-500"
                    />
                    <span className="capitalize font-medium">{r}</span>
                  </div>
                  <Badge variant={getRoleBadgeVariant(r)} size="sm">
                    {r.toUpperCase()}
                  </Badge>
                </label>
              ))}
            </div>

            {targetRole !== 'admin' && selectedUser.role === 'admin' && (
              <div className="p-2.5 rounded-sm bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Safeguard check: backend will reject demotion if this is the sole active administrator.</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsRoleModalOpen(false)}
                disabled={actionInProgress}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveRole}
                disabled={actionInProgress}
              >
                {actionInProgress ? 'Saving...' : 'Confirm Role'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Account Status / Suspend Modal */}
      {selectedUser && isStatusModalOpen && (
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title={selectedUser.account_status === 'suspended' ? 'Reactivate Account' : 'Suspend Account'}
          maxWidth="sm"
        >
          <div className="space-y-4 font-mono text-xs">
            <p className="text-slate-400">
              {selectedUser.account_status === 'suspended' ? (
                <>
                  Are you sure you want to restore access for{' '}
                  <span className="text-slate-200 font-semibold">{selectedUser.name}</span> (
                  {selectedUser.email})? They will be allowed to log in and consume university resources again.
                </>
              ) : (
                <>
                  Are you sure you want to suspend{' '}
                  <span className="text-slate-200 font-semibold">{selectedUser.name}</span> (
                  {selectedUser.email})? This immediately revokes all active session tokens and prevents login.
                </>
              )}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsStatusModalOpen(false)}
                disabled={actionInProgress}
              >
                Cancel
              </Button>
              <Button
                variant={selectedUser.account_status === 'suspended' ? 'primary' : 'danger'}
                size="sm"
                onClick={handleToggleStatus}
                disabled={actionInProgress}
              >
                {actionInProgress
                  ? 'Processing...'
                  : selectedUser.account_status === 'suspended'
                  ? 'Reactivate Account'
                  : 'Suspend Account'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
