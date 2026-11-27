import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  Trash2,
  Compass,
} from 'lucide-react';
import { Card } from '../../../../design-system/components/Card';
import { Badge } from '../../../../design-system/components/Badge';
import { Button } from '../../../../design-system/components/Button';
import { studentApi } from '../../../../services/studentApi';
import type { BookmarkItem } from '../../../../services/studentApi';
import type { StudentNavTab } from '../StudentSidebar';

interface SavedItemsViewProps {
  onNavigateTab: (tab: StudentNavTab) => void;
  onToggleBookmark: (itemId: string, itemType: 'resource' | 'event' | 'service', snapshot: any) => Promise<void>;
  savedItemIds: Set<string>;
}

export const SavedItemsView: React.FC<SavedItemsViewProps> = ({
  onNavigateTab,
  onToggleBookmark,
  savedItemIds,
}) => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'resource' | 'event' | 'service'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchBookmarks = async () => {
    setIsLoading(true);
    try {
      const res = await studentApi.getBookmarks();
      if (res.data?.bookmarks) {
        setBookmarks(res.data.bookmarks);
      }
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [savedItemIds.size]);

  const handleRemove = async (bm: BookmarkItem) => {
    await onToggleBookmark(bm.item_id, bm.item_type, bm.metadata);
    setBookmarks((prev) => prev.filter((b) => b.item_id !== bm.item_id));
  };

  const filteredBookmarks = bookmarks.filter((bm) => {
    if (filterType === 'all') return true;
    return bm.item_type === filterType;
  });

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="p-4 bg-void-surface rounded-md border border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-slate-100 flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-accent-cyan" />
            <span>Saved Academic Collection ({bookmarks.length})</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Items saved from resource discovery, events catalog, and personal recommendations.
          </p>
        </div>

        {/* Filter Types */}
        <div className="flex items-center gap-1 bg-void-elevated p-1 rounded-sm border border-border-default text-xs font-mono self-start sm:self-center">
          {(['all', 'resource', 'event', 'service'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded-xs transition-colors uppercase text-[10px] tracking-wide ${
                filterType === type
                  ? 'bg-brand-500 text-slate-50 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {type === 'all' ? 'All' : `${type}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Bookmarks Grid / List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 rounded-md bg-void-surface border border-border-default animate-pulse p-4" />
          ))}
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <Card className="p-12 text-center border-border-default bg-void-surface space-y-3">
          <Bookmark className="h-10 w-10 text-slate-500 mx-auto" />
          <h3 className="font-display text-base font-semibold text-slate-200">
            {filterType === 'all' ? 'Your saved collection is empty' : `No saved ${filterType}s`}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Browse our verified library of academic lecture notes, research opportunities, and university events to bookmark items for offline study.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigateTab('resources')}
              leftIcon={<Compass className="h-4 w-4" />}
            >
              Discover Resources
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredBookmarks.map((bm) => (
            <Card
              key={bm.id}
              className="p-4 border-border-default bg-void-surface hover:border-brand-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="shield" size="sm">
                    {bm.item_type.toUpperCase()}
                  </Badge>
                  <span className="text-[11px] font-mono text-slate-400 truncate">
                    {bm.category} {bm.department ? `• ${bm.department}` : ''}
                  </span>
                </div>
                <h4 className="font-display text-sm font-semibold text-slate-100 truncate">
                  {bm.title}
                </h4>
                <div className="text-[10px] font-mono text-slate-400">
                  Bookmarked on {bm.saved_at.split('T')[0]}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => handleRemove(bm)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-void-elevated hover:bg-status-danger/10 border border-border-default hover:border-status-danger/30 text-xs font-mono text-slate-400 hover:text-status-danger transition-colors"
                  title="Remove from saved stash"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
