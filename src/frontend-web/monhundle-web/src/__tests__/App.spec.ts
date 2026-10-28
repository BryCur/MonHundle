import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import App from '@/App.vue';

const BARE_PATH = '/bare';
const REGULAR_PATH = '/regular';

// a dedicated router: only the route meta matters here, not the real views or the auth guard
function createTestRouter() {
    return createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: REGULAR_PATH, component: { template: '<div />' } },
            { path: BARE_PATH, component: { template: '<div />' }, meta: { bare: true } },
        ],
    });
}

async function mountAppAt(path: string) {
    const router = createTestRouter();
    await router.push(path);

    const wrapper = mount(App, {
        global: {
            plugins: [router],
            // RouterLink stubbed: the header links target routes this test router doesn't have
            stubs: { NotificationCanvas: true, LocaleSelector: true, RouterLink: true },
        },
    });
    await flushPromises();

    return { wrapper, router };
}

describe('App layout', () => {
    it('shows the navigation header on a regular route', async () => {
        const { wrapper } = await mountAppAt(REGULAR_PATH);

        expect(wrapper.find('header').exists()).toBe(true);
    });

    it('hides the navigation header on a bare route', async () => {
        const { wrapper } = await mountAppAt(BARE_PATH);

        expect(wrapper.find('header').exists()).toBe(false);
    });

    it('keeps the footer on a bare route', async () => {
        const { wrapper } = await mountAppAt(BARE_PATH);

        expect(wrapper.find('footer').exists()).toBe(true);
    });

    it('shows the header again when leaving a bare route', async () => {
        const { wrapper, router } = await mountAppAt(BARE_PATH);

        await router.push(REGULAR_PATH);
        await flushPromises();

        expect(wrapper.find('header').exists()).toBe(true);
    });
});
