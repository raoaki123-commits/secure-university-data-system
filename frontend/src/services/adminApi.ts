import { apiService } from './api';
import type { AcademicResource, UniversityEvent, UniversityService } from './studentApi';

export interface AdminStats {
  users: {
    total: number;
    students: number;
    faculty: number;
    staff: number;
    admins: number;
    active: number;
    suspended: number;
  };
  resources: {
    total: number;
    pending_approval: number;
  };
  events: {
    total: number;
    pending_approval: number;
  };
  services: {
    total: number;
    active: number;
  };
  recommendations: {
    total_feedback_events: number;
  };
  pending_approval_total: number;
  recent_activities: AuditLogItem[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'staff' | 'admin';
  account_status: 'active' | 'suspended';
  department?: string;
  created_at?: string;
  last_login?: string;
  token_version?: number;
}

export interface AuditLogItem {
  id: string;
  action: string;
  admin_id: string;
  admin_email: string;
  target_id?: string;
  target_type?: string;
  details?: Record<string, any>;
  ip_address?: string;
  timestamp: string;
}

export interface SecurityStatusData {
  authentication: {
    algorithm: string;
    parameters: {
      memory_cost: string;
      time_cost: number;
      parallelism: number;
      salt_length: string;
    };
    status: string;
  };
  session_tokens: {
    type: string;
    access_expiry: string;
    refresh_expiry: string;
    rotation_enforcement: string;
    status: string;
  };
  homomorphic_encryption: {
    active_scheme: string;
    target_scheme: string;
    polynomial_ring_modulus: string;
    zero_cleartext_guarantee: boolean;
    status: string;
  };
  multi_party_computation: {
    architecture: string;
    mpc_nodes_online: number;
    mpc_protocol: string;
    status: string;
  };
  access_control: {
    rbac_enforced_backend: boolean;
    roles_registered: string[];
    admin_provision_safeguard: string;
  };
  recent_security_events: AuditLogItem[];
}

export interface RecommendationMonitoringData {
  total_feedback_events: number;
  feedback_counts: {
    useful: number;
    irrelevant: number;
    saved: number;
  };
  useful_ratio_percent: number;
  model_info: {
    active_version: string;
    target_framework: string;
    deployment_status: string;
    scoring_mechanism: string;
  };
  top_categories: Array<{ category: string; count: number }>;
}

export interface CreateResourcePayload {
  title: string;
  description: string;
  category: string;
  department: string;
  author_or_source: string;
  tags: string[];
  format: string;
  access_level: string;
  url: string;
  status?: 'approved' | 'pending_approval' | 'archived' | 'rejected';
}

export interface CreateEventPayload {
  title: string;
  description: string;
  category: string;
  department_or_host: string;
  date: string;
  time: string;
  location: string;
  is_virtual: boolean;
  registration_required: boolean;
  registration_deadline?: string;
  tags: string[];
  status?: 'approved' | 'pending_approval' | 'archived';
}

export interface CreateServicePayload {
  name: string;
  description: string;
  category: string;
  contact_email: string;
  location: string;
  hours: string;
  confidentiality_tier: string;
  is_active: boolean;
  tags: string[];
}

class AdminApiService {
  private baseUrl: string = '/api/v1';

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const token = apiService.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      const refreshed = await apiService.refreshToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${apiService.getAccessToken()}`;
        res = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers,
        });
      }
    }

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      const error: any = new Error(json?.message || json?.error || `Request failed with status ${res.status}`);
      error.response = { data: json, status: res.status };
      throw error;
    }

    return json as T;
  }

  /**
   * 1. Overview & Real Database Stats
   */
  async getStats(): Promise<{ status: number; stats: AdminStats }> {
    return this.request<{ status: number; stats: AdminStats }>('/admin/stats');
  }

  /**
   * 2. User Management
   */
  async getUsers(params?: {
    role?: string;
    status?: string;
    search?: string;
    limit?: number;
    skip?: number;
  }): Promise<{ status: number; total: number; limit: number; skip: number; users: AdminUser[] }> {
    const query = new URLSearchParams();
    if (params?.role && params.role !== 'all') query.set('role', params.role);
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.skip) query.set('skip', String(params.skip));

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ status: number; total: number; limit: number; skip: number; users: AdminUser[] }>(
      `/admin/users${queryString}`
    );
  }

  async getUser(userId: string): Promise<{ status: number; user: AdminUser }> {
    return this.request<{ status: number; user: AdminUser }>(`/admin/users/${userId}`);
  }

  async updateUserStatus(
    userId: string,
    status: 'active' | 'suspended'
  ): Promise<{ status: number; message: string; account_status: string }> {
    return this.request<{ status: number; message: string; account_status: string }>(
      `/admin/users/${userId}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({ account_status: status }),
      }
    );
  }

  async updateUserRole(
    userId: string,
    role: 'student' | 'faculty' | 'staff' | 'admin'
  ): Promise<{ status: number; message: string; role: string }> {
    return this.request<{ status: number; message: string; role: string }>(
      `/admin/users/${userId}/role`,
      {
        method: 'PUT',
        body: JSON.stringify({ role }),
      }
    );
  }

  /**
   * 3. Resource Management
   */
  async getResources(params?: {
    category?: string;
    status?: string;
    search?: string;
  }): Promise<{ status: number; count: number; resources: (AcademicResource & { status: string })[] }> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.search) query.set('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{
      status: number;
      count: number;
      resources: (AcademicResource & { status: string })[];
    }>(`/admin/resources${queryString}`);
  }

  async createResource(
    payload: CreateResourcePayload
  ): Promise<{ status: number; message: string; resource: any }> {
    return this.request<{ status: number; message: string; resource: any }>('/admin/resources', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateResource(
    resourceId: string,
    payload: Partial<CreateResourcePayload>
  ): Promise<{ status: number; message: string }> {
    return this.request<{ status: number; message: string }>(`/admin/resources/${resourceId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteResource(resourceId: string): Promise<{ status: number; message: string }> {
    return this.request<{ status: number; message: string }>(`/admin/resources/${resourceId}`, {
      method: 'DELETE',
    });
  }

  async updateResourceStatus(
    resourceId: string,
    status: 'approved' | 'pending_approval' | 'archived' | 'rejected'
  ): Promise<{ status: number; message: string; new_status: string }> {
    return this.request<{ status: number; message: string; new_status: string }>(
      `/admin/resources/${resourceId}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }
    );
  }

  /**
   * 4. Event Management
   */
  async getEvents(params?: {
    category?: string;
    search?: string;
  }): Promise<{ status: number; count: number; events: (UniversityEvent & { status: string })[] }> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    if (params?.search) query.set('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{
      status: number;
      count: number;
      events: (UniversityEvent & { status: string })[];
    }>(`/admin/events${queryString}`);
  }

  async createEvent(
    payload: CreateEventPayload
  ): Promise<{ status: number; message: string; event: any }> {
    return this.request<{ status: number; message: string; event: any }>('/admin/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateEvent(
    eventId: string,
    payload: Partial<CreateEventPayload>
  ): Promise<{ status: number; message: string }> {
    return this.request<{ status: number; message: string }>(`/admin/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteEvent(eventId: string): Promise<{ status: number; message: string }> {
    return this.request<{ status: number; message: string }>(`/admin/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  /**
   * 5. University Services Management
   */
  async getServices(): Promise<{ status: number; count: number; services: UniversityService[] }> {
    return this.request<{ status: number; count: number; services: UniversityService[] }>(
      '/admin/services'
    );
  }

  async createService(
    payload: CreateServicePayload
  ): Promise<{ status: number; message: string; service: any }> {
    return this.request<{ status: number; message: string; service: any }>('/admin/services', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateService(
    serviceId: string,
    payload: Partial<CreateServicePayload>
  ): Promise<{ status: number; message: string }> {
    return this.request<{ status: number; message: string }>(`/admin/services/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteService(serviceId: string): Promise<{ status: number; message: string }> {
    return this.request<{ status: number; message: string }>(`/admin/services/${serviceId}`, {
      method: 'DELETE',
    });
  }

  async updateServiceStatus(
    serviceId: string,
    isActive: boolean
  ): Promise<{ status: number; message: string; is_active: boolean }> {
    return this.request<{ status: number; message: string; is_active: boolean }>(
      `/admin/services/${serviceId}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({ is_active: isActive }),
      }
    );
  }

  /**
   * 6. Privacy & Security Control Centre
   */
  async getSecurityStatus(): Promise<{ status: number; security_status: SecurityStatusData }> {
    return this.request<{ status: number; security_status: SecurityStatusData }>(
      '/admin/security/status'
    );
  }

  /**
   * 7. Recommendation Monitoring
   */
  async getRecommendationMonitoring(): Promise<{
    status: number;
    monitoring: RecommendationMonitoringData;
  }> {
    return this.request<{
      status: number;
      monitoring: RecommendationMonitoringData;
    }>('/admin/recommendations/monitoring');
  }

  /**
   * 8. Audit Logs Query
   */
  async getAuditLogs(params?: {
    action?: string;
    admin_email?: string;
    target_type?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
    skip?: number;
  }): Promise<{ status: number; total: number; limit: number; skip: number; logs: AuditLogItem[] }> {
    const query = new URLSearchParams();
    if (params?.action) query.set('action', params.action);
    if (params?.admin_email) query.set('admin_email', params.admin_email);
    if (params?.target_type) query.set('target_type', params.target_type);
    if (params?.date_from) query.set('date_from', params.date_from);
    if (params?.date_to) query.set('date_to', params.date_to);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.skip) query.set('skip', String(params.skip));

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{
      status: number;
      total: number;
      limit: number;
      skip: number;
      logs: AuditLogItem[];
    }>(`/admin/audit-logs${queryString}`);
  }
}

export const adminApi = new AdminApiService();
