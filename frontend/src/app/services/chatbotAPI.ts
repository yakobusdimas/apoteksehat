/**
 * Service for communicating with Flask Chatbot API
 */

import type { ChatAPIResponse, HealthCheckResponse, MedicineFromAPI } from '../types/chatbot';
import type { Medicine } from '../data/medicines';
import { mapMedicinesFromAPI, mapMedicineFromAPI } from '../utils/medicineMapper';

// Empty string = use Vite proxy which forwards /api/* to backend:5000 in Docker
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_TIMEOUT = 10000; // 10 seconds

/**
 * Send message to chatbot and get AI response
 */
export async function sendChatMessage(message: string, contextMedicines?: Medicine[], allergies?: string[], history?: { role: string, content: string }[]): Promise<{
  response: string;
  intent: string;
  confidence: number;
  medicines?: Medicine[];
  allergyWarnings?: any[];
  apiError?: boolean;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const token = localStorage.getItem('apotek_jwt_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, allergies: allergies || [], history: history || [] }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data: ChatAPIResponse = await response.json();

    if (data.status === 'error') {
      throw new Error(data.message || 'API returned error status');
    }

    // Map medicines if present
    let mappedMedicines: Medicine[] | undefined;
    if (data.data) {
      if (Array.isArray(data.data)) {
        mappedMedicines = mapMedicinesFromAPI(data.data as MedicineFromAPI[], contextMedicines);
      } else {
        mappedMedicines = [mapMedicineFromAPI(data.data as MedicineFromAPI, contextMedicines)];
      }
    }

    return {
      response: data.response,
      intent: data.intent,
      confidence: data.confidence,
      medicines: mappedMedicines,
      allergyWarnings: data.allergyWarnings || undefined,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Koneksi timeout. Pastikan server API berjalan.');
      }
      throw new Error(`Gagal terhubung ke server: ${error.message}`);
    }
    throw new Error('Terjadi kesalahan yang tidak diketahui');
  }
}

/**
 * Check if API server is healthy and model is loaded
 */
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const token = localStorage.getItem('apotek_jwt_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return false;

    const data: HealthCheckResponse = await response.json();
    // Backend returns { status: 'ok' } — model_loaded is optional
    return data.status === 'ok';
  } catch {
    return false;
  }
}

/**
 * Get all medicines from API
 */
export async function getAllMedicinesFromAPI(): Promise<Medicine[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/medicines`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch medicines');
    }

    const data = await response.json();
    
    if (data.status === 'success' && Array.isArray(data.medicines)) {
      return mapMedicinesFromAPI(data.medicines);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching medicines from API:', error);
    return [];
  }
}
