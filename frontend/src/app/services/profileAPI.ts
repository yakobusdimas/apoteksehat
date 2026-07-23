/**
 * API services for Profile and Allergy management
 */

import type { ProfileAPIResponse, UserProfile } from '../types/chatbot';

const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Get current user profile with allergies
 */
export async function getProfile(): Promise<{ profile?: UserProfile; error?: string }> {
  try {
    const token = localStorage.getItem('apotek_jwt_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/api/profile`, { headers });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data: ProfileAPIResponse = await response.json();

    if (data.status === 'error') {
      throw new Error(data.message || 'Profile request failed');
    }

    return { profile: data.profile };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return { error: error instanceof Error ? error.message : 'Failed to load profile' };
  }
}

/**
 * Update user allergies list
 */
export async function updateAllergies(allergies: string[]): Promise<{ success?: boolean; error?: string }> {
  try {
    const token = localStorage.getItem('apotek_jwt_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/api/profile/allergies`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ allergies }),
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'error') {
      throw new Error(data.message || 'Update failed');
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating allergies:', error);
    return { error: error instanceof Error ? error.message : 'Failed to update allergies' };
  }
}
