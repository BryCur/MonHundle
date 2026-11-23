import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';
import { createI18n } from 'vue-i18n';
import ThemeSelector from '@/components/ThemeSelector.vue';
import type ISettingApi from '@/domain/interfaces/api-contracts/ISettingApi';
import { DEFAULT_THEME, THEME_IDS } from '@/domain/Theme';
import { settingsServiceKey } from '@/injectionKeyRegistry';
import { SettingsService } from '@/services/SettingsService';
import { useSettingsStore } from '@/stores/SettingsStore';
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';

// the real service on the active pinia's store: the selector reads and writes through it
function mountSelector(options: { attrs?: Record<string, unknown>; locale?: 'en' | 'fr' } = {}) {
    const service = new SettingsService(useSettingsStore(), {} as ISettingApi, ref('en'));
    const i18n = createI18n({
        legacy: false,
        globalInjection: false,
        locale: options.locale ?? 'en',
        messages: { en, fr },
    });
    return mount(ThemeSelector, {
        attrs: options.attrs,
        global: { plugins: [i18n], provide: { [settingsServiceKey]: service } },
    });
}

function selectedValue(wrapper: ReturnType<typeof mountSelector>) {
    return (wrapper.find('select').element as HTMLSelectElement).value;
}

describe('ThemeSelector', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('offers every registered theme', () => {
        const options = mountSelector().findAll('option');

        expect(options.map((option) => option.attributes('value'))).toEqual([...THEME_IDS]);
    });

    it('names the themes in the interface language', () => {
        expect(mountSelector({ locale: 'en' }).find('option').text()).toBe('Classic dark');
        expect(mountSelector({ locale: 'fr' }).find('option').text()).toBe('Classique sombre');
    });

    it('shows the default theme when no theme is chosen', () => {
        expect(selectedValue(mountSelector())).toBe(DEFAULT_THEME);
    });

    it('stores the picked theme as an explicit choice', async () => {
        const wrapper = mountSelector();

        await wrapper.find('select').setValue('classic-dark');

        expect(useSettingsStore().theme).toBe('classic-dark');
    });

    it('passes the attributes given to the component to the select itself', () => {
        const select = mountSelector({ attrs: { id: 'theme-select', disabled: true } }).find(
            'select',
        );

        expect(select.attributes('id')).toBe('theme-select');
        expect((select.element as HTMLSelectElement).disabled).toBe(true);
    });
});
