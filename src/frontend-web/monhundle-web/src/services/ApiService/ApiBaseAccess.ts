const API_BASE_URL = import.meta.env.VITE_API_URL;

// Petite fonction utilitaire pour gérer les requêtes
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  return await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    credentials: 'include', // sends the cookie
  });
}
