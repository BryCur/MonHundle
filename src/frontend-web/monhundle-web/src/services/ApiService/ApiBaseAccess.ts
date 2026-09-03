import { getStoredUserId } from '@/services/LocalStorageService';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const userId = getStoredUserId();

  return await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // the API identifies the player from this header
      ...(userId ? { Authorization: `Bearer ${userId}` } : {}),
      ...(options.headers || {})
    },
  });
}
