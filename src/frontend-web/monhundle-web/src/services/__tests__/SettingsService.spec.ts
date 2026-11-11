import { beforeEach, describe, expect, it } from 'vitest';
import { nextTick, ref, type Ref } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { createDefaultSettings } from '@/domain/Settings';
import { SettingsService } from '@/services/SettingsService';
import { useSettingsStore, type SettingsStore } from '@/stores/SettingsStore';

describe('SettingsService', () => {
    let store: SettingsStore;
    let locale: Ref<string>;

    beforeEach(() => {
        setActivePinia(createPinia());
        store = useSettingsStore();
        locale = ref('');
        document.documentElement.lang = '';
    });

    describe('setters', () => {
        it('update the matching setting in the store', () => {
            const service = new SettingsService(store, locale);

            service.setLanguage('fr');
            service.setTheme('classic');
            service.setGameList(['MHW', 'MHR']);
            service.setTableVisualAid(true);

            expect(store.$state).toEqual({
                language: 'fr',
                theme: 'classic',
                gameList: ['MHW', 'MHR'],
                tableVisualAid: true,
            });
        });

        it('can set the language and the theme back to no explicit choice', () => {
            const service = new SettingsService(store, locale);
            store.update({ language: 'fr', theme: 'classic' });

            service.setLanguage(null);
            service.setTheme(null);

            expect(store.language).toBeNull();
            expect(store.theme).toBeNull();
        });

        it('resetSettings goes back to the default settings', () => {
            const service = new SettingsService(store, locale);
            store.update({ language: 'fr', gameList: ['MHW'], tableVisualAid: true });

            service.resetSettings();

            expect(store.$state).toEqual(createDefaultSettings());
        });
    });

    describe('language', () => {
        it('applies the stored language as soon as the service is created', () => {
            store.update({ language: 'fr' });

            new SettingsService(store, locale);

            expect(locale.value).toBe('fr');
            expect(document.documentElement.lang).toBe('fr');
        });

        it('falls back to english when no language is chosen', () => {
            new SettingsService(store, locale);

            expect(locale.value).toBe('en');
            expect(document.documentElement.lang).toBe('en');
        });

        it('applies every language change', async () => {
            const service = new SettingsService(store, locale);

            service.setLanguage('fr');
            await nextTick();

            expect(locale.value).toBe('fr');
            expect(document.documentElement.lang).toBe('fr');
        });

        it('applies a language change made outside of the service', async () => {
            new SettingsService(store, locale);

            store.update({ language: 'fr' });
            await nextTick();

            expect(locale.value).toBe('fr');
        });

        it('goes back to english after a reset', async () => {
            const service = new SettingsService(store, locale);
            service.setLanguage('fr');
            await nextTick();

            service.resetSettings();
            await nextTick();

            expect(locale.value).toBe('en');
            expect(document.documentElement.lang).toBe('en');
        });
    });
});
