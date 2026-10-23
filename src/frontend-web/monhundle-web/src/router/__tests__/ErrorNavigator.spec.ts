import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import { createErrorRouterNavigator } from '@/router/ErrorNavigator';
import { paths } from '@/router';
import { ErrorReason } from '@/domain/errors/BlockingError/BaseBlockingError';

const emptyView = { template: '<div />' };

// a dedicated router: only the navigation matters here, not the real views or the auth guard
function createTestRouter() {
    return createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: paths.home, component: emptyView },
            { path: paths.daily, component: emptyView },
            { path: paths.error, component: emptyView },
        ],
    });
}

async function routerAt(path: string) {
    const router = createTestRouter();
    await router.push(path);
    return router;
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe('createErrorRouterNavigator', () => {
    describe('showErrorPage', () => {
        it('navigates to the error page with the reason and the current page as origin', async () => {
            const router = await routerAt(paths.daily);

            createErrorRouterNavigator(router).showErrorPage(ErrorReason.Critical);
            await flushPromises();

            expect(router.currentRoute.value.path).toBe(paths.error);
            expect(router.currentRoute.value.query).toEqual({
                reason: ErrorReason.Critical,
                from: paths.daily,
            });
        });

        it("keeps the origin's own query in the origin", async () => {
            const router = await routerAt(`${paths.daily}?tab=history`);

            createErrorRouterNavigator(router).showErrorPage(ErrorReason.Unavailable);
            await flushPromises();

            expect(router.currentRoute.value.query.from).toBe(`${paths.daily}?tab=history`);
        });

        it('replaces the current page instead of pushing a new history entry', async () => {
            const router = await routerAt(paths.home);
            await router.push(paths.daily);
            const pushSpy = vi.spyOn(router, 'push');
            const replaceSpy = vi.spyOn(router, 'replace');

            createErrorRouterNavigator(router).showErrorPage(ErrorReason.Critical);
            await flushPromises();
            router.back();
            await flushPromises();

            expect(replaceSpy).toHaveBeenCalledTimes(1);
            expect(pushSpy).not.toHaveBeenCalled();
            // going back skips the page that failed
            expect(router.currentRoute.value.path).toBe(paths.home);
        });

        it('logs a failed navigation instead of letting it reject', async () => {
            const router = await routerAt(paths.daily);
            const guardError = new Error('guard failure');
            router.beforeEach(() => {
                throw guardError;
            });
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            // vue-router warns about the guard error itself: expected here
            vi.spyOn(console, 'warn').mockImplementation(() => {});
            const unhandled = vi.fn();
            process.on('unhandledRejection', unhandled);

            createErrorRouterNavigator(router).showErrorPage(ErrorReason.Critical);
            await flushPromises();
            process.off('unhandledRejection', unhandled);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[error navigator] could not show the error page',
                guardError,
            );
            expect(unhandled).not.toHaveBeenCalled();
            expect(router.currentRoute.value.path).toBe(paths.daily);
        });
    });

    describe('isOnErrorPage', () => {
        it('is true on the error page', async () => {
            const router = await routerAt(`${paths.error}?reason=${ErrorReason.Critical}`);

            expect(createErrorRouterNavigator(router).isOnErrorPage()).toBe(true);
        });

        it.each([paths.home, paths.daily])('is false on %s', async (path) => {
            const router = await routerAt(path);

            expect(createErrorRouterNavigator(router).isOnErrorPage()).toBe(false);
        });

        it('follows the navigation', async () => {
            const router = await routerAt(paths.daily);
            const errNavigator = createErrorRouterNavigator(router);

            errNavigator.showErrorPage(ErrorReason.Critical);
            await flushPromises();

            expect(errNavigator.isOnErrorPage()).toBe(true);
        });
    });
});
