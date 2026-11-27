import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Archive,
  Edit2,
  Trash2,
  ExternalLink,
  X,
} from 'lucide-react';
import { Card } from '../../../../design-system/components/Card';
import { Badge } from '../../../../design-system/components/Badge';
import { Button } from '../../../../design-system/components/Button';
import { Modal } from '../../../../design-system/components/Modal';
import { adminApi, type CreateResourcePayload } from '../../../../services/adminApi';
import type { AcademicResource } from '../../../../services/studentApi';

interface AdminResourcesViewProps {
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const AdminResourcesView: React.FC<AdminResourcesViewProps> = ({ onShowToast }) => {
  const [resources, setResources] = useState<(AcademicResource & { status: string })[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedResource, setSelectedResource] = useState<(AcademicResource & { status: string }) | null>(null);
  const [actionInProgress, setActionInProgress] = useState<boolean>(false);

  // Form states
  const [formData, setFormData] = useState<CreateResourcePayload>({
    title: '',
    description: '',
    category: 'Computer Science',
    department: 'Computer Science & Engineering',
    author_or_source: 'Academic Dept',
    tags: ['Algorithms', 'Research'],
    format: 'PDF',
    access_level: 'All Students',
    url: 'https://library.university.edu/docs',
    status: 'approved',
  });
  const [rawTags, setRawTags] = useState<string>('Algorithms, Research');

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getResources({
        category: categoryFilter,
        status: statusFilter,
        search: searchQuery,
      });
      if (res.resources) {
        setResources(res.resources);
      }
    } catch {
      onShowToast('Failed to load academic resources.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, statusFilter, searchQuery, onShowToast]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleOpenCreateModal = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Computer Science',
      department: 'Computer Science & Engineering',
      author_or_source: 'Academic Dept',
      tags: ['Algorithms', 'Research'],
      format: 'PDF',
      access_level: 'All Students',
      url: 'https://library.university.edu/docs',
      status: 'approved',
    });
    setRawTags('Algorithms, Research');
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (res: AcademicResource & { status: string }) => {
    setSelectedResource(res);
    setFormData({
      title: res.title,
      description: res.description,
      category: res.category,
      department: res.department,
      author_or_source: res.author_or_source,
      tags: res.tags,
      format: res.format,
      access_level: res.access_level,
      url: res.url,
      status: res.status as any,
    });
    setRawTags((res.tags || []).join(', '));
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (res: AcademicResource & { status: string }) => {
    setSelectedResource(res);
    setIsDeleteModalOpen(true);
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionInProgress(true);
    try {
      const parsedTags = rawTags.split(',').map((t) => t.trim()).filter(Boolean);
      await adminApi.createResource({
        ...formData,
        tags: parsedTags,
      });
      onShowToast('Academic resource published successfully.', 'success');
      setIsCreateModalOpen(false);
      fetchResources();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create resource.';
      onShowToast(msg, 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResource) return;
    setActionInProgress(true);
    try {
      const parsedTags = rawTags.split(',').map((t) => t.trim()).filter(Boolean);
      await adminApi.updateResource(selectedResource.id, {
        ...formData,
        tags: parsedTags,
      });
      onShowToast('Resource updated successfully.', 'success');
      setIsEditModalOpen(false);
      fetchResources();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update resource.';
      onShowToast(msg, 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedResource) return;
    setActionInProgress(true);
    try {
      await adminApi.deleteResource(selectedResource.id);
      onShowToast('Resource removed from catalog.', 'info');
      setIsDeleteModalOpen(false);
      fetchResources();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete resource.';
      onShowToast(msg, 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleStatusChange = async (
    resourceId: string,
    newStatus: 'approved' | 'pending_approval' | 'archived' | 'rejected'
  ) => {
    try {
      await adminApi.updateResourceStatus(resourceId, newStatus);
      onShowToast(`Resource status changed to ${newStatus}.`, 'success');
      fetchResources();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update status.';
      onShowToast(msg, 'error');
    }
  };

  const getStatusBadgeVariant = (st: string): 'verified' | 'pending' | 'danger' | 'neutral' => {
    switch (st) {
      case 'approved':
        return 'verified';
      case 'pending_approval':
        return 'pending';
      case 'rejected':
        return 'danger';
      case 'archived':
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-slate-100 tracking-tight">
              Academic Resources Catalog
            </h1>
            <Badge variant="neutral" size="sm">{resources.length} Listed</Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Curate research papers, courseware, lab manuals, and datasets; review community submissions
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenCreateModal}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Resource
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border-border-default/70 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources by title, department, or keywords..."
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
              aria-label="Filter resources by category"
              className="bg-transparent focus:outline-none text-slate-200 cursor-pointer"
            >
              <option value="all" className="bg-void-surface text-slate-200">All Categories</option>
              <option value="Computer Science" className="bg-void-surface text-slate-200">Computer Science</option>
              <option value="Data Science & AI" className="bg-void-surface text-slate-200">Data Science & AI</option>
              <option value="Cybersecurity" className="bg-void-surface text-slate-200">Cybersecurity</option>
              <option value="Mathematics" className="bg-void-surface text-slate-200">Mathematics</option>
              <option value="Physics" className="bg-void-surface text-slate-200">Physics</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-void-surface border border-border-default rounded-sm px-2.5 py-1.5 text-xs font-mono text-slate-300">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter resources by publication status"
              className="bg-transparent focus:outline-none text-slate-200 cursor-pointer"
            >
              <option value="all" className="bg-void-surface text-slate-200">All Statuses</option>
              <option value="approved" className="bg-void-surface text-slate-200">Approved</option>
              <option value="pending_approval" className="bg-void-surface text-slate-200">Pending Review</option>
              <option value="archived" className="bg-void-surface text-slate-200">Archived</option>
              <option value="rejected" className="bg-void-surface text-slate-200">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Resources Table */}
      <Card className="border-border-default/70 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-slate-800/40 rounded animate-pulse" />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <BookOpen className="h-8 w-8 text-slate-600 mx-auto" />
            <div className="font-mono text-xs text-slate-400">No resources found matching filter criteria.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-border-default/60 bg-void-surface/50 text-slate-400">
                  <th className="py-3 px-4 font-medium">Resource Title</th>
                  <th className="py-3 px-4 font-medium">Category / Department</th>
                  <th className="py-3 px-4 font-medium">Format</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Moderation</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default/40">
                {resources.map((item) => (
                  <tr key={item.id} className="hover:bg-void-surface/40 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-slate-100 truncate">{item.title}</div>
                      <div className="text-[11px] text-slate-400 truncate">{item.author_or_source}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-200">{item.category}</div>
                      <div className="text-[10px] text-slate-500 truncate">{item.department}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700">
                        {item.format}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusBadgeVariant(item.status)} size="sm">
                        {item.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {item.status !== 'approved' && (
                          <button
                            onClick={() => handleStatusChange(item.id, 'approved')}
                            className="p-1 rounded text-emerald-400 hover:bg-emerald-500/10"
                            title="Approve Resource"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {item.status !== 'rejected' && item.status !== 'archived' && (
                          <button
                            onClick={() => handleStatusChange(item.id, 'rejected')}
                            className="p-1 rounded text-rose-400 hover:bg-rose-500/10"
                            title="Reject Resource"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {item.status !== 'archived' && (
                          <button
                            onClick={() => handleStatusChange(item.id, 'archived')}
                            className="p-1 rounded text-slate-400 hover:bg-slate-700/30"
                            title="Archive Resource"
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
                            title="Visit URL"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 rounded-sm text-slate-400 hover:text-brand-300 hover:bg-brand-500/10 transition-colors"
                          title="Edit Details"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(item)}
                          className="p-1.5 rounded-sm text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Permanently"
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

      {/* Add / Edit Resource Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <Modal
          isOpen={isCreateModalOpen || isEditModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
          }}
          title={isCreateModalOpen ? 'Publish New Academic Resource' : 'Update Resource Information'}
          maxWidth="lg"
        >
          <form onSubmit={isCreateModalOpen ? handleSaveCreate : handleSaveEdit} className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-400">Resource Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Distributed Consensus Systems Laboratory Manual"
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
                  placeholder="Brief academic description of resource content..."
                  className="w-full bg-void-surface border border-border-default rounded-sm px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Discipline / Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-void-surface border border-border-default rounded-sm px-3 py-2 text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">University Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-void-surface border border-border-default rounded-sm px-3 py-2 text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Author or Faculty Source</label>
                <input
                  type="text"
                  value={formData.author_or_source}
                  onChange={(e) => setFormData({ ...formData, author_or_source: e.target.value })}
                  className="w-full bg-void-surface border border-border-default rounded-sm px-3 py-2 text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Format (e.g. PDF, Code, Dataset)</label>
                <input
                  type="text"
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  className="w-full bg-void-surface border border-border-default rounded-sm px-3 py-2 text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-400">Resource URL / Repository Link</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full bg-void-surface border border-border-default rounded-sm px-3 py-2 text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-400">Subject Tags (comma separated)</label>
                <input
                  type="text"
                  value={rawTags}
                  onChange={(e) => setRawTags(e.target.value)}
                  placeholder="Algorithms, Machine Learning, Research"
                  className="w-full bg-void-surface border border-border-default rounded-sm px-3 py-2 text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Publication Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-void-surface border border-border-default rounded-sm px-3 py-2 text-slate-100 focus:outline-none focus:border-brand-500"
                >
                  <option value="approved">Approved</option>
                  <option value="pending_approval">Pending Review</option>
                  <option value="archived">Archived</option>
                  <option value="rejected">Rejected</option>
                </select>
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
                {actionInProgress
                  ? 'Saving...'
                  : isCreateModalOpen
                  ? 'Publish Resource'
                  : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {selectedResource && isDeleteModalOpen && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Academic Resource"
          maxWidth="sm"
        >
          <div className="space-y-4 font-mono text-xs">
            <p className="text-slate-400">
              Are you sure you want to permanently delete{' '}
              <span className="text-slate-200 font-semibold">{selectedResource.title}</span>?
              This action is logged to the immutable audit trail and cannot be undone.
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
                {actionInProgress ? 'Deleting...' : 'Delete Resource'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
