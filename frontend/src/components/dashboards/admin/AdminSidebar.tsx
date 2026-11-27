import React from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  Layers,
  ShieldCheck,
  Cpu,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export type AdminNavTab =
  | 'overview'
  | 'users'
  | 'resources'
  | 'events'
  | 'services'
  | 'security'
  | 'recommendations'
  | 'audit-logs';

interface AdminSidebarProps {
  activeTab: AdminNavTab;
  onSelectTab: (tab: AdminNavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  pendingApprovalsCount?: number;
  onNavigateHome: () => void;
  onLogout: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  pendingApprovalsCount = 0,
  onNavigateHome,
  onLogout,
}) => {
  const navItems: { id: AdminNavTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'User Directory', icon: Users },
    {
      id: 'resources',
      label: 'Academic Resources',
      icon: BookOpen,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
    },
    { id: 'events', label: 'Campus Events', icon: Calendar },
    { id: 'services', label: 'University Services', icon: Layers },
    { id: 'security', label: 'Privacy & Security', icon: ShieldCheck },
    { id: 'recommendations', label: 'Recommendation Monitor', icon: Cpu },
    { id: 'audit-logs', label: 'Audit Trail', icon: FileText },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-border-default/60 bg-void-elevated/70 backdrop-blur-md transition-all duration-300 z-20 ${
        isCollapsed ? 'w-20' : 'w-64'
      } shrink-0 min-h-screen`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-border-default/60 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-sm bg-status-danger/10 border border-status-danger/40 flex items-center justify-center text-status-danger shrink-0 shadow-sm">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div className="truncate">
              <div className="font-mono text-xs font-bold text-slate-100 tracking-wider flex items-center gap-1.5">
                ADMIN CONSOLE
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-status-danger/20 text-status-danger font-mono font-medium">
                  SECURE
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">SHTKS Core Node</div>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="mx-auto h-8 w-8 rounded-sm bg-status-danger/10 border border-status-danger/40 flex items-center justify-center text-status-danger">
            <ShieldAlert className="h-4 w-4" />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-sm hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-mono transition-all text-left group ${
                isActive
                  ? 'bg-status-danger/15 text-slate-100 border border-status-danger/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive
                    ? 'text-status-danger'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Controls */}
      <div className="p-3 border-t border-border-default/60 space-y-1">
        <button
          onClick={onNavigateHome}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title={isCollapsed ? 'Public Landing Page' : undefined}
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Landing Page</span>}
        </button>

        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-mono text-status-danger/80 hover:text-status-danger hover:bg-status-danger/10 transition-colors ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title={isCollapsed ? 'End Admin Session' : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Terminate Session</span>}
        </button>
      </div>
    </aside>
  );
};
