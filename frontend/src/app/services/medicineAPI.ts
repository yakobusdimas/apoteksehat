/**
 * Medicine API service — list, search, detail from backend.
 */

import api from './api';

export interface Medicine {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  indication: string;
  dosage: string;
  ingredients: string;
  benefits: string;
  sideEffects: string;
  expiry: string;
  type: string;
  photo: string;
}

export interface MedicineListParams {
  category?: string;
  q?: string;
  page?: number;
  per_page?: number;
}

export interface MedicineListResponse {
  medicines: Medicine[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
  error?: string;
}

export const medicineAPI = {
  /**
   * List medicines with optional filters and pagination.
   */
  async list(params?: MedicineListParams): Promise<MedicineListResponse> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.q) query.set('q', params.q);
    if (params?.page) query.set('page', String(params.page));
    if (params?.per_page) query.set('per_page', String(params.per_page));

    const qs = query.toString();
    const endpoint = `/api/medicines${qs ? `?${qs}` : ''}`;

    const { data, error } = await api.get<{
      status: string;
      medicines: Medicine[];
      total: number;
      page: number;
      per_page: number;
      pages: number;
    }>(endpoint);
    if (error) {
      return { medicines: [], total: 0, page: params?.page || 1, per_page: params?.per_page || 40, pages: 0, error };
    }
    return {
      medicines: data!.medicines,
      total: data!.total,
      page: data!.page,
      per_page: data!.per_page,
      pages: data!.pages,
    };
  },

  /**
   * Search medicines
   */
  async search(q: string): Promise<{ medicines: Medicine[]; error?: string }> {
    const { data, error } = await api.get<{ status: string; medicines: Medicine[] }>(
      `/api/medicines/search?q=${encodeURIComponent(q)}`
    );
    if (error) return { medicines: [], error };
    return { medicines: data!.medicines };
  },

  /**
   * Get single medicine detail
   */
  async getById(id: number): Promise<{ medicine?: Medicine; error?: string }> {
    const { data, error } = await api.get<{ status: string; medicine: Medicine }>(`/api/medicines/${id}`);
    if (error) return { error };
    return { medicine: data!.medicine };
  },

  /**
   * Get all categories
   */
  async categories(): Promise<{ categories: string[]; error?: string }> {
    const { data, error } = await api.get<{ status: string; categories: string[] }>('/api/medicines/categories');
    if (error) return { categories: [], error };
    return { categories: data!.categories };
  },
};

export default medicineAPI;
