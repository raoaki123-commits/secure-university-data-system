import React, { useState, useEffect } from 'react';
import {
  Search,
  Bookmark,
  ExternalLink,
  BookOpen,
  Star,
} from 'lucide-react';
import { Card } from '../../../../design-system/components/Card';
import { Badge } from '../../../../design-system/components/Badge';
import { Button } from '../../../../design-system/components/Button';
import { Input } from '../../../../design-system/components/Input';
import { Modal } from '../../../../design-system/components/Modal';
import { studentApi } from '../../../../services/studentApi';
import type { AcademicResource } from '../../../../services/studentApi';

interface ResourcesViewProps {
  onToggleBookmark: (itemId: string, itemType: 'resource' | 'event' | 'service', snapshot: any) => Promise<void>;
  savedItemIds: Set<string>;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  onToggleBookmark,
  savedItemIds,
}) => {
  const [resources, setResources] = useState<AcademicResource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeResource, setActiveResource] = useState<AcademicResource | null>(null);

  const categories = [
    { id: 'all', label: 'All Resources' },
    { id: 'study-materials', label: 'Study Materials' },
    { id: 'research-resources', label: 'Research Papers' },
    { id: 'academic-opportunities', label: 'Fellowships & Grants' },
    { id: 'learning-materials', label: 'Learning Guides' },
    { id: 'tutorials', label: 'Tutorials & Code' },
    { id: 'academic-support', label: 'Tutoring & Support' },
  ];

  const departments = [
    'all',
    'Computer Science',
    'Mathematics',
    'Electrical Engineering',
    'Interdisciplinary',
  ];

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const res = await studentApi.getResources({
        category: selectedCategory,
        department: selectedDepartment,
        search: searchQuery,
        sort: sortBy,
      });
      if (res.data?.resources) {
        setResources(res.data.resources);
      }
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedCategory, selectedDepartment, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources();
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Header Bar */}
      <div className="p-4 bg-void-surface rounded-md border border-border-default space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex-1">
            <Input
              placeholder="Search by title, topic (e.g. CKKS, SVD, Cryptography), or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4 text-slate-400" />}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-2 rounded-sm bg-void-elevated border border-border-default text-xs font-mono text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Departments</option>
              {departments.filter(d => d !== 'all').map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-sm bg-void-elevated border border-border-default text-xs font-mono text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="newest">Newest First</option>
              <option value="saves">Most Bookmarked</option>
              <option value="rating">Highest Rated</option>
              <option value="title">Alphabetical</option>
            </select>

            <Button type="submit" variant="primary" size="md">
              Search
            </Button>
          </div>
        </form>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs font-mono">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full whitespace-nowrap border transition-all ${
                selectedCategory === cat.id
                  ? 'bg-brand-500 text-slate-50 border-brand-400 font-semibold shadow-sm'
                  : 'bg-void-elevated text-slate-400 border-border-default hover:text-slate-200 hover:border-border-hover'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header count */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
        <span>Showing {resources.length} verified academic resources</span>
        <span>Catalog indexed in MongoDB</span>
      </div>

      {/* Resources Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-56 rounded-md bg-void-surface border border-border-default animate-pulse p-4 space-y-3" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <Card className="p-12 text-center border-border-default bg-void-surface space-y-3">
          <BookOpen className="h-10 w-10 text-slate-500 mx-auto" />
          <h3 className="font-display text-base font-semibold text-slate-200">
            No matching resources found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query, selecting "All Resources", or clearing department filters.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSelectedCategory('all');
              setSelectedDepartment('all');
              setSearchQuery('');
            }}
          >
            Clear Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((item) => {
            const isSaved = savedItemIds.has(item.id);
            return (
              <Card
                key={item.id}
                className="p-5 border-border-default bg-void-surface hover:border-brand-500/40 flex flex-col justify-between transition-all group"
              >
                <div className="space-y-3">
                  {/* Card Header Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="shield" size="sm">
                      {item.category.replace('-', ' ').toUpperCase()}
                    </Badge>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-accent-amber">
                      <Star className="h-3 w-3 fill-accent-amber text-accent-amber" />
                      <span>{item.rating}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3
                      onClick={() => setActiveResource(item)}
                      className="font-display text-sm font-semibold text-slate-100 group-hover:text-brand-300 transition-colors cursor-pointer line-clamp-2"
                    >
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-void-elevated text-slate-400 border border-border-subtle"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Metadata & Actions */}
                <div className="pt-4 mt-3 border-t border-border-subtle flex items-center justify-between">
                  <div className="text-[11px] font-mono text-slate-400 truncate max-w-[140px]">
                    {item.department}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onToggleBookmark(item.id, 'resource', item)}
                      className={`p-1.5 rounded-sm border transition-colors ${
                        isSaved
                          ? 'bg-brand-500/20 text-brand-300 border-brand-500'
                          : 'bg-void-elevated text-slate-400 border-border-default hover:text-slate-200 hover:border-border-hover'
                      }`}
                      title={isSaved ? 'Remove from Saved' : 'Save Resource'}
                    >
                      <Bookmark className="h-3.5 w-3.5" />
                    </button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setActiveResource(item)}
                    >
                      Inspect
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Resource Detail Inspection Modal */}
      {activeResource && (
        <Modal
          isOpen={!!activeResource}
          onClose={() => setActiveResource(null)}
          title={activeResource.title}
          description={`Verified academic material hosted under ${activeResource.department}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-left">
            <div className="flex flex-wrap gap-2">
              <Badge variant="verified">{activeResource.format}</Badge>
              <Badge variant="shield">{activeResource.access_level}</Badge>
              <Badge variant="confidential">{activeResource.category}</Badge>
              <span className="text-xs font-mono text-accent-amber flex items-center gap-1 ml-auto">
                <Star className="h-3.5 w-3.5 fill-accent-amber" />
                {activeResource.rating} / 5.0 peer rating ({activeResource.saves_count} bookmarks)
              </span>
            </div>

            <div>
              <h4 className="text-xs font-mono font-semibold uppercase text-slate-400 mb-1">
                Overview & Description
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed bg-void-elevated p-3 rounded border border-border-subtle">
                {activeResource.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded bg-void-elevated border border-border-subtle space-y-0.5">
                <div className="text-[10px] text-slate-400 uppercase">Author / Source</div>
                <div className="text-slate-200 font-medium">{activeResource.author_or_source}</div>
              </div>
              <div className="p-2.5 rounded bg-void-elevated border border-border-subtle space-y-0.5">
                <div className="text-[10px] text-slate-400 uppercase">Academic Division</div>
                <div className="text-slate-200 font-medium">{activeResource.department}</div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-mono font-semibold uppercase text-slate-400 mb-1">
                Topic Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {activeResource.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-mono px-2 py-0.5 rounded bg-void-elevated text-brand-300 border border-brand-500/30"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-border-default flex items-center justify-between">
              <Button
                variant={savedItemIds.has(activeResource.id) ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => onToggleBookmark(activeResource.id, 'resource', activeResource)}
                leftIcon={<Bookmark className="h-3.5 w-3.5" />}
              >
                {savedItemIds.has(activeResource.id) ? 'Saved in Stash' : 'Bookmark to Stash'}
              </Button>

              <a
                href={activeResource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-brand-500 text-slate-50 hover:bg-brand-600 text-xs font-mono font-medium transition-colors"
              >
                <span>Access Resource Source</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
