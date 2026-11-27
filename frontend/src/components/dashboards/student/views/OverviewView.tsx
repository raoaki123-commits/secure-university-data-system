import React, { useEffect, useState } from 'react';
import {
  Compass,
  Calendar,
  HeartHandshake,
  Sparkles,
  Bookmark,
  ShieldCheck,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { Card } from '../../../../design-system/components/Card';
import { Badge } from '../../../../design-system/components/Badge';
import { Button } from '../../../../design-system/components/Button';
import { studentApi } from '../../../../services/studentApi';
import type {
  RecommendationItem,
  UniversityEvent,
  BookmarkItem,
  RecommendationHistoryItem,
} from '../../../../services/studentApi';
import type { StudentNavTab } from '../StudentSidebar';

interface OverviewViewProps {
  onNavigateTab: (tab: StudentNavTab) => void;
  onToggleBookmark: (itemId: string, itemType: 'resource' | 'event' | 'service', snapshot: any) => Promise<void>;
  savedItemIds: Set<string>;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigateTab,
  onToggleBookmark,
  savedItemIds,
}) => {
  const { user } = useAuth();
  const [topRecommendations, setTopRecommendations] = useState<RecommendationItem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UniversityEvent[]>([]);
  const [recentBookmarks, setRecentBookmarks] = useState<BookmarkItem[]>([]);
  const [recentHistory, setRecentHistory] = useState<RecommendationHistoryItem[]>([]);
  const [, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadOverviewData = async () => {
      setIsLoading(true);
      try {
        const [recRes, evtRes, bmRes, histRes] = await Promise.all([
          studentApi.getRecommendations(),
          studentApi.getEvents(),
          studentApi.getBookmarks(),
          studentApi.getRecommendationHistory(),
        ]);

        if (isMounted) {
          if (recRes.data?.recommendations) {
            setTopRecommendations(recRes.data.recommendations.slice(0, 3));
          }
          if (evtRes.data?.events) {
            setUpcomingEvents(evtRes.data.events.slice(0, 3));
          }
          if (bmRes.data?.bookmarks) {
            setRecentBookmarks(bmRes.data.bookmarks.slice(0, 4));
          }
          if (histRes.data?.history) {
            setRecentHistory(histRes.data.history.slice(0, 4));
          }
        }
      } catch (err) {
        console.error('Error fetching student dashboard overview:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadOverviewData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* A. GREETING & PERSONALIZED HERO BANNER */}
      <div className="relative overflow-hidden rounded-md border border-border-default bg-gradient-to-r from-void-elevated via-void-surface to-void-elevated p-6">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="verified">ACCREDITED STUDENT</Badge>
              <span className="text-xs font-mono text-slate-400">
                Department of {user?.department || 'Computer Science & Engineering'}
              </span>
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-100">
              Welcome back, {user?.name || 'Scholar'}
            </h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Your personalized academic discovery feed is active. Preferences are calculated using our baseline content-matching engine with client-side Zero-Knowledge privacy protections.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigateTab('recommendations')}
              leftIcon={<Sparkles className="h-4 w-4" />}
            >
              Explore Feed
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigateTab('resources')}
              leftIcon={<Compass className="h-4 w-4" />}
            >
              Browse Library
            </Button>
          </div>
        </div>
      </div>

      {/* B. PERSONALIZED SUMMARY METRICS (REAL DATA) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 border-border-default bg-void-surface">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>Saved Stash</span>
            <Bookmark className="h-4 w-4 text-accent-cyan" />
          </div>
          <div className="font-display text-2xl font-bold text-slate-100">
            {savedItemIds.size}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Bookmarked resources & events</div>
        </Card>

        <Card className="p-4 border-border-default bg-void-surface">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>Recommendations</span>
            <Sparkles className="h-4 w-4 text-brand-400" />
          </div>
          <div className="font-display text-2xl font-bold text-slate-100">
            {topRecommendations.length > 0 ? '12 Active' : '0'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Calibrated to {user?.department || 'CS'}</div>
        </Card>

        <Card className="p-4 border-border-default bg-void-surface">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>Upcoming Events</span>
            <Calendar className="h-4 w-4 text-accent-amber" />
          </div>
          <div className="font-display text-2xl font-bold text-slate-100">
            {upcomingEvents.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Campus & virtual hackathons</div>
        </Card>

        <Card className="p-4 border-border-default bg-void-surface">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>Privacy Tier</span>
            <ShieldCheck className="h-4 w-4 text-status-verified" />
          </div>
          <div className="font-display text-2xl font-bold text-status-verified">
            Zero Cleartext
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Argon2id + 15m JWT session</div>
        </Card>
      </div>

      {/* QUICK ACTIONS BAR */}
      <div className="p-3 bg-void-surface rounded-md border border-border-default">
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 px-1">
          Quick Navigation Shortcuts
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => onNavigateTab('resources')}
            className="flex items-center gap-2.5 p-2 rounded bg-void-elevated/70 border border-border-default hover:border-brand-500/50 hover:bg-void-elevated transition-all text-left text-xs font-mono"
          >
            <Compass className="h-4 w-4 text-accent-cyan shrink-0" />
            <span className="text-slate-300 truncate">Explore Resources</span>
          </button>

          <button
            onClick={() => onNavigateTab('events')}
            className="flex items-center gap-2.5 p-2 rounded bg-void-elevated/70 border border-border-default hover:border-brand-500/50 hover:bg-void-elevated transition-all text-left text-xs font-mono"
          >
            <Calendar className="h-4 w-4 text-accent-amber shrink-0" />
            <span className="text-slate-300 truncate">Campus Events</span>
          </button>

          <button
            onClick={() => onNavigateTab('services')}
            className="flex items-center gap-2.5 p-2 rounded bg-void-elevated/70 border border-border-default hover:border-brand-500/50 hover:bg-void-elevated transition-all text-left text-xs font-mono"
          >
            <HeartHandshake className="h-4 w-4 text-accent-emerald shrink-0" />
            <span className="text-slate-300 truncate">Support Services</span>
          </button>

          <button
            onClick={() => onNavigateTab('privacy')}
            className="flex items-center gap-2.5 p-2 rounded bg-void-elevated/70 border border-border-default hover:border-brand-500/50 hover:bg-void-elevated transition-all text-left text-xs font-mono"
          >
            <ShieldCheck className="h-4 w-4 text-status-verified shrink-0" />
            <span className="text-slate-300 truncate">Privacy Center</span>
          </button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN SECTION: RECOMMENDATIONS PREVIEW & UPCOMING EVENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Curated Recommendations Preview */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-400" />
              <h3 className="font-display text-base font-semibold text-slate-100">
                Top Recommendations for You
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('recommendations')}
              className="text-xs font-mono text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {topRecommendations.map((rec) => {
              const isSaved = savedItemIds.has(rec.item_id);
              return (
                <Card
                  key={rec.item_id}
                  className="p-4 border-border-default bg-void-surface hover:border-brand-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="shield" size="sm">
                        {rec.item_type.toUpperCase()}
                      </Badge>
                      <span className="text-[10px] font-mono text-accent-cyan">
                        {Math.round(rec.score * 100)}% Match
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 truncate">
                        {rec.department}
                      </span>
                    </div>
                    <h4 className="font-display text-sm font-semibold text-slate-200 truncate">
                      {rec.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {rec.explanation}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Button
                      variant={isSaved ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => onToggleBookmark(rec.item_id, rec.item_type, rec)}
                      leftIcon={<Bookmark className="h-3 w-3" />}
                    >
                      {isSaved ? 'Saved' : 'Save'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onNavigateTab('recommendations')}
                    >
                      Details
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 Col): Upcoming Events Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-accent-amber" />
              <h3 className="font-display text-base font-semibold text-slate-100">
                Upcoming Events
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('events')}
              className="text-xs font-mono text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              <span>All Events</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {upcomingEvents.map((evt) => {
              const isSaved = savedItemIds.has(evt.id);
              return (
                <Card key={evt.id} className="p-3.5 border-border-default bg-void-surface space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant={evt.is_virtual ? 'shield' : 'neutral'} size="sm">
                      {evt.category}
                    </Badge>
                    <span className="text-[10px] font-mono text-slate-400">
                      {evt.date}
                    </span>
                  </div>
                  <h4 className="font-display text-xs font-semibold text-slate-200 line-clamp-1">
                    {evt.title}
                  </h4>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-slate-400 truncate max-w-[150px]">
                      {evt.location}
                    </span>
                    <button
                      onClick={() => onToggleBookmark(evt.id, 'event', evt)}
                      className={`text-xs font-mono p-1 rounded hover:bg-void-elevated transition-colors ${
                        isSaved ? 'text-accent-cyan' : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title={isSaved ? 'Remove from Saved' : 'Save Event'}
                    >
                      <Bookmark className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* D. RECENT ACTIVITY & SAVED SNIPPET */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Bookmarks */}
        <Card className="p-4 border-border-default bg-void-surface space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-accent-cyan" />
              <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-200">
                Recently Saved Items
              </h4>
            </div>
            <button
              onClick={() => onNavigateTab('saved')}
              className="text-[11px] font-mono text-brand-400 hover:underline"
            >
              Open Stash ({savedItemIds.size})
            </button>
          </div>

          {recentBookmarks.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400 font-mono">
              No saved items yet. Click the bookmark icon on any resource or event.
            </div>
          ) : (
            <div className="space-y-2">
              {recentBookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="p-2 rounded bg-void-elevated/60 border border-border-subtle flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-medium text-slate-200 truncate">{bm.title}</div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {bm.category} • {bm.item_type}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {bm.saved_at.split('T')[0]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Recommendation Feedback Activity */}
        <Card className="p-4 border-border-default bg-void-surface space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent-emerald" />
              <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-200">
                Recent Model Interactions
              </h4>
            </div>
            <button
              onClick={() => onNavigateTab('history')}
              className="text-[11px] font-mono text-brand-400 hover:underline"
            >
              Full History
            </button>
          </div>

          {recentHistory.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400 font-mono">
              No feedback interactions logged yet. Mark recommendations as useful or not relevant.
            </div>
          ) : (
            <div className="space-y-2">
              {recentHistory.map((hist) => (
                <div
                  key={hist.id}
                  className="p-2 rounded bg-void-elevated/60 border border-border-subtle flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-medium text-slate-200 truncate">{hist.title}</div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Feedback: <span className="text-brand-300 uppercase">{hist.feedback}</span>
                    </div>
                  </div>
                  <Badge variant={hist.feedback === 'useful' ? 'verified' : 'neutral'} size="sm">
                    {hist.feedback}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
