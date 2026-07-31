import * as SecureStore from "expo-secure-store";

import { RegisterData } from "@/types";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://sathi-guide.onrender.com";

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

class ApiClient {
  private baseUrl: string;
  private _refreshCallback: (() => Promise<boolean>) | null = null;
  private _refreshPromise: Promise<boolean> | null = null;

  /** Register a callback that the ApiClient can call to refresh the token. */
  setRefreshCallback(fn: () => Promise<boolean>) {
    this._refreshCallback = fn;
  }

  constructor() {
    this.baseUrl = `${API_URL}/api/v1`;
  }

  private async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync("accessToken");
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        statusCode: response.status,
        message: data.message || "An error occurred",
        error: data.error || "Error",
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
      const token = await this.getToken();
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

    // Auto-refresh on 401 and retry once
    if (response.status === 401 && requireAuth && this._refreshCallback) {
      if (!this._refreshPromise) {
        this._refreshPromise = this._refreshCallback();
      }

      let refreshed = false;
      try {
        refreshed = await this._refreshPromise;
      } catch {
        // Fall back to returning the 401 response if refresh throws
        return this.handleResponse<T>(response);
      } finally {
        this._refreshPromise = null;
      }

      if (refreshed) {
        // Retry with the new token
        const newToken = await this.getToken();
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

  // Auth endpoints
  async login(
    email: string,
    password: string,
    deviceInfo?: Record<string, unknown>,
  ) {
    return this.request<{
      accessToken: string;
      refreshToken: string;
      user: {
        id: string;
        email: string;
        phone: string | null;
        role: string;
        isEmailVerified: boolean;
        isPhoneVerified: boolean;
        avatarId: string | null;
        createdAt: string;
        lastLoginAt: string | null;
      };
    }>("/auth/login", {
      method: "POST",
      body: { email, password, deviceInfo },
      requireAuth: false,
    });
  }

  async register(data: RegisterData) {
    return this.request<{ message: string }>("/auth/register", {
      method: "POST",
      body: data,
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

  async logout(refreshToken: string) {
    return this.request<{ message: string }>("/auth/logout", {
      method: "POST",
      body: { refreshToken },
      requireAuth: false,
    });
  }

  async getMe() {
    return this.request<{
      id: string;
      email: string;
      phone: string | null;
      role: string;
      isEmailVerified: boolean;
      isPhoneVerified: boolean;
      avatarId: string | null;
      createdAt: string;
      lastLoginAt: string | null;
    }>("/auth/me", {
      // requireAuth defaults to true, so Authorization header is auto-added
    });
  }

  async forgotPassword(email: string) {
    return this.request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: { email },
      requireAuth: false,
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: { token, newPassword },
      requireAuth: false,
    });
  }

  async verifyEmail(token: string) {
    return this.request<{ message: string }>("/auth/verify-email", {
      method: "POST",
      body: { token },
      requireAuth: false,
    });
  }

  async resendVerificationEmail(email: string) {
    return this.request<{ message: string }>("/auth/resend-verification", {
      method: "POST",
      body: { email },
      requireAuth: false,
    });
  }

  // --- Experiences ---
  async getExperiences(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return this.request<
      import("@/types/api").PaginatedResponse<
        import("@/types/api").ExperienceListItem
      >
    >(`/experiences${query}`, { requireAuth: false });
  }

  async getExperience(id: string) {
    return this.request<import("@/types/api").ExperienceDetail>(
      `/experiences/${id}`,
      {
        requireAuth: false,
      },
    );
  }

  async getMyExperiences(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return this.request<
      import("@/types/api").PaginatedResponse<
        import("@/types/api").MyExperienceListItem
      >
    >(`/experiences/my/list${query}`);
  }

  async createExperience(data: import("@/types/api").CreateExperienceDto) {
    return this.request<import("@/types/api").ExperienceDetail>(
      "/experiences",
      {
        method: "POST",
        body: data,
      },
    );
  }

  async updateExperience(
    id: string,
    data: import("@/types/api").UpdateExperienceDto,
  ) {
    return this.request<import("@/types/api").ExperienceDetail>(
      `/experiences/${id}`,
      {
        method: "PATCH",
        body: data,
      },
    );
  }

  async deleteExperience(id: string) {
    return this.request<{ message: string }>(`/experiences/${id}`, {
      method: "DELETE",
    });
  }

  // --- Guides ---
  async getGuides(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return this.request<
      import("@/types/api").PaginatedResponse<
        import("@/types/api").GuideListItem
      >
    >(`/guides${query}`, { requireAuth: false });
  }

  async getGuide(id: string) {
    return this.request<import("@/types/api").GuideDetail>(`/guides/${id}`, {
      requireAuth: false,
    });
  }

  async getMyGuideProfile() {
    return this.request<import("@/types/api").GuideDetail>(
      "/guides/me/profile",
    );
  }

  async updateGuideProfile(data: any) {
    return this.request<import("@/types/api").GuideDetail>("/guides/profile", {
      method: "PATCH",
      body: data,
    });
  }

  // --- Bookings ---
  async createBooking(data: import("@/types/api").CreateBookingDto) {
    return this.request<import("@/types/api").BookingResponse>("/bookings", {
      method: "POST",
      body: data,
    });
  }

  async getMyBookings(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return this.request<
      import("@/types/api").PaginatedResponse<
        import("@/types/api").BookingResponse
      >
    >(`/bookings/my${query}`);
  }

  async getBooking(id: string) {
    return this.request<import("@/types/api").BookingResponse>(
      `/bookings/${id}`,
    );
  }

  async cancelBooking(id: string, data: { reason: string }) {
    return this.request<{ message: string }>(`/bookings/${id}/cancel`, {
      method: "PATCH",
      body: data,
    });
  }

  async getBookingRequests(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return this.request<
      import("@/types/api").PaginatedResponse<
        import("@/types/api").BookingResponse
      >
    >(`/bookings/requests${query}`);
  }

  async getUpcomingBookings(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return this.request<
      import("@/types/api").PaginatedResponse<
        import("@/types/api").BookingResponse
      >
    >(`/bookings/upcoming${query}`);
  }

  async getBookingHistory(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return this.request<
      import("@/types/api").PaginatedResponse<
        import("@/types/api").BookingResponse
      >
    >(`/bookings/history${query}`);
  }

  async acceptBooking(id: string, data?: { note?: string }) {
    return this.request<{ message: string }>(`/bookings/${id}/accept`, {
      method: "PATCH",
      body: data || {},
    });
  }

  async rejectBooking(
    id: string,
    data: { reasonCode: string; reason?: string },
  ) {
    return this.request<{ message: string }>(`/bookings/${id}/reject`, {
      method: "PATCH",
      body: data,
    });
  }

  // --- Categories ---
  async getCategories() {
    return this.request<import("@/types/api").ExperienceCategoryApi[]>(
      "/experiences/categories",
      { requireAuth: false },
    );
  }

  // --- Uploads ---
  async requestPresignedUrl(body: {
    purpose: "experience" | "avatar" | "document";
    mimeType: string;
    filename: string;
    experienceId?: string;
  }): Promise<{ uploadUrl: string; key: string; token: string }> {
    return this.request("/uploads/presign", { method: "POST", body });
  }

  async confirmUpload(body: {
    key: string;
    mimeType: string;
    purpose: "experience" | "avatar" | "document";
  }): Promise<{ id: string; key: string; url: string }> {
    return this.request("/uploads/confirm", { method: "POST", body });
  }

  async deleteMedia(mediaId: string): Promise<void> {
    return this.request(`/uploads/${mediaId}`, { method: "DELETE" });
  }

  // --- Experience Draft Flow ---
  async createDraftExperience(body: {
    title: string;
    categoryId: string;
    shortDescription: string;
    description: string;
  }): Promise<{ id: string; status: string }> {
    return this.request("/experiences/draft", { method: "POST", body });
  }

  async updateExperienceLocation(
    id: string,
    body: { location: object; meetingLocation?: object },
  ): Promise<object> {
    return this.request(`/experiences/${id}/location`, {
      method: "PATCH",
      body,
    });
  }

  async updateExperiencePricing(
    id: string,
    body: { pricingRules: object[]; basePrice?: number; currency?: string },
  ): Promise<object> {
    return this.request(`/experiences/${id}/pricing`, {
      method: "PATCH",
      body,
    });
  }

  async addExperienceImage(
    experienceId: string,
    body: { mediaId: string; displayOrder?: number },
  ): Promise<{ id: string; mediaId: string; displayOrder: number }> {
    return this.request(`/experiences/${experienceId}/images`, {
      method: "POST",
      body,
    });
  }

  async removeExperienceImage(
    experienceId: string,
    imageId: string,
  ): Promise<void> {
    return this.request(`/experiences/${experienceId}/images/${imageId}`, {
      method: "DELETE",
    });
  }

  async publishExperience(id: string): Promise<object> {
    return this.request(`/experiences/${id}/publish`, { method: "PATCH", body: {} });
  }
}

export const apiClient = new ApiClient();
