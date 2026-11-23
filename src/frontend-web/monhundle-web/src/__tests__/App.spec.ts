import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createI18n } from 'vue-i18n';
import { createMemoryHistory, createRouter } from 'vue-router';
import App from '@/App.vue';
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';

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

// the real messages: the layout texts are checked in both languages
function createTestI18n(locale: 'en' | 'fr') {
    return createI18n({ legacy: false, globalInjection: false, locale, messages: { en, fr } });
}

async function mountAppAt(path: string, locale: 'en' | 'fr' = 'en') {
    const router = createTestRouter();
    await router.push(path);

    const wrapper = mount(App, {
        global: {
            plugins: [router, createTestI18n(locale)],
            // RouterLink stubbed: the header links target routes this test router doesn't have.
            // RouterLinkStub (unlike `true`) still renders the link text.
            stubs: { NotificationCanvas: true, LocaleSelector: true, RouterLink: RouterLinkStub },
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

describe('App layout texts', () => {
    function navigationLabels(wrapper: Awaited<ReturnType<typeof mountAppAt>>['wrapper']) {
        return wrapper.findAllComponents(RouterLinkStub).map((link) => link.text());
    }

    it('shows the navigation in the current language', async () => {
        const { wrapper: english } = await mountAppAt(REGULAR_PATH, 'en');
        const { wrapper: french } = await mountAppAt(REGULAR_PATH, 'fr');

        expect(navigationLabels(english)).toEqual([
            'Unlimited',
            'Daily Challenge',
            'About',
            'Settings',
        ]);
        expect(navigationLabels(french)).toEqual([
            'Illimité',
            'Défi du jour',
            'À propos',
            'Paramètres',
        ]);
    });

    it('shows the footer in the current language', async () => {
        const { wrapper } = await mountAppAt(REGULAR_PATH, 'fr');

        expect(wrapper.find('.footer-disclaimer').text()).toBe(
            'Projet de fan non officiel - Monster Hunter est une marque déposée de Capcom Co., Ltd.',
        );
    });

    it('keeps the author link inside the translated sentence', async () => {
        const { wrapper } = await mountAppAt(REGULAR_PATH, 'fr');

        const madeBy = wrapper.find('.footer-main span');
        expect(madeBy.text()).toBe('Fait avec ❤️ par Corbac');
        expect(madeBy.find('a').attributes('href')).toBe('https://github.com/BryCur');
    });
});
