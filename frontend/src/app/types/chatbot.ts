/**
 * Type definitions for Chatbot API integration and Profile
 */

import type { medicines } from '../data/medicines';

export type Medicine = typeof medicines[number];

/**
 * Response from Flask API /api/chat endpoint
 */
export interface ChatAPIResponse {
  status: 'success' | 'error';
  response: string;
  intent: string;
  confidence: number;
  data?: MedicineFromAPI[] | MedicineFromAPI;
  allergyWarnings?: AllergyWarning[] | null;
  suggestions?: string[];
  message?: string; // for error responses
}

/**
 * Warning when a recommended medicine contains an allergen
 */
export interface AllergyWarning {
  medicineId: number;
  medicineName: string;
  matchedAllergen: string;
  warning: string;
}

/**
 * Medicine format from NLP API (medicines_primary.json)
 */
export interface MedicineFromAPI {
  id: number;
  name: string;
  composition: string;
  uses: string;
  side_effects: string;
  manufacturer: string;
  image_url: string;
  kategori_id: string[];
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  model_loaded: boolean;
  total_medicines: number;
}

/**
 * Chat message in UI
 */
export interface ChatMessage {
  id: number;
  sender: 'user' | 'bot';
  message: string;
  timestamp: Date;
  recommendations?: Medicine[];
  intent?: string;
  confidence?: number;
  allergyWarnings?: AllergyWarning[];
}

/**
 * User profile response from /api/profile
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  role: string;
  allergies: string[];
  createdAt: string;
  totalOrders: number;
}

/**
 * Profile API response
 */
export interface ProfileAPIResponse {
  status: 'success' | 'error';
  profile?: UserProfile;
  message?: string;
}

/**
 * Quick suggestion item
 */
export interface QuickSuggestion {
  text: string;
  intent: string;
}
