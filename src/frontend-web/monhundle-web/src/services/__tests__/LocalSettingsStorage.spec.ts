import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDefaultSettings, type Settings } from '@/domain/Settings';
import { LocalSettingsStorage } from '@/services/LocalSettingsStorage';
import { LocalStorageKeys } from '@/services/LocalStorageService';

const LEGACY_GAME_LIST_KEY = 'gameList';
const LEGACY_TABLE_VISUAL_AID_KEY = 'enableTableVisualA11y';

const SETTINGS: Settings = {
    language: 'fr',
    theme: 'classic',
    gameList: ['MHW', 'MHR'],
    tableVisualAid: true,
};

function storeRaw(value: unknown) {
    localStorage.setItem(LocalStorageKeys.SETTINGS, JSON.stringify(value));
}

describe('LocalSettingsStorage', () => {
    let storage: LocalSettingsStorage;

    beforeEach(() => {
        localStorage.clear();
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        storage = new LocalSettingsStorage();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('load', () => {
        it('returns the default settings when nothing is stored', () => {
            expect(storage.load()).toEqual(createDefaultSettings());
        });

        it('returns what was saved', () => {
            storage.save(SETTINGS);

            expect(storage.load()).toEqual(SETTINGS);
        });

        it('falls back to the default of each invalid field without affecting the others', () => {
            storeRaw({
                version: 1,
                language: 'de',
                theme: 'unknown-theme',
                gameList: ['MHW', 42, null, 'MHR'],
                tableVisualAid: 'true',
            });

            expect(storage.load()).toEqual({
                language: null,
                theme: null,
                gameList: ['MHW', 'MHR'],
                tableVisualAid: false,
            });
        });

        it.each([
            ['missing', undefined],
            ['not an array', 'MHW'],
            ['null', null],
        ])('treats a game list that is %s as never chosen', (_label, gameList) => {
            storeRaw({ version: 1, language: 'en', gameList });

            expect(storage.load()).toEqual({
                ...createDefaultSettings(),
                language: 'en',
                gameList: null,
            });
        });

        it('keeps an empty game list (all games)', () => {
            storeRaw({ version: 1, gameList: [] });

            expect(storage.load().gameList).toEqual([]);
        });

        it.each([
            ['corrupted json', '{not json'],
            ['a json null', 'null'],
            ['a json array', '["MHW"]'],
            ['a json number', '42'],
            ['an unknown version', JSON.stringify({ ...SETTINGS, version: 2 })],
            ['a missing version', JSON.stringify(SETTINGS)],
        ])('returns the default settings for %s', (_label, stored) => {
            localStorage.setItem(LocalStorageKeys.SETTINGS, stored);

            expect(storage.load()).toEqual(createDefaultSettings());
        });

        it('returns the default settings instead of throwing when localStorage reads fail', () => {
            vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
                throw new Error('storage disabled');
            });

            expect(storage.load()).toEqual(createDefaultSettings());
        });

        it('never writes to localStorage', () => {
            localStorage.setItem(LEGACY_GAME_LIST_KEY, JSON.stringify(['MHW']));
            const setItem = vi.spyOn(Storage.prototype, 'setItem');
            const removeItem = vi.spyOn(Storage.prototype, 'removeItem');

            storage.load();

            expect(setItem).not.toHaveBeenCalled();
            expect(removeItem).not.toHaveBeenCalled();
        });
    });

    describe('legacy keys', () => {
        it('migrates the values stored under the legacy keys', () => {
            localStorage.setItem(LEGACY_GAME_LIST_KEY, JSON.stringify(['MHW', 'MHR']));
            localStorage.setItem(LEGACY_TABLE_VISUAL_AID_KEY, 'TRUE');

            expect(storage.load()).toEqual({
                ...createDefaultSettings(),
                gameList: ['MHW', 'MHR'],
                tableVisualAid: true,
            });
        });

        it('keeps the legacy accessibility flag when the legacy game list is corrupted', () => {
            localStorage.setItem(LEGACY_GAME_LIST_KEY, '{not json');
            localStorage.setItem(LEGACY_TABLE_VISUAL_AID_KEY, 'true');

            expect(storage.load()).toEqual({
                ...createDefaultSettings(),
                gameList: null,
                tableVisualAid: true,
            });
        });

        it('treats a missing legacy game list as never chosen', () => {
            localStorage.setItem(LEGACY_TABLE_VISUAL_AID_KEY, 'true');

            expect(storage.load().gameList).toBeNull();
        });

        it('keeps an empty legacy game list (all games)', () => {
            localStorage.setItem(LEGACY_GAME_LIST_KEY, '[]');

            expect(storage.load().gameList).toEqual([]);
        });

        it('ignores the legacy keys once the new key exists', () => {
            storage.save(SETTINGS);
            localStorage.setItem(LEGACY_GAME_LIST_KEY, JSON.stringify(['MHGU']));
            localStorage.setItem(LEGACY_TABLE_VISUAL_AID_KEY, 'false');

            expect(storage.load()).toEqual(SETTINGS);
        });

        it('are removed by a successful save', () => {
            localStorage.setItem(LEGACY_GAME_LIST_KEY, JSON.stringify(['MHW']));
            localStorage.setItem(LEGACY_TABLE_VISUAL_AID_KEY, 'true');

            storage.save(SETTINGS);

            expect(localStorage.getItem(LEGACY_GAME_LIST_KEY)).toBeNull();
            expect(localStorage.getItem(LEGACY_TABLE_VISUAL_AID_KEY)).toBeNull();
        });

        it('are kept when the save fails', () => {
            localStorage.setItem(LEGACY_GAME_LIST_KEY, JSON.stringify(['MHW']));
            vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('quota exceeded');
            });

            expect(() => storage.save(SETTINGS)).not.toThrow();
            expect(localStorage.getItem(LEGACY_GAME_LIST_KEY)).toBe(JSON.stringify(['MHW']));
        });
    });

    describe('save', () => {
        it('writes the settings with their version under a single key', () => {
            storage.save(SETTINGS);

            expect(JSON.parse(localStorage.getItem(LocalStorageKeys.SETTINGS)!)).toEqual({
                version: 1,
                ...SETTINGS,
            });
        });

        it('writes only the settings fields', () => {
            storage.save({ ...SETTINGS, extra: 'leak' } as Settings);

            expect(JSON.parse(localStorage.getItem(LocalStorageKeys.SETTINGS)!)).not.toHaveProperty(
                'extra',
            );
        });
    });

    describe('clear', () => {
        it('removes the settings and the legacy keys but keeps the user id', () => {
            storage.save(SETTINGS);
            localStorage.setItem(LEGACY_GAME_LIST_KEY, JSON.stringify(['MHW']));
            localStorage.setItem(LEGACY_TABLE_VISUAL_AID_KEY, 'true');
            localStorage.setItem(LocalStorageKeys.USER_ID, 'user-1');

            storage.clear();

            expect(localStorage.getItem(LocalStorageKeys.SETTINGS)).toBeNull();
            expect(localStorage.getItem(LEGACY_GAME_LIST_KEY)).toBeNull();
            expect(localStorage.getItem(LEGACY_TABLE_VISUAL_AID_KEY)).toBeNull();
            expect(localStorage.getItem(LocalStorageKeys.USER_ID)).toBe('user-1');
        });

        it('swallows errors when localStorage removals fail', () => {
            vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
                throw new Error('storage disabled');
            });

            expect(() => storage.clear()).not.toThrow();
        });
    });
});
