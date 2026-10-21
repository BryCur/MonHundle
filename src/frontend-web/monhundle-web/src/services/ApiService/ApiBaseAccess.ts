import { BackendUnavailableError } from '@/domain/errors/BackendUnavailableError';
import { UnexpectedApiError } from '@/domain/errors/UnexpectedApiError';
import { getStoredUserId } from '@/services/LocalStorageService';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const UNAVAILABLE_STATUSES = [502, 503, 504]; // bad gateway, service unavailable, gateway timeout

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const userId = getStoredUserId();

    let response: Response;
    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                // the API identifies the player from this header
                ...(userId ? { Authorization: `Bearer ${userId}` } : {}),
                ...(options.headers || {}),
            },
        });
    } catch (err) {
        // network error of some sort.
        throw new BackendUnavailableError('Service unreachable', { cause: err });
    }

    if (UNAVAILABLE_STATUSES.includes(response.status)) {
        throw new BackendUnavailableError(`Backend unavailable; status (${response.status})`);
    }

    return response;
}

export function ensureOk(resp: Response, errorMsg: string): Response {
    if (!resp.ok) {
        throw new UnexpectedApiError(errorMsg, resp.status);
    }

    return resp;
}
