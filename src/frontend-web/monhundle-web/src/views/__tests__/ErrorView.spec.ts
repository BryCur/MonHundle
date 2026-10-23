import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import { createMemoryHistory, createRouter, type LocationQueryRaw } from 'vue-router';
import ErrorView from '@/views/ErrorView.vue';
import { paths } from '@/router';
import { ErrorReason } from '@/domain/errors/BlockingError/BaseBlockingError';

// real (empty) i18n so `t()` resolves to the key path
const i18n = createI18n({
    legacy: false,
    globalInjection: false,
    missingWarn: false,
    fallbackWarn: false,
    locale: 'en',
    messages: { en: {} },
});

const RETRY_KEY = 'ui.page.error.action.retry';
const HOME_KEY = 'ui.page.error.action.home';

const emptyView = { template: '<div />' };

afterEach(() => {
    vi.restoreAllMocks();
});

// a dedicated router with the routes the view can point to, without the real views or the auth guard
function createTestRouter() {
    return createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: paths.home, component: emptyView },
            { path: paths.daily, component: emptyView },
            { path: paths.error, component: ErrorView },
        ],
    });
}

async function mountErrorView(query: LocationQueryRaw = {}) {
    const router = createTestRouter();
    await router.push({ path: paths.error, query });

    const wrapper = mount(ErrorView, { global: { plugins: [router, i18n] } });
    await flushPromises();

    return { wrapper, router };
}

function findButton(wrapper: Awaited<ReturnType<typeof mountErrorView>>['wrapper'], key: string) {
    return wrapper.findAll('button').find((button) => button.text() === key);
}

describe('ErrorView content', () => {
    it.each(Object.values(ErrorReason))(
        'shows the title and message of the %s reason',
        async (reason) => {
            const { wrapper } = await mountErrorView({ reason });

            expect(wrapper.find('.error-content-title').text()).toBe(
                `ui.page.error.content.${reason}.title`,
            );
            expect(wrapper.find('.error-content-message').text()).toBe(
                `ui.page.error.content.${reason}.message`,
            );
        },
    );

    it.each([
        ['a missing reason', {}],
        ['an unknown reason', { reason: 'not-a-reason' }],
        ['an empty reason', { reason: '' }],
        ['a reason without value', { reason: null }],
    ])('falls back to the unexpected content for %s', async (_label, query) => {
        const { wrapper } = await mountErrorView(query);

        expect(wrapper.find('.error-content-title').text()).toBe(
            'ui.page.error.content.unexpected.title',
        );
    });

    it('uses the first value of a repeated reason', async () => {
        const { wrapper } = await mountErrorView({
            reason: [ErrorReason.Unavailable, ErrorReason.Critical],
        });

        expect(wrapper.find('.error-content-title').text()).toBe(
            'ui.page.error.content.unavailable.title',
        );
    });

    it('updates its content when the reason changes while staying on the page', async () => {
        const { wrapper, router } = await mountErrorView({ reason: ErrorReason.Critical });

        await router.replace({ path: paths.error, query: { reason: ErrorReason.Unavailable } });
        await flushPromises();

        expect(wrapper.find('.error-content-title').text()).toBe(
            'ui.page.error.content.unavailable.title',
        );
    });
});

describe('ErrorView retry action', () => {
    it('is shown and replaces the current route with the origin when it is valid', async () => {
        const { wrapper, router } = await mountErrorView({ from: paths.daily });
        const replaceSpy = vi.spyOn(router, 'replace');

        await findButton(wrapper, RETRY_KEY)!.trigger('click');
        await flushPromises();

        expect(replaceSpy).toHaveBeenCalledWith(paths.daily);
        expect(router.currentRoute.value.path).toBe(paths.daily);
    });

    it("keeps the origin's own query when retrying", async () => {
        const { wrapper, router } = await mountErrorView({ from: `${paths.daily}?tab=history` });

        await findButton(wrapper, RETRY_KEY)!.trigger('click');
        await flushPromises();

        expect(router.currentRoute.value.fullPath).toBe(`${paths.daily}?tab=history`);
    });

    it.each([
        ['there is no origin', {}],
        ['the origin is empty', { from: '' }],
        ['the origin has no value', { from: null }],
        ['the origin is not a path', { from: 'daily' }],
        ['the origin is protocol-relative', { from: '//example.com' }],
        ['the origin is an absolute url', { from: 'https://example.com' }],
        ['the origin is an unknown route', { from: '/unknown' }],
        ['the origin is the error page itself', { from: paths.error }],
    ])('is hidden when %s', async (_label, query) => {
        // vue-router warns when resolving an unknown route: expected here
        vi.spyOn(console, 'warn').mockImplementation(() => {});

        const { wrapper } = await mountErrorView(query);

        expect(findButton(wrapper, RETRY_KEY)).toBeUndefined();
    });
});

describe('ErrorView home action', () => {
    it.each([
        ['without an origin', {}],
        ['with an origin', { from: paths.daily }],
    ])('is always shown and replaces the current route with home (%s)', async (_label, query) => {
        const { wrapper, router } = await mountErrorView(query);
        const replaceSpy = vi.spyOn(router, 'replace');

        await findButton(wrapper, HOME_KEY)!.trigger('click');
        await flushPromises();

        expect(replaceSpy).toHaveBeenCalledWith(paths.home);
        expect(router.currentRoute.value.path).toBe(paths.home);
    });
});
