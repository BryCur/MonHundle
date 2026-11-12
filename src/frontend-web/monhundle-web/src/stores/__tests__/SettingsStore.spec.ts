import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { nextTick } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import type ISettingsStorage from '@/domain/interfaces/services/ISettingsStorage';
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

            store.update({ language: null, theme: null, gameList: null });

            expect(store.language).toBeNull();
            expect(store.theme).toBeNull();
            expect(store.gameList).toBeNull();
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

    describe('initialise', () => {
        let storage: ISettingsStorage & {
            load: Mock<ISettingsStorage['load']>;
            save: Mock<ISettingsStorage['save']>;
        };

        beforeEach(() => {
            storage = {
                load: vi.fn(() => structuredClone(SETTINGS)),
                save: vi.fn(),
                clear: vi.fn(),
            };
        });

        it('loads the stored settings', () => {
            const store = useSettingsStore();

            store.initialise(storage);

            expect(store.$state).toEqual(SETTINGS);
        });

        it('does not save the settings it just loaded', async () => {
            const store = useSettingsStore();

            store.initialise(storage);
            await nextTick();

            expect(storage.save).not.toHaveBeenCalled();
        });

        it('saves the settings once per update', async () => {
            const store = useSettingsStore();
            store.initialise(storage);

            store.update({ language: 'en', tableVisualAid: false });
            await nextTick();

            expect(storage.save).toHaveBeenCalledExactlyOnceWith({
                ...SETTINGS,
                language: 'en',
                tableVisualAid: false,
            });
        });

        it('saves the default settings on reset', async () => {
            const store = useSettingsStore();
            store.initialise(storage);

            store.reset();
            await nextTick();

            expect(storage.save).toHaveBeenLastCalledWith(createDefaultSettings());
        });

        it('saves nothing before being initialised', async () => {
            const store = useSettingsStore();

            store.update({ language: 'en' });
            await nextTick();

            expect(storage.save).not.toHaveBeenCalled();
        });
    });
});
