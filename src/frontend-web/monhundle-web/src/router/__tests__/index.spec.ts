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
import { BackendUnavailableError } from '@/domain/errors/BlockingError/BackendUnavailableError';
import { ErrorReason } from '@/domain/errors/BlockingError/BaseBlockingError';
import { UnexpectedApiError } from '@/domain/errors/UnexpectedApiError';

// a failed authentication the guard may never await (public routes): mark it as handled
function failedAuthentication(error: Error): Promise<void> {
    const failed = Promise.reject(error);
    failed.catch(() => {});
    return failed;
}

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

    it('redirects to the error page with the unavailable reason when the backend is down', async () => {
        authManagerMock.whenAuthenticated = failedAuthentication(
            new BackendUnavailableError('Service unreachable'),
        );

        await router.push(paths.unlimited);

        expect(router.currentRoute.value.path).toBe(paths.error);
        expect(router.currentRoute.value.query).toEqual({
            reason: ErrorReason.Unavailable,
            from: paths.unlimited,
        });
    });

    it.each([
        ['an unexpected api error', new UnexpectedApiError('Authentication failed', 500)],
        ['any other error', new Error('Authentication response did not contain a valid user id')],
    ])('redirects to the error page with the critical reason for %s', async (_label, error) => {
        authManagerMock.whenAuthenticated = failedAuthentication(error);

        await router.push(paths.settings);

        expect(router.currentRoute.value.path).toBe(paths.error);
        expect(router.currentRoute.value.query).toEqual({
            reason: ErrorReason.Critical,
            from: paths.settings,
        });
    });

    it("keeps the targeted page's own query as origin", async () => {
        authManagerMock.whenAuthenticated = failedAuthentication(new Error('auth down'));

        await router.push(`${paths.daily}?tab=history`);

        expect(router.currentRoute.value.query.from).toBe(`${paths.daily}?tab=history`);
    });

    it('logs the authentication failure', async () => {
        const error = new Error('auth down');
        authManagerMock.whenAuthenticated = failedAuthentication(error);

        await router.push(paths.unlimited);

        expect(console.error).toHaveBeenCalledWith(
            'Authentication failed before navigation',
            error,
        );
    });

    it.each([paths.about, paths.error])(
        'lets the public route %s through when authentication fails',
        async (path) => {
            authManagerMock.whenAuthenticated = failedAuthentication(new Error('auth down'));

            await router.push(path);

            expect(router.currentRoute.value.path).toBe(path);
        },
    );

    it('lets a public route through without waiting for a pending authentication', async () => {
        // never settles: a guard awaiting it would block the navigation forever
        authManagerMock.whenAuthenticated = new Promise<void>(() => {});

        await router.push(paths.error);

        expect(router.currentRoute.value.path).toBe(paths.error);
    });
});

describe('about route', () => {
    it('is public but keeps the navigation header', () => {
        const aboutRoute = router.resolve(paths.about);

        expect(aboutRoute.meta.public).toBe(true);
        expect(aboutRoute.meta.bare).toBeFalsy();
    });
});

describe('error route', () => {
    it('is public and bare', () => {
        const errorRoute = router.resolve(paths.error);

        expect(errorRoute.meta.public).toBe(true);
        expect(errorRoute.meta.bare).toBe(true);
    });
});
