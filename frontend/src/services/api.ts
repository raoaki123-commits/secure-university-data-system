export type UserRole = 'student' | 'faculty' | 'staff' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  department?: string;
  created_at?: string;
  last_login?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthResponse {
  status: number;
  message: string;
  user: User;
  tokens: AuthTokens;
}

export interface ApiErrorResponse {
  status: number;
  error?: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirm_password?: string;
  role: UserRole;
  admin_provision_key?: string;
  department?: string;
}

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'sovereign_access_token',
  REFRESH_TOKEN: 'sovereign_refresh_token',
  USER: 'sovereign_user',
};

class ApiService {
  private baseUrl: string = '/api/v1';

  public getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  public getStoredUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  public saveSession(user: User, tokens: AuthTokens): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  public clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth: boolean = true
  ): Promise<{ data?: T; error?: string; status: number; raw?: any }> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (requiresAuth) {
      const token = this.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const json = await response.json().catch(() => null);

      // Handle 401 Unauthorized token refresh attempt
      if (response.status === 401 && requiresAuth && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login')) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry original request once with fresh token
          const retryHeaders = {
            ...headers,
            'Authorization': `Bearer ${this.getAccessToken()}`,
          };
          const retryRes = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: retryHeaders,
          });
          const retryJson = await retryRes.json().catch(() => null);
          if (retryRes.ok) {
            return { data: retryJson as T, status: retryRes.status, raw: retryJson };
          }
        }
      }

      if (!response.ok) {
        const errorMsg = json?.message || json?.error || `HTTP ${response.status} Request Failed`;
        return { error: errorMsg, status: response.status, raw: json };
      }

      return { data: json as T, status: response.status, raw: json };
    } catch (err: any) {
      return {
        error: err.message || 'Network error connecting to backend service.',
        status: 0,
      };
    }
  }

  public async register(payload: RegisterPayload): Promise<{ data?: AuthResponse; error?: string; status: number }> {
    const headers: Record<string, string> = {};
    if (payload.admin_provision_key) {
      headers['X-Admin-Provision-Key'] = payload.admin_provision_key;
    }

    const res = await this.request<AuthResponse>(
      '/auth/register',
      {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      },
      false
    );

    if (res.data && res.data.tokens && res.data.user) {
      this.saveSession(res.data.user, res.data.tokens);
    }

    return res;
  }

  public async login(email: string, password: string): Promise<{ data?: AuthResponse; error?: string; status: number }> {
    const res = await this.request<AuthResponse>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      false
    );

    if (res.data && res.data.tokens && res.data.user) {
      this.saveSession(res.data.user, res.data.tokens);
    }

    return res;
  }

  public async refreshToken(): Promise<boolean> {
    const currentRefreshToken = this.getRefreshToken();
    if (!currentRefreshToken) {
      this.clearSession();
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: currentRefreshToken }),
      });

      if (!response.ok) {
        this.clearSession();
        return false;
      }

      const json = await response.json();
      if (json.access_token) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, json.access_token);
        return true;
      }
      return false;
    } catch {
      this.clearSession();
      return false;
    }
  }

  public async getCurrentUser(): Promise<User | null> {
    const res = await this.request<{ user: User }>('/auth/me', { method: 'GET' }, true);
    if (res.data?.user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.data.user));
      return res.data.user;
    }
    return null;
  }

  public async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' }, true);
    } finally {
      this.clearSession();
    }
  }

  public async probePortal(portalRole: string): Promise<{ status: number; data?: any; error?: string }> {
    const res = await this.request<any>(`/portal/${portalRole}`, { method: 'GET' }, true);
    return {
      status: res.status,
      data: res.data || res.raw,
      error: res.error,
    };
  }
}

export const apiService = new ApiService();

