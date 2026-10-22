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

    it('lets a public route through when authentication fails', async () => {
        const failedAuth = Promise.reject(new Error('auth down'));
        // the guard never awaits it for a public route: mark the rejection as handled
        failedAuth.catch(() => {});
        authManagerMock.whenAuthenticated = failedAuth;

        await router.push(paths.error);

        expect(router.currentRoute.value.path).toBe(paths.error);
    });

    it('lets a public route through without waiting for a pending authentication', async () => {
        // never settles: a guard awaiting it would block the navigation forever
        authManagerMock.whenAuthenticated = new Promise<void>(() => {});

        await router.push(paths.error);

        expect(router.currentRoute.value.path).toBe(paths.error);
    });
});

describe('error route', () => {
    it('is public and bare', () => {
        const errorRoute = router.resolve(paths.error);

        expect(errorRoute.meta.public).toBe(true);
        expect(errorRoute.meta.bare).toBe(true);
    });
});
