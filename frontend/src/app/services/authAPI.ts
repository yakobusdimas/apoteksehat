/**
 * Auth API service — login, register, profile management via backend.
 */

import api, { setToken, removeToken } from './api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  role: 'user' | 'admin';
  createdAt: string;
  totalOrders: number;
}

export interface AuthResponse {
  status: string;
  message: string;
  token: string;
  user: UserProfile;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export const authAPI = {
  /**
   * Register a new user
   */
  async register(payload: RegisterData): Promise<{ success: boolean; message?: string; token?: string; user?: UserProfile }> {
    const { data, error } = await api.post<AuthResponse>('/api/auth/register', payload);
    if (error) return { success: false, message: error };
    if (data?.token) setToken(data.token);
    if (data?.user) localStorage.setItem('apotek_user', JSON.stringify(data.user));
    return { success: true, token: data?.token, user: data?.user };
  },

  /**
   * Login user — returns JWT token
   */
  async login(email: string, password: string): Promise<{
    success: boolean; message?: string; token?: string; user?: UserProfile;
  }> {
    const { data, error } = await api.post<AuthResponse>('/api/auth/login', { email, password });
    if (error) return { success: false, message: error };
    if (data?.token) setToken(data.token);
    if (data?.user) localStorage.setItem('apotek_user', JSON.stringify(data.user));
    return { success: true, token: data?.token, user: data?.user };
  },

  /**
   * Login/Register with Google OAuth Token
   */
  async loginWithGoogle(token: string): Promise<{
    success: boolean; message?: string; token?: string; user?: UserProfile;
  }> {
    const { data, error } = await api.post<AuthResponse>('/api/auth/google', { token });
    if (error) return { success: false, message: error };
    if (data?.token) setToken(data.token);
    if (data?.user) localStorage.setItem('apotek_user', JSON.stringify(data.user));
    return { success: true, token: data?.token, user: data?.user };
  },

  /**
   * Get current user profile (validates token)
   */
  async getProfile(): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    const { data, error } = await api.get<{ status: string; user: UserProfile }>('/api/auth/me');
    if (error) return { success: false, message: error };
    if (data?.user) localStorage.setItem('apotek_user', JSON.stringify(data.user));
    return { success: true, user: data!.user };
  },

  /**
   * Update user profile
   */
  async updateProfile(profileData: Partial<UserProfile>): Promise<{
    success: boolean; user?: UserProfile; message?: string;
  }> {
    const { data, error } = await api.put<{ status: string; user: UserProfile; message: string }>(
      '/api/auth/profile', profileData
    );
    if (error) return { success: false, message: error };
    if (data?.user) localStorage.setItem('apotek_user', JSON.stringify(data.user));
    return { success: true, user: data!.user };
  },

  /**
   * Logout — remove token and cached user (client-side only)
   */
  logout() {
    removeToken();
    localStorage.removeItem('apotek_user');
  },

  /**
   * Get cached user profile from localStorage
   */
  getCachedUser(): UserProfile | null {
    try {
      const stored = localStorage.getItem('apotek_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  /**
   * Check if user has a stored token
   */
  hasToken(): boolean {
    return !!localStorage.getItem('apotek_jwt_token');
  },
};

export default authAPI;
