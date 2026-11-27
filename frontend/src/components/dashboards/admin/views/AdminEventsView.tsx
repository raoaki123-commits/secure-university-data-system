import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  MapPin,
  Video,
  Users,
  Edit2,
  Trash2,
  Clock,
  X,
} from 'lucide-react';
import { Card } from '../../../../design-system/components/Card';
import { Badge } from '../../../../design-system/components/Badge';
import { Button } from '../../../../design-system/components/Button';
import { Modal } from '../../../../design-system/components/Modal';
import { adminApi, type CreateEventPayload } from '../../../../services/adminApi';
import type { UniversityEvent } from '../../../../services/studentApi';

interface AdminEventsViewProps {
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const AdminEventsView: React.FC<AdminEventsViewProps> = ({ onShowToast }) => {
  const [events, setEvents] = useState<(UniversityEvent & { status: string })[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<(UniversityEvent & { status: string }) | null>(null);
  const [actionInProgress, setActionInProgress] = useState<boolean>(false);

  // Form state
  const [formData, setFormData] = useState<CreateEventPayload>({
    title: '',
    description: '',
    category: 'Workshops',
    department_or_host: 'Center for Privacy & Security',
    date: '2026-11-20',
    time: '14:00 - 16:00',
    location: 'Main Auditorium & Streaming Node',
    is_virtual: false,
    registration_required: true,
    registration_deadline: '2026-11-19',
    tags: ['Workshop', 'Cryptography'],
    status: 'approved',
  });
  const [rawTags, setRawTags] = useState<string>('Workshop, Cryptography');

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getEvents({
        category: categoryFilter,
        search: searchQuery,
      });
      if (res.events) {
        setEvents(res.events);
      }
    } catch {
      onShowToast('Failed to load campus events.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, searchQuery, onShowToast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleOpenCreateModal = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Workshops',
      department_or_host: 'Center for Privacy & Security',
      date: '2026-11-20',
      time: '14:00 - 16:00',
      location: 'Main Auditorium & Streaming Node',
      is_virtual: false,
      registration_required: true,
      registration_deadline: '2026-11-19',
      tags: ['Workshop', 'Cryptography'],
      status: 'approved',
    });
    setRawTags('Workshop, Cryptography');
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (evt: UniversityEvent & { status: string }) => {
    setSelectedEvent(evt);
    setFormData({
      title: evt.title,
      description: evt.description,
      category: evt.category,
      department_or_host: evt.department_or_host,
      date: evt.date,
      time: evt.time,
      location: evt.location,
      is_virtual: evt.is_virtual,
      registration_required: evt.registration_required,
      registration_deadline: evt.registration_deadline || '',
      tags: evt.tags,
      status: evt.status as any,
    });
    setRawTags((evt.tags || []).join(', '));
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (evt: UniversityEvent & { status: string }) => {
    setSelectedEvent(evt);
    setIsDeleteModalOpen(true);
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionInProgress(true);
    try {
      const parsedTags = rawTags.split(',').map((t) => t.trim()).filter(Boolean);
      await adminApi.createEvent({
        ...formData,
        tags: parsedTags,
      });
      onShowToast('Campus event scheduled successfully.', 'success');
      setIsCreateModalOpen(false);
      fetchEvents();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create event.';
      onShowToast(msg, 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setActionInProgress(true);
    try {
      const parsedTags = rawTags.split(',').map((t) => t.trim()).filter(Boolean);
      await adminApi.updateEvent(selectedEvent.id, {
        ...formData,
        tags: parsedTags,
      });
      onShowToast('Event updated successfully.', 'success');
      setIsEditModalOpen(false);
      fetchEvents();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update event.';
      onShowToast(msg, 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    setActionInProgress(true);
    try {
      await adminApi.deleteEvent(selectedEvent.id);
      onShowToast('Event cancelled and removed.', 'info');
      setIsDeleteModalOpen(false);
      fetchEvents();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete event.';
      onShowToast(msg, 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-slate-100 tracking-tight">
              Campus Events & Conferences
            </h1>
            <Badge variant="neutral" size="sm">{events.length} Listed</Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Coordinate guest lectures, symposiums, research seminars, and student hackathons
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenCreateModal}>
          <Plus className="h-4 w-4 mr-1.5" />
          Schedule Event
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 border-border-default/70 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by title or host..."
            className="w-full bg-void-surface border border-border-default rounded-sm pl-9 pr-4 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 bg-void-surface border border-border-default rounded-sm px-2.5 py-1.5 text-xs font-mono text-slate-300">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter events by category"
              className="bg-transparent focus:outline-none text-slate-200 cursor-pointer"
            >
              <option value="all" className="bg-void-surface text-slate-200">All Categories</option>
              <option value="Seminars" className="bg-void-surface text-slate-200">Seminars</option>
              <option value="Workshops" className="bg-void-surface text-slate-200">Workshops</option>
              <option value="Career" className="bg-void-surface text-slate-200">Career</option>
              <option value="Hackathon" className="bg-void-surface text-slate-200">Hackathon</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Events Table */}
      <Card className="border-border-default/70 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-slate-800/40 rounded animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Calendar className="h-8 w-8 text-slate-600 mx-auto" />
            <div className="font-mono text-xs text-slate-400">No events found matching your query.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-border-default/60 bg-void-surface/50 text-slate-400">
                  <th className="py-3 px-4 font-medium">Event Title & Host</th>
                  <th className="py-3 px-4 font-medium">Schedule</th>
                  <th className="py-3 px-4 font-medium">Venue Type</th>
                  <th className="py-3 px-4 font-medium">Attendees</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default/40">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-void-surface/40 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-slate-100 truncate">{evt.title}</div>
                      <div className="text-[11px] text-slate-400 truncate">{evt.department_or_host}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        <span>{evt.date}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>{evt.time}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {evt.is_virtual ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30">
                          <Video className="h-3 w-3" />
                          Virtual / Remote
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700 truncate max-w-[150px]">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{evt.location}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-slate-500" />
                        <span>{evt.attendees_count || 0}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={evt.status === 'approved' ? 'verified' : 'pending'}
                        size="sm"
                      >
                        {(evt.status || 'approved').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(evt)}
                          className="p-1.5 rounded-sm text-slate-400 hover:text-brand-300 hover:bg-brand-500/10 transition-colors"
                          title="Edit Event"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(evt)}
                          className="p-1.5 rounded-sm text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create / Edit Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <Modal
          isOpen={isCreateModalOpen || isEditModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
          }}
          title={isCreateModalOpen ? 'Schedule University Event' : 'Update Campus Event'}
          maxWidth="lg"
        >
          <form onSubmit={isCreateModalOpen ? handleSaveCreate : handleSaveEdit} className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-400">Event Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Cryptographic Foundations of Web3 Symposium"
                  className="w-full bg-void-surface border border-border-default rounded-sm px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-400">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed event program and speaker overview..."
                  className="w-full bg-void-surface border border-border-default rounded-sm px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-void-surface border border-border-default rounded-sm px-3 py-2 text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Host Department / Org</label>
                <input
                  type="text"
                  value={formData.department_or_host}
                  onChange={(e) => setFormData({ ...formData, department_or_host: e.target.value })}
                  className="w-full bg-void-surface border border-border-default rounded-sm px-3 py-2 text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Date (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-void-surface border border-border-default rounded-sm px-3 py-2 text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Time Window</label>
                <input
                  type="text"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  placeholder="e.g. 14:00 - 16:30"
                  className="w-full bg-void-surface border border-border-default rounded-sm px-3 py-2 text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-400">Location / Room Number</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Room 402, Turing Engineering Hall"
                  className="w-full bg-void-surface border border-border-default rounded-sm px-3 py-2 text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-400">Tags (comma separated)</label>
                <input
                  type="text"
                  value={rawTags}
                  onChange={(e) => setRawTags(e.target.value)}
                  className="w-full bg-void-surface border border-border-default rounded-sm px-3 py-2 text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center gap-4 sm:col-span-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.is_virtual}
                    onChange={(e) => setFormData({ ...formData, is_virtual: e.target.checked })}
                    className="accent-brand-500 h-4 w-4"
                  />
                  <span>Virtual / Livestream Broadcast</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.registration_required}
                    onChange={(e) => setFormData({ ...formData, registration_required: e.target.checked })}
                    className="accent-brand-500 h-4 w-4"
                  />
                  <span>Prior Registration Mandatory</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border-default">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                disabled={actionInProgress}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={actionInProgress}>
                {actionInProgress ? 'Saving...' : isCreateModalOpen ? 'Schedule Event' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {selectedEvent && isDeleteModalOpen && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Cancel and Delete Event"
          maxWidth="sm"
        >
          <div className="space-y-4 font-mono text-xs">
            <p className="text-slate-400">
              Are you sure you want to cancel and delete{' '}
              <span className="text-slate-200 font-semibold">{selectedEvent.title}</span>?
              Registered attendees will no longer see this in their calendar view.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={actionInProgress}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                disabled={actionInProgress}
              >
                {actionInProgress ? 'Deleting...' : 'Delete Event'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
