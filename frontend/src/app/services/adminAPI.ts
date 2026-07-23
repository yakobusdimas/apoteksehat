/**
 * Admin API service — stats, users, orders, medicines management.
 */

import api from './api';

export interface AdminStats {
  totalUsers: number;
  totalMedicines: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  lowStockMedicines: number;
}

export const adminAPI = {
  /**
   * Get dashboard statistics
   */
  async stats(): Promise<{ stats?: AdminStats; error?: string }> {
    const { data, error } = await api.get<{ status: string; stats: AdminStats }>('/api/admin/stats');
    if (error) return { error };
    return { stats: data!.stats };
  },

  /**
   * List all users
   */
  async users(): Promise<{ users: any[]; error?: string }> {
    const { data, error } = await api.get<{ status: string; users: any[] }>('/api/admin/users');
    if (error) return { users: [], error };
    return { users: data!.users };
  },

  /**
   * Delete a user
   */
  async deleteUser(userId: string): Promise<{ error?: string }> {
    const { error } = await api.delete(`/api/admin/users/${userId}`);
    if (error) return { error };
    return {};
  },

  /**
   * List all orders (admin view)
   */
  async orders(status?: string): Promise<{ orders: any[]; error?: string }> {
    const endpoint = status ? `/api/admin/orders?status=${status}` : '/api/admin/orders';
    const { data, error } = await api.get<{ status: string; orders: any[] }>(endpoint);
    if (error) return { orders: [], error };
    return { orders: data!.orders };
  },

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: number, status: string): Promise<{ order?: any; error?: string }> {
    const { data, error } = await api.put<{ status: string; order: any; message: string }>(
      `/api/admin/orders/${orderId}/status`, { status }
    );
    if (error) return { error };
    return { order: data!.order };
  },

  /**
   * Add medicine
   */
  async addMedicine(medicine: any): Promise<{ medicine?: any; error?: string }> {
    const { data, error } = await api.post<{ status: string; medicine: any }>('/api/admin/medicines', medicine);
    if (error) return { error };
    return { medicine: data!.medicine };
  },

  /**
   * Update medicine
   */
  async updateMedicine(medicineId: number, updates: any): Promise<{ medicine?: any; error?: string }> {
    const { data, error } = await api.put<{ status: string; medicine: any }>(
      `/api/admin/medicines/${medicineId}`, updates
    );
    if (error) return { error };
    return { medicine: data!.medicine };
  },

  /**
   * Delete medicine
   */
  async deleteMedicine(medicineId: number): Promise<{ error?: string }> {
    const { error } = await api.delete(`/api/admin/medicines/${medicineId}`);
    if (error) return { error };
    return {};
  },
};

export default adminAPI;
