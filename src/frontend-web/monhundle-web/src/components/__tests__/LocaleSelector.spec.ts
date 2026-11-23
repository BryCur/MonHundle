import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick, ref } from 'vue';
import LocaleSelector from '@/components/LocaleSelector.vue';
import type ISettingApi from '@/domain/interfaces/api-contracts/ISettingApi';
import { settingsServiceKey } from '@/injectionKeyRegistry';
import { SettingsService } from '@/services/SettingsService';
import { useSettingsStore } from '@/stores/SettingsStore';

let browserLanguages: string[];

// the real service on the active pinia's store: the selector reads and writes through it
function mountSelector(attrs: Record<string, unknown> = {}) {
    const service = new SettingsService(useSettingsStore(), {} as ISettingApi, ref('en'));
    return mount(LocaleSelector, {
        attrs,
        global: { provide: { [settingsServiceKey]: service } },
    });
}

function selectedValue(wrapper: ReturnType<typeof mountSelector>) {
    return (wrapper.find('select').element as HTMLSelectElement).value;
}

describe('LocaleSelector', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        browserLanguages = [];
        vi.spyOn(Navigator.prototype, 'languages', 'get').mockImplementation(
            () => browserLanguages,
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('offers every supported language under its native name', () => {
        const options = mountSelector().findAll('option');

        expect(options.map((option) => option.attributes('value'))).toEqual(['en', 'fr']);
        expect(options.map((option) => option.text())).toEqual(['English', 'Français']);
    });

    it('marks each option with its own language, for screen readers', () => {
        const options = mountSelector().findAll('option');

        expect(options.map((option) => option.attributes('lang'))).toEqual(['en', 'fr']);
    });

    it('shows the chosen language', () => {
        useSettingsStore().update({ language: 'fr' });

        expect(selectedValue(mountSelector())).toBe('fr');
    });

    it('shows the detected browser language when no language is chosen', () => {
        browserLanguages = ['fr-CH'];

        expect(selectedValue(mountSelector())).toBe('fr');
    });

    it('stores the picked language as an explicit choice', async () => {
        browserLanguages = ['fr-CH'];
        const wrapper = mountSelector();

        await wrapper.find('select').setValue('en');

        expect(useSettingsStore().language).toBe('en');
        expect(selectedValue(wrapper)).toBe('en');
    });

    it('follows a language change made elsewhere', async () => {
        const wrapper = mountSelector();

        useSettingsStore().update({ language: 'fr' });
        await nextTick();

        expect(selectedValue(wrapper)).toBe('fr');
    });

    it('passes the attributes given to the component to the select itself', () => {
        const select = mountSelector({ id: 'language-select', disabled: true }).find('select');

        expect(select.attributes('id')).toBe('language-select');
        expect((select.element as HTMLSelectElement).disabled).toBe(true);
    });
});
