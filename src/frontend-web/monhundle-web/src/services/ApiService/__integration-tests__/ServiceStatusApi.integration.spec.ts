import { describe, expect, it } from 'vitest';
import { HttpResponse, http } from 'msw';
import { server } from '@test-utils/vitest/setup';
import { ServiceStatusApi } from '@/services/ApiService/ServiceStatusApi';

describe('ServiceStatusApi.isServerAvailable (integration)', () => {
    it('sends a HEAD request to the service status endpoint', async () => {
        let capturedMethod: string | null = null;
        let capturedUrl: string | null = null;
        server.use(
            http.head('*/service/status', ({ request }) => {
                capturedMethod = request.method;
                capturedUrl = request.url;
                return new HttpResponse(null, { status: 200 });
            }),
        );

        await new ServiceStatusApi().isServerAvailable();

        expect(capturedMethod).toBe('HEAD');
        expect(new URL(capturedUrl!).pathname.toLowerCase()).toBe('/service/status');
    });

    it('is true when the backend answers ok', async () => {
        server.use(http.head('*/service/status', () => new HttpResponse(null, { status: 200 })));

        await expect(new ServiceStatusApi().isServerAvailable()).resolves.toBe(true);
    });

    it.each([502, 503, 504])('is false when the backend is unavailable (%i)', async (status) => {
        server.use(http.head('*/service/status', () => new HttpResponse(null, { status })));

        await expect(new ServiceStatusApi().isServerAvailable()).resolves.toBe(false);
    });

    it('is false when the backend answers with an error', async () => {
        server.use(http.head('*/service/status', () => new HttpResponse(null, { status: 500 })));

        await expect(new ServiceStatusApi().isServerAvailable()).resolves.toBe(false);
    });

    it('is false, without rejecting, when the backend cannot be reached', async () => {
        server.use(http.head('*/service/status', () => HttpResponse.error()));

        await expect(new ServiceStatusApi().isServerAvailable()).resolves.toBe(false);
    });
});
