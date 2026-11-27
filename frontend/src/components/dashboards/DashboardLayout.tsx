import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../design-system/components/Button';
import { Badge } from '../../design-system/components/Badge';
import { LogOut, Home, Shield, User } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  roleBadge: 'verified' | 'shield' | 'confidential' | 'danger';
  onNavigateHome: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  roleBadge,
  onNavigateHome,
}) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onNavigateHome();
  };

  return (
    <div className="min-h-screen bg-void text-slate-100 flex flex-col selection:bg-brand-500/30 selection:text-brand-200">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 bg-void-elevated/90 backdrop-blur-md border-b border-border-default px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-shield-500/10 text-shield-400 border border-shield-500/30">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-bold tracking-tight text-slate-100">
                  SOVEREIGN PORTAL
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  PHASE 4 AUTH VERIFIED
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Secure University Resource Collective (Team SHTKS 26O2227)
              </p>
            </div>
          </div>

          {/* User Session Info & Navigation */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end text-right">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-200">{user?.name}</span>
                <Badge variant={roleBadge}>{user?.role.toUpperCase()}</Badge>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{user?.email}</span>
            </div>

            <div className="h-6 w-px bg-border-default hidden md:block" />

            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-void-surface hover:bg-void-surfaceHover border border-border-default text-xs font-mono text-slate-300 hover:text-slate-100 transition-colors"
              title="Return to Public Landing Page"
            >
              <Home className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Landing</span>
            </button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              className="font-mono text-xs text-status-danger border-status-danger/30 hover:bg-status-danger/10"
            >
              <LogOut className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        {/* Portal Banner */}
        <div className="p-6 rounded-md bg-gradient-to-r from-void-elevated via-void-surface to-void-elevated border border-border-default relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-brand-500/5 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant={roleBadge}>ROLE: {user?.role.toUpperCase()}</Badge>
                <span className="text-xs font-mono text-status-verified flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Authenticated Session Active
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold text-slate-100 tracking-tight">
                {title}
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                {subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded bg-void-pure/60 border border-border-subtle font-mono text-xs">
              <User className="h-4 w-4 text-brand-400 shrink-0" />
              <div className="space-y-0.5">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">User Identity Record</div>
                <div className="text-slate-200 text-[11px] font-semibold">{user?.id || 'USR-26O2227-LOCAL'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Portal Body */}
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border-default py-4 px-6 text-center text-xs font-mono text-slate-500">
        Secure Resource Recommendation System for University Communities • Phase 4 RBAC Verified
      </footer>
    </div>
  );
};
