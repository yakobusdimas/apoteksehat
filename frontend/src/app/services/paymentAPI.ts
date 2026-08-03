/**
 * Payment Service API — integrates with payment-server for Midtrans Snap
 */

import { api } from './api';

export interface CreatePaymentPayload {
  orderId: string;
  items: Array<{
    id: number | string;
    name: string;
    price: number;
    quantity: number;
    photo?: string;
  }>;
  total: number;
  customer: {
    name: string;
    phone: string;
    address: string;
    city?: string;
    postalCode?: string;
  };
  courier?: {
    name: string;
    service: string;
    price: number;
  };
}

export interface CreatePaymentResponse {
  success: boolean;
  snapToken?: string;
  redirectUrl?: string;
  message?: string;
}

/**
 * Create payment via Midtrans Snap
 */
export async function createPayment(payload: CreatePaymentPayload): Promise<CreatePaymentResponse> {
  try {
    const baseUrl = window.location.origin;
    const response = await fetch(`${baseUrl}/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || 'Gagal membuat pembayaran' };
    }

    return data as CreatePaymentResponse;
  } catch (error) {
    console.error('Payment API error:', error);
    return { success: false, message: 'Tidak bisa terhubung ke payment server' };
  }
}

const paymentAPI = {
  create: createPayment,
};

export default paymentAPI;
