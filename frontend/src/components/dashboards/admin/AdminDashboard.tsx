import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { AdminSidebar, type AdminNavTab } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminOverviewView } from './views/AdminOverviewView';
import { AdminUsersView } from './views/AdminUsersView';
import { AdminResourcesView } from './views/AdminResourcesView';
import { AdminEventsView } from './views/AdminEventsView';
import { AdminServicesView } from './views/AdminServicesView';
import { AdminSecurityCenterView } from './views/AdminSecurityCenterView';
import { AdminRecommendationMonitorView } from './views/AdminRecommendationMonitorView';
import { AdminAuditLogsView } from './views/AdminAuditLogsView';
import { adminApi, type AdminStats } from '../../../services/adminApi';
import { CheckCircle2, AlertTriangle, X, ShieldAlert } from 'lucide-react';

interface AdminDashboardProps {
  onNavigateHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateHome }) => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminNavTab>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const res = await adminApi.getStats();
      if (res.stats) {
        setStats(res.stats);
      }
    } catch {
      showToast('Could not sync admin overview statistics.', 'error');
    } finally {
      setIsLoadingStats(false);
      setIsRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleRefreshData = () => {
    setIsRefreshing(true);
    loadStats();
    showToast('Synchronized with live database enclave.', 'info');
  };

  const handleSelectTab = (tab: AdminNavTab) => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <AdminOverviewView
            stats={stats}
            isLoading={isLoadingStats}
            onNavigateTab={handleSelectTab}
          />
        );
      case 'users':
        return <AdminUsersView onShowToast={showToast} />;
      case 'resources':
        return <AdminResourcesView onShowToast={showToast} />;
      case 'events':
        return <AdminEventsView onShowToast={showToast} />;
      case 'services':
        return <AdminServicesView onShowToast={showToast} />;
      case 'security':
        return <AdminSecurityCenterView onShowToast={showToast} />;
      case 'recommendations':
        return <AdminRecommendationMonitorView onShowToast={showToast} />;
      case 'audit-logs':
        return <AdminAuditLogsView onShowToast={showToast} />;
      default:
        return (
          <AdminOverviewView
            stats={stats}
            isLoading={isLoadingStats}
            onNavigateTab={handleSelectTab}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-void text-slate-100 flex flex-col md:flex-row relative selection:bg-status-danger/30 selection:text-slate-100">
      {/* Toast Alert Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-sm bg-void-elevated/95 backdrop-blur-md border border-border-default shadow-lg flex items-center gap-2.5 text-xs font-mono animate-in fade-in slide-in-from-bottom-2">
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : toast.type === 'error' ? (
            <ShieldAlert className="h-4 w-4 text-status-danger shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-accent-cyan shrink-0" />
          )}
          <span className="text-slate-200">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="p-1 hover:text-slate-100 text-slate-400 ml-2"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          pendingApprovalsCount={stats?.pending_approval_total}
          onNavigateHome={onNavigateHome}
          onLogout={logout}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-void/80 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-50 w-64 bg-void-elevated border-r border-border-default">
            <AdminSidebar
              activeTab={activeTab}
              onSelectTab={handleSelectTab}
              isCollapsed={false}
              onToggleCollapse={() => setIsMobileSidebarOpen(false)}
              pendingApprovalsCount={stats?.pending_approval_total}
              onNavigateHome={onNavigateHome}
              onLogout={logout}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onRefreshData={handleRefreshData}
          isRefreshing={isRefreshing}
          onLogout={logout}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};
