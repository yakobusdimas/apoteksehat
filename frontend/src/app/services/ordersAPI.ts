/**
 * Orders API service — create, list, detail, cancel orders.
 */

import api from './api';

export interface OrderItemPayload {
  medicineId: number;
  name: string;
  quantity: number;
  price: number;
  photo?: string;
}

export interface OrderAddress {
  name: string;
  detail: string;
  phone: string;
}

export interface OrderCourier {
  name: string;
  service: string;
  price?: number;
}

export interface OrderResponse {
  id: number;
  orderId: string;
  userId: string;
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  courier: { name: string; service: string };
  address: { name: string; detail: string; phone: string };
  items: {
    id: number;
    medicineId: number;
    name: string;
    quantity: number;
    price: number;
    photo: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export const ordersAPI = {
  /**
   * Create a new order
   */
  async create(params: {
    items: OrderItemPayload[];
    address: OrderAddress;
    courier: OrderCourier;
  }): Promise<{ order?: OrderResponse; error?: string }> {
    const { data, error } = await api.post<{ status: string; order: OrderResponse }>(
      '/api/orders',
      {
        items: params.items,
        address: params.address,
        courier: params.courier,
      }
    );
    if (error) return { error };
    return { order: data!.order };
  },

  /**
   * List current user's orders (optionally filter by status)
   */
  async list(status?: string): Promise<{ orders: OrderResponse[]; error?: string }> {
    const endpoint = status ? `/api/orders?status=${status}` : '/api/orders';
    const { data, error } = await api.get<{ status: string; orders: OrderResponse[] }>(endpoint);
    if (error) return { orders: [], error };
    return { orders: data!.orders };
  },

  /**
   * Get single order by DB id
   */
  async getById(orderId: number): Promise<{ order?: OrderResponse; error?: string }> {
    const { data, error } = await api.get<{ status: string; order: OrderResponse }>(
      `/api/orders/${orderId}`
    );
    if (error) return { error };
    return { order: data!.order };
  },

  /**
   * Cancel an order (only if status is processing)
   */
  async cancel(orderId: number): Promise<{ order?: OrderResponse; error?: string }> {
    const { data, error } = await api.put<{ status: string; order: OrderResponse }>(
      `/api/orders/${orderId}/cancel`
    );
    if (error) return { error };
    return { order: data!.order };
  },
  /**
   * Get single order by public order code (e.g. APY-0706-XXXX)
   */
  async getByCode(orderCode: string): Promise<{ order?: OrderResponse; error?: string }> {
    const { data, error } = await api.get<{ status: string; order: OrderResponse }>(
      `/api/orders/by-code/${orderCode}`
    );
    if (error) return { error };
    return { order: data!.order };
  },
};

export default ordersAPI;
