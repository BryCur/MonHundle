import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// authManager is a module-level singleton imported directly by router/index.ts,
// so it must be mocked before that module is imported.
const { authManagerMock } = vi.hoisted(() => ({
    authManagerMock: { whenAuthenticated: Promise.resolve() as Promise<void> },
}));

vi.mock('@/services/AuthManagementService', () => ({
    authManager: authManagerMock,
}));

import { router, paths } from '@/router';

describe('router auth guard', () => {
    beforeEach(async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});

        // vue-router skips re-running guards when pushing to the route that is already
        // current, so each test starts from a neutral route none of them target.
        authManagerMock.whenAuthenticated = Promise.resolve();
        await router.push(paths.selectGame);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('allows navigation once authentication resolves', async () => {
        authManagerMock.whenAuthenticated = Promise.resolve();

        await router.push(paths.unlimited);

        expect(router.currentRoute.value.path).toBe(paths.unlimited);
    });

    it("redirects to /about when authentication fails and the target isn't /about", async () => {
        authManagerMock.whenAuthenticated = Promise.reject(new Error('auth down'));

        await router.push(paths.unlimited);

        expect(router.currentRoute.value.path).toBe(paths.about);
    });

    it('still allows navigation to /about when authentication fails', async () => {
        authManagerMock.whenAuthenticated = Promise.reject(new Error('auth down'));

        await router.push(paths.about);

        expect(router.currentRoute.value.path).toBe(paths.about);
    });

    it('redirects to /about regardless of which route was first targeted', async () => {
        authManagerMock.whenAuthenticated = Promise.reject(new Error('auth down'));

        await router.push(paths.settings);

        expect(router.currentRoute.value.path).toBe(paths.about);
    });
});
