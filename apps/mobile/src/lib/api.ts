import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://sathi-guide.onrender.com/api/v1";

interface ApiConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: Record<string, unknown>;
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

  constructor() {
    this.baseUrl = `${API_URL}/api/v1`;
  }

  private async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('accessToken');
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        statusCode: response.status,
        message: data.message || 'An error occurred',
        error: data.error || 'Error',
      };
      throw error;
    }

    return data as T;
  }

  async request<T>(endpoint: string, config: ApiConfig = {}): Promise<T> {
    const {
      method = 'GET',
      body,
      headers = {},
      requireAuth = true,
    } = config;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (requireAuth) {
      const token = await this.getToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
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

    return this.handleResponse<T>(response);
  }

  // Auth endpoints
  async login(email: string, password: string, deviceInfo?: Record<string, unknown>) {
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
        avatarKey: string | null;
        createdAt: string;
        lastLoginAt: string | null;
      };
    }>('/auth/login', {
      method: 'POST',
      body: { email, password, deviceInfo },
      requireAuth: false,
    });
  }

  async register(data: Record<string, unknown>) {
    return this.request<{ message: string }>('/auth/register', {
      method: 'POST',
      body: data,
      requireAuth: false,
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request<{
      accessToken: string;
      refreshToken: string;
    }>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      requireAuth: false,
    });
  }

  async logout(refreshToken: string) {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
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
      avatarKey: string | null;
      createdAt: string;
      lastLoginAt: string | null;
    }>('/auth/me');
  }

  async forgotPassword(email: string) {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      requireAuth: false,
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: { token, newPassword },
      requireAuth: false,
    });
  }

  async verifyEmail(token: string) {
    return this.request<{ message: string }>('/auth/verify-email', {
      method: 'POST',
      body: { token },
      requireAuth: false,
    });
  }

  async resendVerificationEmail(email: string) {
    return this.request<{ message: string }>('/auth/resend-verification', {
      method: 'POST',
      body: { email },
      requireAuth: false,
    });
  }
}

export const apiClient = new ApiClient();
