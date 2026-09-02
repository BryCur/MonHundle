import { getStoredUserId } from '@/services/LocalStorageService';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Petite fonction utilitaire pour gérer les requêtes
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const userId = getStoredUserId();

  return await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // the API identifies the player from this header; the cookie below is only a fallback
      // for browsers that still accept the cross-site cookie
      ...(userId ? { Authorization: `Bearer ${userId}` } : {}),
      ...(options.headers || {})
    },
    credentials: 'include', // sends the cookie when the browser allows it
  });
}
