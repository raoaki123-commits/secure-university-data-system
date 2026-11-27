import React, { useState, useEffect, useCallback } from 'react';
import { StudentSidebar } from './StudentSidebar';
import type { StudentNavTab } from './StudentSidebar';
import { StudentHeader } from './StudentHeader';
import { OverviewView } from './views/OverviewView';
import { ResourcesView } from './views/ResourcesView';
import { EventsView } from './views/EventsView';
import { ServicesView } from './views/ServicesView';
import { RecommendationsView } from './views/RecommendationsView';
import { SavedItemsView } from './views/SavedItemsView';
import { HistoryView } from './views/HistoryView';
import { PrivacyView } from './views/PrivacyView';
import { ProfileView } from './views/ProfileView';
import { SettingsView } from './views/SettingsView';
import { studentApi } from '../../../services/studentApi';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface StudentDashboardProps {
  onNavigateHome: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigateHome }) => {
  const [activeTab, setActiveTab] = useState<StudentNavTab>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [savedItemIds, setSavedItemIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Sync saved bookmarks list from backend
  const loadSavedItems = useCallback(async () => {
    try {
      const res = await studentApi.getBookmarks();
      if (res.data?.bookmarks) {
        const idSet = new Set(res.data.bookmarks.map((b) => b.item_id));
        setSavedItemIds(idSet);
      }
    } catch (err) {
      console.error('Failed to sync user bookmarks:', err);
    }
  }, []);

  useEffect(() => {
    loadSavedItems();
  }, [loadSavedItems]);

  const handleToggleBookmark = async (
    itemId: string,
    itemType: 'resource' | 'event' | 'service',
    snapshot: any
  ) => {
    try {
      const res = await studentApi.toggleBookmark(itemId, itemType, snapshot);
      if (res.data) {
        if (res.data.is_bookmarked) {
          setSavedItemIds((prev) => new Set(prev).add(itemId));
          showToast(`Saved "${snapshot?.title || snapshot?.name || 'Item'}" to your collection.`);
        } else {
          setSavedItemIds((prev) => {
            const next = new Set(prev);
            next.delete(itemId);
            return next;
          });
          showToast(`Removed "${snapshot?.title || snapshot?.name || 'Item'}" from saved collection.`, 'info');
        }
      }
    } catch {
      showToast('Could not update saved collection.', 'error');
    }
  };

  const handleTabSelect = (tab: StudentNavTab) => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-void text-slate-100 flex flex-col md:flex-row relative selection:bg-brand-500/30 selection:text-brand-200">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-sm bg-void-elevated/95 backdrop-blur-md border border-border-default shadow-brand-glow flex items-center gap-2.5 text-xs font-mono animate-in fade-in slide-in-from-bottom-2">
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-status-verified shrink-0" />
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
      <div className="hidden md:block shrink-0">
        <StudentSidebar
          activeTab={activeTab}
          onSelectTab={handleTabSelect}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          savedCount={savedItemIds.size}
        />
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-void/80 backdrop-blur-sm flex">
          <div className="w-64 h-full bg-void-surface border-r border-border-default flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border-default">
              <span className="font-display text-xs font-bold text-slate-100">
                NAVIGATION
              </span>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <StudentSidebar
                activeTab={activeTab}
                onSelectTab={handleTabSelect}
                isCollapsed={false}
                onToggleCollapse={() => {}}
                savedCount={savedItemIds.size}
              />
            </div>
          </div>
          <div
            className="flex-1"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <StudentHeader
          activeTab={activeTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onNavigateHome={onNavigateHome}
          savedCount={savedItemIds.size}
          onSelectTab={handleTabSelect}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewView
              onNavigateTab={handleTabSelect}
              onToggleBookmark={handleToggleBookmark}
              savedItemIds={savedItemIds}
            />
          )}

          {activeTab === 'resources' && (
            <ResourcesView
              onToggleBookmark={handleToggleBookmark}
              savedItemIds={savedItemIds}
            />
          )}

          {activeTab === 'events' && (
            <EventsView
              onToggleBookmark={handleToggleBookmark}
              savedItemIds={savedItemIds}
            />
          )}

          {activeTab === 'services' && (
            <ServicesView
              onToggleBookmark={handleToggleBookmark}
              savedItemIds={savedItemIds}
            />
          )}

          {activeTab === 'recommendations' && (
            <RecommendationsView
              onToggleBookmark={handleToggleBookmark}
              savedItemIds={savedItemIds}
              onRefreshData={loadSavedItems}
            />
          )}

          {activeTab === 'saved' && (
            <SavedItemsView
              onNavigateTab={handleTabSelect}
              onToggleBookmark={handleToggleBookmark}
              savedItemIds={savedItemIds}
            />
          )}

          {activeTab === 'history' && (
            <HistoryView onNavigateTab={handleTabSelect} />
          )}

          {activeTab === 'privacy' && <PrivacyView />}

          {activeTab === 'profile' && <ProfileView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
};
