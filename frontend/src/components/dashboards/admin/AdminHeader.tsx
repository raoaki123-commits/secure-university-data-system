import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  Menu,
  RotateCw,
  LogOut,
  UserCheck,
  Server,
} from 'lucide-react';
import { Badge } from '../../../design-system/components/Badge';

interface AdminHeaderProps {
  onToggleMobileSidebar: () => void;
  onRefreshData: () => void;
  isRefreshing?: boolean;
  onLogout: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleMobileSidebar,
  onRefreshData,
  isRefreshing = false,
  onLogout,
}) => {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-border-default/60 bg-void-elevated/80 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Left side: Hamburger & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-sm text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
          aria-label="Open sidebar menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-300">
            <Server className="h-4 w-4 text-status-danger" />
            <span className="font-semibold text-slate-100 tracking-wider hidden sm:inline">
              SOVEREIGN CLUSTER
            </span>
            <span className="text-slate-500 hidden sm:inline">/</span>
            <span className="text-slate-400 font-normal">Administrative Control Hub</span>
          </div>

          <Badge variant="danger" size="sm" hasDot>
            RBAC LEVEL 4
          </Badge>
        </div>
      </div>

      {/* Right side: Security indicator, refresh button & user info */}
      <div className="flex items-center gap-3">
        {/* Security indicator */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-sm bg-void-surface border border-border-default text-[11px] font-mono text-slate-300">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>ZERO-CLEARTEXT RBAC ACTIVE</span>
        </div>

        {/* Refresh Action */}
        <button
          onClick={onRefreshData}
          disabled={isRefreshing}
          className="p-2 rounded-sm text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-border-default/50 transition-colors disabled:opacity-50"
          title="Refresh All Database Metrics"
        >
          <RotateCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-status-danger' : ''}`} />
        </button>

        {/* User Identity Chip */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-border-default/60">
          <div className="h-8 w-8 rounded-full bg-status-danger/10 border border-status-danger/30 flex items-center justify-center text-status-danger">
            <UserCheck className="h-4 w-4" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-mono font-medium text-slate-100 leading-tight">
              {user?.name || 'Authorized Admin'}
            </div>
            <div className="text-[10px] font-mono text-slate-400 leading-tight">
              {user?.email || 'admin@university.edu'}
            </div>
          </div>

          <button
            onClick={onLogout}
            className="hidden md:flex p-2 rounded-sm text-slate-400 hover:text-status-danger hover:bg-status-danger/10 transition-colors"
            title="End Session"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
