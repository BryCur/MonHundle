import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/LocalStorageService', () => ({
    getStoredUserId: vi.fn(),
}));

import { apiFetch } from '@/services/ApiService/ApiBaseAccess';
import { getStoredUserId } from '@/services/LocalStorageService';

const API_BASE = import.meta.env.VITE_API_URL;
const storedUserId = getStoredUserId as unknown as ReturnType<typeof vi.fn>;

describe('apiFetch', () => {
    const fetchMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        fetchMock.mockResolvedValue({ ok: true });
        vi.stubGlobal('fetch', fetchMock);
        storedUserId.mockReturnValue(null);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    function lastCallOptions(): RequestInit & { headers: Record<string, string> } {
        return fetchMock.mock.calls[0]![1];
    }

    it('prefixes the endpoint with the configured API base url', async () => {
        await apiFetch('/user/authenticate', { method: 'GET' });

        expect(fetchMock.mock.calls[0]![0]).toBe(`${API_BASE}/user/authenticate`);
    });

    it('always sends a JSON content-type header', async () => {
        await apiFetch('/anything');

        expect(lastCallOptions().headers['Content-Type']).toBe('application/json');
    });

    it('adds a bearer Authorization header when a user id is stored', async () => {
        storedUserId.mockReturnValue('user-42');

        await apiFetch('/anything');

        expect(lastCallOptions().headers.Authorization).toBe('Bearer user-42');
    });

    it('omits the Authorization header when no user id is stored', async () => {
        storedUserId.mockReturnValue(null);

        await apiFetch('/anything');

        expect(lastCallOptions().headers.Authorization).toBeUndefined();
    });

    it('lets caller-provided headers override the defaults', async () => {
        await apiFetch('/anything', { headers: { 'X-Test': '1', 'Content-Type': 'text/plain' } });

        const headers = lastCallOptions().headers;
        expect(headers['X-Test']).toBe('1');
        expect(headers['Content-Type']).toBe('text/plain');
    });

    it('forwards the method and body untouched', async () => {
        await apiFetch('/anything', { method: 'POST', body: 'payload' });

        const options = lastCallOptions();
        expect(options.method).toBe('POST');
        expect(options.body).toBe('payload');
    });
});
