import { apiService } from './api';

export interface AcademicResource {
  id: string;
  title: string;
  description: string;
  category: string;
  department: string;
  author_or_source: string;
  tags: string[];
  format: string;
  access_level: string;
  rating: number;
  saves_count: number;
  url: string;
  created_at: string;
}

export interface UniversityEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  department_or_host: string;
  date: string;
  time: string;
  location: string;
  is_virtual: boolean;
  registration_required: boolean;
  registration_deadline: string;
  tags: string[];
  attendees_count: number;
}

export interface UniversityService {
  id: string;
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

export interface RecommendationItem {
  item_id: string;
  item_type: 'resource' | 'event' | 'service';
  title: string;
  category: string;
  department: string;
  format?: string;
  score: number;
  explanation: string;
  source?: string;
  url?: string;
  date?: string;
  location?: string;
  contact_email?: string;
}

export interface RecommendationMetadata {
  engine: string;
  is_baseline: boolean;
  ml_framework: string;
  student_department: string;
  description: string;
}

export interface BookmarkItem {
  id: string;
  user_id: string;
  item_id: string;
  item_type: 'resource' | 'event' | 'service';
  title: string;
  category: string;
  department?: string;
  saved_at: string;
  metadata?: any;
}

export interface RecommendationHistoryItem {
  id: string;
  item_id: string;
  item_type: 'resource' | 'event' | 'service';
  title: string;
  category: string;
  feedback: 'useful' | 'not_relevant' | 'saved';
  timestamp: string;
}

export interface PrivacyPreferences {
  id?: string;
  user_id?: string;
  share_department_with_recommender: boolean;
  collect_interaction_history: boolean;
  homomorphic_noise_scale: number;
  differential_privacy_epsilon: number;
  zero_knowledge_audit_logging: boolean;
  anonymize_bookmarks: boolean;
  last_consent_at?: string;
  updated_at?: string;
}

class StudentApiService {
  private baseUrl: string = '/api/v1';

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<{ data?: T; error?: string; status: number }> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const token = apiService.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const json = await res.json().catch(() => null);

      if (res.status === 401) {
        const refreshed = await apiService.refreshToken();
        if (refreshed) {
          headers['Authorization'] = `Bearer ${apiService.getAccessToken()}`;
          const retryRes = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
          });
          const retryJson = await retryRes.json().catch(() => null);
          if (retryRes.ok) {
            return { data: retryJson as T, status: retryRes.status };
          }
        }
      }

      if (!res.ok) {
        return {
          error: json?.message || json?.error || `Request failed with status ${res.status}`,
          status: res.status,
        };
      }

      return { data: json as T, status: res.status };
    } catch (err: any) {
      return {
        error: err.message || 'Network error communicating with university server.',
        status: 0,
      };
    }
  }

  // --- Resources ---
  public async getResources(params: { category?: string; department?: string; search?: string; sort?: string } = {}) {
    const searchParams = new URLSearchParams();
    if (params.category && params.category !== 'all') searchParams.set('category', params.category);
    if (params.department && params.department !== 'all') searchParams.set('department', params.department);
    if (params.search) searchParams.set('search', params.search);
    if (params.sort) searchParams.set('sort', params.sort);

    const query = searchParams.toString();
    const endpoint = `/resources${query ? `?${query}` : ''}`;
    return this.request<{ status: number; total: number; count: number; resources: AcademicResource[] }>(endpoint);
  }

  public async getResource(id: string) {
    return this.request<{ status: number; resource: AcademicResource }>(`/resources/${id}`);
  }

  // --- Events ---
  public async getEvents(params: { category?: string; search?: string; virtual_only?: boolean } = {}) {
    const searchParams = new URLSearchParams();
    if (params.category && params.category !== 'all') searchParams.set('category', params.category);
    if (params.search) searchParams.set('search', params.search);
    if (params.virtual_only) searchParams.set('virtual_only', 'true');

    const query = searchParams.toString();
    const endpoint = `/events${query ? `?${query}` : ''}`;
    return this.request<{ status: number; count: number; events: UniversityEvent[] }>(endpoint);
  }

  // --- Services ---
  public async getServices(params: { category?: string; search?: string } = {}) {
    const searchParams = new URLSearchParams();
    if (params.category && params.category !== 'all') searchParams.set('category', params.category);
    if (params.search) searchParams.set('search', params.search);

    const query = searchParams.toString();
    const endpoint = `/services${query ? `?${query}` : ''}`;
    return this.request<{ status: number; count: number; services: UniversityService[] }>(endpoint);
  }

  // --- Bookmarks ---
  public async getBookmarks() {
    return this.request<{ status: number; count: number; bookmarks: BookmarkItem[] }>('/bookmarks');
  }

  public async toggleBookmark(itemId: string, itemType: 'resource' | 'event' | 'service', snapshot?: any) {
    return this.request<{ status: number; action: 'added' | 'removed'; is_bookmarked: boolean; message: string }>(
      '/bookmarks',
      {
        method: 'POST',
        body: JSON.stringify({ item_id: itemId, item_type: itemType, item_snapshot: snapshot }),
      }
    );
  }

  public async deleteBookmark(itemId: string) {
    return this.request<{ status: number; message: string }>(`/bookmarks/${itemId}`, { method: 'DELETE' });
  }

  // --- Recommendations ---
  public async getRecommendations() {
    return this.request<{
      status: number;
      recommender_metadata: RecommendationMetadata;
      count: number;
      recommendations: RecommendationItem[];
    }>('/recommendations/student');
  }

  public async submitFeedback(itemId: string, itemType: string, feedback: 'useful' | 'not_relevant' | 'saved', title?: string, category?: string) {
    return this.request<{ status: number; message: string }>('/recommendations/feedback', {
      method: 'POST',
      body: JSON.stringify({
        item_id: itemId,
        item_type: itemType,
        feedback,
        title,
        category,
      }),
    });
  }

  public async getRecommendationHistory() {
    return this.request<{ status: number; count: number; history: RecommendationHistoryItem[] }>('/recommendations/history');
  }

  // --- Privacy Preferences ---
  public async getPrivacyPreferences() {
    return this.request<{ status: number; preferences: PrivacyPreferences }>('/privacy/preferences');
  }

  public async updatePrivacyPreferences(prefs: Partial<PrivacyPreferences>) {
    return this.request<{ status: number; message: string; preferences: PrivacyPreferences }>('/privacy/preferences', {
      method: 'PUT',
      body: JSON.stringify(prefs),
    });
  }

  // --- Profile & Password ---
  public async updateProfile(data: { name?: string; department?: string }) {
    return this.request<{ status: number; message: string; user: any }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async changePassword(currentPassword: string, newPassword: string) {
    return this.request<{ status: number; message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
  }
}

export const studentApi = new StudentApiService();

