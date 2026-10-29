import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createI18n } from 'vue-i18n';
import AboutView from '@/views/AboutView.vue';
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';

function mountView(locale: 'en' | 'fr') {
    const i18n = createI18n({
        legacy: false,
        globalInjection: false,
        locale,
        messages: { en, fr },
    });
    return mount(AboutView, { global: { plugins: [i18n] } });
}

function renderedLinks(locale: 'en' | 'fr') {
    return mountView(locale)
        .findAll('a')
        .map((link) => link.attributes('href'));
}

describe('AboutView', () => {
    it.each(['en', 'fr'] as const)('renders no raw translation key in %s', (locale) => {
        expect(mountView(locale).text()).not.toContain('ui.page.about');
    });

    // en is the reference: a slot whose parameter is missing from a locale renders nothing
    it('renders the same links in fr as in en', () => {
        const referenceLinks = renderedLinks('en');

        expect(referenceLinks).not.toHaveLength(0);
        expect(renderedLinks('fr')).toStrictEqual(referenceLinks);
    });
});
