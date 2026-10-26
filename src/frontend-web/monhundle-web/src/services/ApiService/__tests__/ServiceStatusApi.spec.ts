import { describe, expect, it, vi } from 'vitest';

vi.mock('@/services/ApiService/ApiBaseAccess', () => ({
    apiFetch: vi.fn(),
}));

import { ServiceStatusApi } from '@/services/ApiService/ServiceStatusApi';
import { apiFetch } from '@/services/ApiService/ApiBaseAccess';

const apiFetchMock = apiFetch as unknown as ReturnType<typeof vi.fn>;

// The HTTP outcomes are covered by
// src/services/ApiService/__integration-tests__/ServiceStatusApi.integration.spec.ts.
// This case can't come from the network: apiFetch only ever throws a BackendUnavailableError.
describe('ServiceStatusApi.isServerAvailable', () => {
    it('lets any other error through instead of hiding it behind false', async () => {
        const bug = new TypeError('something broke');
        apiFetchMock.mockRejectedValue(bug);

        await expect(new ServiceStatusApi().isServerAvailable()).rejects.toBe(bug);
    });
});
