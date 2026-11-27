import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Globe,
  Search,
  Bookmark,
  Users,
} from 'lucide-react';
import { Card } from '../../../../design-system/components/Card';
import { Badge } from '../../../../design-system/components/Badge';
import { Button } from '../../../../design-system/components/Button';
import { Input } from '../../../../design-system/components/Input';
import { studentApi } from '../../../../services/studentApi';
import type { UniversityEvent } from '../../../../services/studentApi';

interface EventsViewProps {
  onToggleBookmark: (itemId: string, itemType: 'resource' | 'event' | 'service', snapshot: any) => Promise<void>;
  savedItemIds: Set<string>;
}

export const EventsView: React.FC<EventsViewProps> = ({
  onToggleBookmark,
  savedItemIds,
}) => {
  const [events, setEvents] = useState<UniversityEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [virtualOnly, setVirtualOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const categories = ['all', 'Hackathon', 'Guest Lecture', 'Workshop', 'Career Fair'];

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await studentApi.getEvents({
        category: selectedCategory,
        virtual_only: virtualOnly,
        search: searchQuery,
      });
      if (res.data?.events) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory, virtualOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Header */}
      <div className="p-4 bg-void-surface rounded-md border border-border-default space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex-1">
            <Input
              placeholder="Search campus events by keyword, host department, or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4 text-slate-400" />}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 px-3 py-2 rounded-sm bg-void-elevated border border-border-default text-xs font-mono text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={virtualOnly}
                onChange={(e) => setVirtualOnly(e.target.checked)}
                className="rounded border-border-default bg-void-pure text-brand-500 focus:ring-0"
              />
              <span>Virtual Only</span>
            </label>

            <Button type="submit" variant="primary" size="md">
              Filter
            </Button>
          </div>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full whitespace-nowrap border transition-all ${
                selectedCategory === cat
                  ? 'bg-accent-amber/20 text-accent-amber border-accent-amber font-semibold'
                  : 'bg-void-elevated text-slate-400 border-border-default hover:text-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-40 rounded-md bg-void-surface border border-border-default animate-pulse p-4" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <Card className="p-12 text-center border-border-default bg-void-surface space-y-3">
            <Calendar className="h-10 w-10 text-slate-500 mx-auto" />
            <h3 className="font-display text-base font-semibold text-slate-200">
              No upcoming events found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No scheduled events match your current filter parameters.
            </p>
          </Card>
        ) : (
          events.map((evt) => {
            const isSaved = savedItemIds.has(evt.id);
            return (
              <Card
                key={evt.id}
                className="p-5 border-border-default bg-void-surface hover:border-accent-amber/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="shield" size="sm">
                      {evt.category.toUpperCase()}
                    </Badge>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      {evt.is_virtual ? (
                        <>
                          <Globe className="h-3 w-3 text-accent-cyan" />
                          <span>Virtual / Livestream</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="h-3 w-3 text-accent-amber" />
                          <span>On-Campus</span>
                        </>
                      )}
                    </span>
                    {evt.registration_required && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-accent-amber/10 text-accent-amber border border-accent-amber/30">
                        RSVP Req. by {evt.registration_deadline}
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-base font-semibold text-slate-100">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                    {evt.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Calendar className="h-3.5 w-3.5 text-accent-amber" />
                      {evt.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {evt.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {evt.location}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Users className="h-3.5 w-3.5" />
                      {evt.attendees_count} Attending
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <Button
                    variant={isSaved ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => onToggleBookmark(evt.id, 'event', evt)}
                    leftIcon={<Bookmark className="h-3.5 w-3.5" />}
                  >
                    {isSaved ? 'Event Saved' : 'Bookmark Event'}
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
