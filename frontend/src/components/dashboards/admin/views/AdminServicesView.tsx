import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  Plus,
  Search,
  Shield,
  MapPin,
  Mail,
  Edit2,
  Trash2,
  Power,
  X,
} from 'lucide-react';
import { Card } from '../../../../design-system/components/Card';
import { Badge } from '../../../../design-system/components/Badge';
import { Button } from '../../../../design-system/components/Button';
import { Modal } from '../../../../design-system/components/Modal';
import { adminApi, type CreateServicePayload } from '../../../../services/adminApi';
import type { UniversityService } from '../../../../services/studentApi';

interface AdminServicesViewProps {
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const AdminServicesView: React.FC<AdminServicesViewProps> = ({ onShowToast }) => {
  const [services, setServices] = useState<UniversityService[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<UniversityService | null>(null);
  const [actionInProgress, setActionInProgress] = useState<boolean>(false);

  // Form state
  const [formData, setFormData] = useState<CreateServicePayload>({
    name: '',
    description: '',
    category: 'Student Support',
    contact_email: 'support@university.edu',
    location: 'Student Health & Wellness Center',
    hours: 'Mon-Fri: 09:00 - 17:00',
    confidentiality_tier: 'Strict HIPAA / FERPA',
    is_active: true,
    tags: ['Counseling', 'Confidential'],
  });
  const [rawTags, setRawTags] = useState<string>('Counseling, Confidential');

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getServices();
      if (res.services) {
        setServices(res.services);
      }
    } catch {
      onShowToast('Failed to load university services.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [onShowToast]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Student Support',
      contact_email: 'support@university.edu',
      location: 'Student Center Suite 200',
      hours: 'Mon-Fri: 09:00 - 17:00',
      confidentiality_tier: 'Strict HIPAA / FERPA',
      is_active: true,
      tags: ['Counseling', 'Confidential'],
    });
    setRawTags('Counseling, Confidential');
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (srv: UniversityService) => {
    setSelectedService(srv);
    setFormData({
      name: srv.name,
      description: srv.description,
      category: srv.category,
      contact_email: srv.contact_email,
      location: srv.location,
      hours: srv.hours,
      confidentiality_tier: srv.confidentiality_tier,
      is_active: srv.is_active,
      tags: srv.tags,
    });
    setRawTags((srv.tags || []).join(', '));
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (srv: UniversityService) => {
    setSelectedService(srv);
    setIsDeleteModalOpen(true);
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionInProgress(true);
    try {
      const parsedTags = rawTags.split(',').map((t) => t.trim()).filter(Boolean);
      await adminApi.createService({
        ...formData,
        tags: parsedTags,
      });
      onShowToast('University service registered.', 'success');
      setIsCreateModalOpen(false);
      fetchServices();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create service.';
      onShowToast(msg, 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    setActionInProgress(true);
    try {
      const parsedTags = rawTags.split(',').map((t) => t.trim()).filter(Boolean);
      await adminApi.updateService(selectedService.id, {
        ...formData,
        tags: parsedTags,
      });
      onShowToast('Service configuration updated.', 'success');
      setIsEditModalOpen(false);
      fetchServices();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update service.';
      onShowToast(msg, 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedService) return;
    setActionInProgress(true);
    try {
      await adminApi.deleteService(selectedService.id);
      onShowToast('Service removed from university registry.', 'info');
      setIsDeleteModalOpen(false);
      fetchServices();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete service.';
      onShowToast(msg, 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleToggleActive = async (srv: UniversityService) => {
    try {
      const res = await adminApi.updateServiceStatus(srv.id, !srv.is_active);
      onShowToast(
        `Service "${srv.name}" ${res.is_active ? 'activated' : 'deactivated'}.`,
        'success'
      );
      fetchServices();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to toggle status.';
      onShowToast(msg, 'error');
    }
  };

  const filteredServices = services.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-slate-100 tracking-tight">
              University Services Registry
            </h1>
            <Badge variant="neutral" size="sm">{services.length} Registered</Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Maintain campus health, career counseling, tutoring enclaves, and academic accommodations
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenCreateModal}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Service
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4 border-border-default/70 flex items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services by name or category..."
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
      </Card>

      {/* Services Table */}
      <Card className="border-border-default/70 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-slate-800/40 rounded animate-pulse" />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Layers className="h-8 w-8 text-slate-600 mx-auto" />
            <div className="font-mono text-xs text-slate-400">No services match your search query.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-border-default/60 bg-void-surface/50 text-slate-400">
                  <th className="py-3 px-4 font-medium">Service Name</th>
                  <th className="py-3 px-4 font-medium">Confidentiality Tier</th>
                  <th className="py-3 px-4 font-medium">Contact & Location</th>
                  <th className="py-3 px-4 font-medium">Availability Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default/40">
                {filteredServices.map((srv) => (
                  <tr key={srv.id} className="hover:bg-void-surface/40 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-slate-100">{srv.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{srv.category}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-accent-cyan shrink-0" />
                        <span className="text-slate-300 text-[11px]">{srv.confidentiality_tier}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{srv.contact_email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5 truncate">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{srv.location}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(srv)}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                          srv.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700/40'
                        }`}
                        title="Click to toggle availability"
                      >
                        <Power className="h-3 w-3" />
                        {srv.is_active ? 'ACTIVE' : 'OFFLINE'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(srv)}
                          className="p-1.5 rounded-sm text-slate-400 hover:text-brand-300 hover:bg-brand-500/10 transition-colors"
                          title="Edit Service"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(srv)}
                          className="p-1.5 rounded-sm text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Service"
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

      {/* Create / Edit Service Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <Modal
          isOpen={isCreateModalOpen || isEditModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
          }}
          title={isCreateModalOpen ? 'Register University Service' : 'Modify Service Profile'}
          maxWidth="lg"
        >
          <form onSubmit={isCreateModalOpen ? handleSaveCreate : handleSaveEdit} className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-400">Service Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Center for Psychological Counseling"
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
                  placeholder="Scope of service, intake procedures, and eligibility..."
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
                <label className="text-slate-400">Confidentiality Tier</label>
                <input
                  type="text"
                  value={formData.confidentiality_tier}
                  onChange={(e) => setFormData({ ...formData, confidentiality_tier: e.target.value })}
                  placeholder="e.g. Strict HIPAA / FERPA"
                  className="w-full bg-void-surface border border-border-default rounded-sm px-3 py-2 text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Contact Email</label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full bg-void-surface border border-border-default rounded-sm px-3 py-2 text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Operating Hours</label>
                <input
                  type="text"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  placeholder="e.g. Mon-Fri: 09:00 - 17:00"
                  className="w-full bg-void-surface border border-border-default rounded-sm px-3 py-2 text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-400">Physical Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Student Health Enclave Suite 104"
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

              <div className="sm:col-span-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="accent-brand-500 h-4 w-4"
                  />
                  <span>Active & Ready for Student Inquiries</span>
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
                {actionInProgress ? 'Saving...' : isCreateModalOpen ? 'Register Service' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {selectedService && isDeleteModalOpen && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete University Service"
          maxWidth="sm"
        >
          <div className="space-y-4 font-mono text-xs">
            <p className="text-slate-400">
              Are you sure you want to permanently delete{' '}
              <span className="text-slate-200 font-semibold">{selectedService.name}</span>?
              This service will immediately be purged from student search and recommendations.
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
                {actionInProgress ? 'Deleting...' : 'Delete Service'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
