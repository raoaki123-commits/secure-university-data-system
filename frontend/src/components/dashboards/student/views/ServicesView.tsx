import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Mail,
  MapPin,
  Clock,
  Shield,
  Search,
  Bookmark,
} from 'lucide-react';
import { Card } from '../../../../design-system/components/Card';
import { Badge } from '../../../../design-system/components/Badge';
import { Button } from '../../../../design-system/components/Button';
import { Input } from '../../../../design-system/components/Input';
import { studentApi } from '../../../../services/studentApi';
import type { UniversityService } from '../../../../services/studentApi';

interface ServicesViewProps {
  onToggleBookmark: (itemId: string, itemType: 'resource' | 'event' | 'service', snapshot: any) => Promise<void>;
  savedItemIds: Set<string>;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  onToggleBookmark,
  savedItemIds,
}) => {
  const [services, setServices] = useState<UniversityService[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const categories = [
    'all',
    'Student Support',
    'Academic Support',
    'Library Services',
    'Technical Support',
    'Career Guidance',
  ];

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await studentApi.getServices({
        category: selectedCategory,
        search: searchQuery,
      });
      if (res.data?.services) {
        setServices(res.data.services);
      }
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchServices();
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Header */}
      <div className="p-4 bg-void-surface rounded-md border border-border-default space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex-1">
            <Input
              placeholder="Search university wellness, IT hardware loaners, counseling, library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4 text-slate-400" />}
            />
          </div>

          <Button type="submit" variant="primary" size="md">
            Filter Services
          </Button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full whitespace-nowrap border transition-all ${
                selectedCategory === cat
                  ? 'bg-accent-emerald/20 text-accent-emerald border-accent-emerald font-semibold'
                  : 'bg-void-elevated text-slate-400 border-border-default hover:text-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Services' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          [1, 2, 3, 4].map((n) => (
            <div key={n} className="h-48 rounded-md bg-void-surface border border-border-default animate-pulse p-4" />
          ))
        ) : services.length === 0 ? (
          <div className="col-span-2">
            <Card className="p-12 text-center border-border-default bg-void-surface space-y-3">
              <HeartHandshake className="h-10 w-10 text-slate-500 mx-auto" />
              <h3 className="font-display text-base font-semibold text-slate-200">
                No matching university services
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No active campus services match your current query.
              </p>
            </Card>
          </div>
        ) : (
          services.map((srv) => {
            const isSaved = savedItemIds.has(srv.id);
            const isZeroKnowledge = srv.confidentiality_tier.includes('Zero-Knowledge');
            return (
              <Card
                key={srv.id}
                className="p-5 border-border-default bg-void-surface hover:border-accent-emerald/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="shield" size="sm">
                      {srv.category.toUpperCase()}
                    </Badge>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                        isZeroKnowledge
                          ? 'bg-status-verified/10 text-status-verified border-status-verified/30'
                          : 'bg-void-elevated text-slate-400 border-border-default'
                      }`}
                    >
                      <Shield className="h-3 w-3" />
                      {srv.confidentiality_tier}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-sm font-semibold text-slate-100">
                      {srv.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {srv.description}
                    </p>
                  </div>

                  {/* Metadata coordinates */}
                  <div className="space-y-1.5 text-xs font-mono text-slate-400 pt-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-accent-cyan shrink-0" />
                      <span className="truncate">{srv.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-accent-amber shrink-0" />
                      <span className="truncate">{srv.hours}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-brand-400 shrink-0" />
                      <a
                        href={`mailto:${srv.contact_email}`}
                        className="text-brand-300 hover:underline truncate"
                      >
                        {srv.contact_email}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    Accredited Campus Service
                  </span>

                  <Button
                    variant={isSaved ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => onToggleBookmark(srv.id, 'service', srv)}
                    leftIcon={<Bookmark className="h-3 w-3" />}
                  >
                    {isSaved ? 'Saved in Stash' : 'Bookmark'}
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
