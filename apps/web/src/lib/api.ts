const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface ApiConfig {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: object;
  headers?: Record<string, string>;
  requireAuth?: boolean;
}

interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

export interface Report {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  detail: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  reporter: {
    id: string;
    fullName: string;
    email: string;
  };
  targetUser: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  resolution: {
    resolvedAt: string | null;
    resolvedById: string | null;
    resolutionNote: string | null;
    resolutionAction: string | null;
  };
}

class ApiClient {
  private baseUrl: string;
  private _refreshCallback: (() => Promise<boolean>) | null = null;
  private _refreshPromise: Promise<boolean> | null = null;

  constructor() {
    this.baseUrl = API_URL;
  }

  setRefreshCallback(fn: () => Promise<boolean>) {
    this._refreshCallback = fn;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      const error: ApiError = {
        statusCode: response.status,
        message: data?.message || "An error occurred",
        error: data?.error || "Error",
      };
      throw error;
    }

    return data as T;
  }

  async request<T>(endpoint: string, config: ApiConfig = {}): Promise<T> {
    const { method = "GET", body, headers = {}, requireAuth = true } = config;

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (requireAuth) {
      const token = this.getToken();
      if (token) {
        requestHeaders["Authorization"] = `Bearer ${token}`;
      }
    }

    const requestInit: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body) {
      requestInit.body = JSON.stringify(body);
    }

    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, requestInit);

    // Auto-refresh on 401
    if (response.status === 401 && requireAuth && this._refreshCallback) {
      if (!this._refreshPromise) {
        this._refreshPromise = this._refreshCallback();
      }

      let refreshed = false;
      try {
        refreshed = await this._refreshPromise;
      } catch {
        return this.handleResponse<T>(response);
      } finally {
        this._refreshPromise = null;
      }

      if (refreshed) {
        const newToken = this.getToken();
        if (newToken) {
          requestHeaders["Authorization"] = `Bearer ${newToken}`;
        }
        const retryResponse = await fetch(url, {
          ...requestInit,
          headers: requestHeaders,
        });
        return this.handleResponse<T>(retryResponse);
      }
    }

    return this.handleResponse<T>(response);
  }

  // --- Auth Endpoints ---
  async login(email: string, password: string) {
    return this.request<{
      accessToken: string;
      refreshToken: string;
      user: {
        id: string;
        email: string;
        role: string;
      };
    }>("/auth/login", {
      method: "POST",
      body: { email, password },
      requireAuth: false,
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request<{
      accessToken: string;
      refreshToken: string;
    }>("/auth/refresh", {
      method: "POST",
      body: { refreshToken },
      requireAuth: false,
    });
  }

  // --- Dashboard Endpoints ---
  async getDashboardKpis() {
    return this.request<{
      totalUsers: number;
      activeGuides: number;
      totalBookings: number;
      totalRevenue: number;
    }>("/admin/dashboard/kpis");
  }

  async getDashboardCharts() {
    return this.request<{
      bookingsOverTime: { name: string; value: number }[];
      revenueOverTime: { name: string; value: number }[];
      userGuideRatio: { name: string; value: number }[];
    }>("/admin/dashboard/charts");
  }

  // --- Guides Endpoints ---
  async getPendingGuides() {
    return this.request<{ items: any[]; total: number }>("/guides/admin/pending");
  }

  async approveGuide(id: string, note?: string) {
    return this.request<{ message: string }>(`/guides/${id}/approve`, {
      method: "PATCH",
      body: { notes: note },
    });
  }

  async rejectGuide(id: string, reason: string) {
    return this.request<{ message: string }>(`/guides/${id}/reject`, {
      method: "PATCH",
      body: { reason, notes: "" },
    });
  }

  // --- Reports Endpoints ---
  async getReports() {
    return this.request<{
      items: Report[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>("/reports");
  }

  async resolveReport(id: string, resolutionDetails: string) {
    return this.request<{ message: string }>(`/reports/${id}/resolve`, {
      method: "PATCH",
      body: { resolutionDetails },
    });
  }

  async dismissReport(id: string, reason: string) {
    return this.request<{ message: string }>(`/reports/${id}/dismiss`, {
      method: "PATCH",
      body: { reason },
    });
  }
}

export const apiClient = new ApiClient();
