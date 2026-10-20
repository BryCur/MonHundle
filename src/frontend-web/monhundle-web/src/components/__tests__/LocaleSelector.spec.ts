import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';
import { createI18n } from 'vue-i18n';
import LocaleSelector from '@/components/LocaleSelector.vue';

function createTestI18n() {
    return createI18n({ legacy: false, locale: 'en', messages: { en: {}, fr: {} } });
}

let i18n: ReturnType<typeof createTestI18n>;

function mountSelector() {
    return mount(LocaleSelector, { global: { plugins: [i18n] } });
}

describe('LocaleSelector', () => {
    beforeEach(() => {
        // fresh instance per test, so a locale switch does not leak into the next test
        i18n = createTestI18n();
    });

    it('offers one option per available locale', () => {
        const options = mountSelector().findAll('option');

        expect(options.map((option) => option.attributes('value'))).toEqual(['en', 'fr']);
    });

    it('shows the current locale as selected', () => {
        const select = mountSelector().find('select').element as HTMLSelectElement;

        expect(select.value).toBe('en');
    });

    it('switches the app locale when another language is picked', async () => {
        await mountSelector().find('select').setValue('fr');

        expect(i18n.global.locale.value).toBe('fr');
    });
});
