import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createDefaultSettings, type Settings } from '@/domain/Settings';
import { useSettingsStore } from '@/stores/SettingsStore';

const SETTINGS: Settings = {
    language: 'fr',
    theme: 'classic',
    gameList: ['MHW', 'MHR'],
    tableVisualAid: true,
};

describe('SettingsStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('starts with the default settings', () => {
        const store = useSettingsStore();

        expect(store.$state).toEqual(createDefaultSettings());
    });

    describe('update', () => {
        it('sets every provided field', () => {
            const store = useSettingsStore();

            store.update(SETTINGS);

            expect(store.$state).toEqual(SETTINGS);
        });

        it('leaves the fields that are not provided unchanged', () => {
            const store = useSettingsStore();
            store.update(SETTINGS);

            store.update({ language: 'en' });

            expect(store.$state).toEqual({ ...SETTINGS, language: 'en' });
        });

        it('leaves a field explicitly set to undefined unchanged', () => {
            const store = useSettingsStore();
            store.update(SETTINGS);

            store.update({ theme: undefined });

            expect(store.theme).toBe('classic');
        });

        it('sets a field back to null', () => {
            const store = useSettingsStore();
            store.update(SETTINGS);

            store.update({ language: null, theme: null });

            expect(store.language).toBeNull();
            expect(store.theme).toBeNull();
        });

        it('sets falsy values', () => {
            const store = useSettingsStore();
            store.update(SETTINGS);

            store.update({ tableVisualAid: false, gameList: [] });

            expect(store.tableVisualAid).toBe(false);
            expect(store.gameList).toEqual([]);
        });

        it('copies the game list instead of keeping the caller array', () => {
            const store = useSettingsStore();
            const gameList = ['MHW'];

            store.update({ gameList });
            gameList.push('MHR');

            expect(store.gameList).toEqual(['MHW']);
        });
    });

    describe('reset', () => {
        it('goes back to the default settings', () => {
            const store = useSettingsStore();
            store.update(SETTINGS);

            store.reset();

            expect(store.$state).toEqual(createDefaultSettings());
        });
    });
});
