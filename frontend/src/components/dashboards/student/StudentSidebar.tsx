import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Calendar,
  HeartHandshake,
  Sparkles,
  Bookmark,
  History,
  ShieldCheck,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Badge } from '../../../design-system/components/Badge';

export type StudentNavTab =
  | 'overview'
  | 'resources'
  | 'events'
  | 'services'
  | 'recommendations'
  | 'saved'
  | 'history'
  | 'privacy'
  | 'profile'
  | 'settings';

interface StudentSidebarProps {
  activeTab: StudentNavTab;
  onSelectTab: (tab: StudentNavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  savedCount: number;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  savedCount,
}) => {
  const { user, logout } = useAuth();

  const navItems: { id: StudentNavTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'resources', label: 'Discover Resources', icon: <Compass className="h-4 w-4" /> },
    { id: 'events', label: 'University Events', icon: <Calendar className="h-4 w-4" /> },
    { id: 'services', label: 'University Services', icon: <HeartHandshake className="h-4 w-4" /> },
    { id: 'recommendations', label: 'My Recommendations', icon: <Sparkles className="h-4 w-4 text-brand-400" />, badge: 'AI' },
    { id: 'saved', label: 'Saved Items', icon: <Bookmark className="h-4 w-4" />, badge: savedCount > 0 ? savedCount : undefined },
    { id: 'history', label: 'Recommendation History', icon: <History className="h-4 w-4" /> },
    { id: 'privacy', label: 'Privacy Center', icon: <ShieldCheck className="h-4 w-4 text-status-verified" /> },
    { id: 'profile', label: 'My Profile', icon: <User className="h-4 w-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <aside
      className={`relative z-30 flex flex-col border-r border-border-default bg-void-surface transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-default h-16">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-brand-500/10 text-brand-400 border border-brand-500/30">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <div className="font-display text-xs font-bold tracking-tight text-slate-100">
                SHTKS SOVEREIGN
              </div>
              <div className="text-[10px] font-mono text-slate-400">Student Portal</div>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-sm bg-brand-500/10 text-brand-400 border border-brand-500/30">
            <Shield className="h-4 w-4" />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1 rounded hover:bg-void-elevated text-slate-400 hover:text-slate-200 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-2.5 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-mono transition-all text-left group relative ${
                isActive
                  ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-void-elevated border border-transparent'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <span className={`shrink-0 ${isActive ? 'text-brand-300' : 'text-slate-400 group-hover:text-slate-200'}`}>
                {item.icon}
              </span>

              {!isCollapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded-full bg-void-elevated text-brand-300 border border-border-default">
                      {item.badge}
                    </span>
                  )}
                </>
              )}

              {/* Indicator dot when collapsed and active */}
              {isCollapsed && isActive && (
                <span className="absolute right-1 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-brand-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer Profile & Sign Out */}
      <div className="p-3 border-t border-border-default bg-void-surface">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-200 truncate">{user?.name}</div>
                <div className="text-[10px] font-mono text-slate-400 truncate">{user?.email}</div>
              </div>
              <Badge variant="verified" size="sm">
                STUDENT
              </Badge>
            </div>

            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-sm bg-void-elevated hover:bg-status-danger/10 border border-border-default hover:border-status-danger/30 text-slate-400 hover:text-status-danger text-xs font-mono transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center p-2 rounded-sm hover:bg-status-danger/10 text-slate-400 hover:text-status-danger transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  );
};

