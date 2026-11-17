import { afterEach, beforeEach, describe, expect, it, vi, type Mocked } from 'vitest';
import { nextTick, ref, type Ref } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { createDefaultSettings } from '@/domain/Settings';
import type { SettingsResponse } from '@/domain/ApiModels';
import type ISettingApi from '@/domain/interfaces/api-contracts/ISettingApi';
import { LoadFailedError } from '@/domain/errors/NotifiedError/LoadFailedError';
import { UnexpectedApiError } from '@/domain/errors/UnexpectedApiError';
import { CookieKeys, clearCookies, getCookie, setCookie } from '@/services/CookieService';
import { SettingsService } from '@/services/SettingsService';
import { useSettingsStore, type SettingsStore } from '@/stores/SettingsStore';

const TARGET_UUID = '22222222-2222-2222-2222-222222222222';

function createProfile(overrides: Partial<SettingsResponse> = {}): SettingsResponse {
    return {
        preferences: {
            gameList: ['MHWilds'],
            tableVisualAid: true,
            theme: 'classic',
            preferredLanguage: 'fr',
        },
        currentDailyGameUuid: null,
        currentUnlimitedGameUuid: null,
        ...overrides,
    };
}

describe('SettingsService', () => {
    let store: SettingsStore;
    let api: Mocked<ISettingApi>;
    let locale: Ref<string>;

    beforeEach(() => {
        setActivePinia(createPinia());
        store = useSettingsStore();
        api = {
            saveSettings: vi.fn<ISettingApi['saveSettings']>().mockResolvedValue(undefined),
            updateSettings: vi.fn<ISettingApi['updateSettings']>().mockResolvedValue(undefined),
            getProfile: vi.fn<ISettingApi['getProfile']>().mockResolvedValue(createProfile()),
            loadUser: vi.fn<ISettingApi['loadUser']>().mockResolvedValue(undefined),
        };
        locale = ref('');
        document.documentElement.lang = '';
        clearCookies();
    });

    afterEach(() => {
        clearCookies();
    });

    describe('setters', () => {
        it('update the matching setting in the store', () => {
            const service = new SettingsService(store, api, locale);

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
            const service = new SettingsService(store, api, locale);
            store.update({ language: 'fr', theme: 'classic' });

            service.setLanguage(null);
            service.setTheme(null);

            expect(store.language).toBeNull();
            expect(store.theme).toBeNull();
        });

        it('resetSettings goes back to the default settings', () => {
            const service = new SettingsService(store, api, locale);
            store.update({ language: 'fr', gameList: ['MHW'], tableVisualAid: true });

            service.resetSettings();

            expect(store.$state).toEqual(createDefaultSettings());
        });
    });

    describe('language', () => {
        it('applies the stored language as soon as the service is created', () => {
            store.update({ language: 'fr' });

            new SettingsService(store, api, locale);

            expect(locale.value).toBe('fr');
            expect(document.documentElement.lang).toBe('fr');
        });

        it('falls back to english when no language is chosen', () => {
            new SettingsService(store, api, locale);

            expect(locale.value).toBe('en');
            expect(document.documentElement.lang).toBe('en');
        });

        it('applies every language change', async () => {
            const service = new SettingsService(store, api, locale);

            service.setLanguage('fr');
            await nextTick();

            expect(locale.value).toBe('fr');
            expect(document.documentElement.lang).toBe('fr');
        });

        it('applies a language change made outside of the service', async () => {
            new SettingsService(store, api, locale);

            store.update({ language: 'fr' });
            await nextTick();

            expect(locale.value).toBe('fr');
        });

        it('goes back to english after a reset', async () => {
            const service = new SettingsService(store, api, locale);
            service.setLanguage('fr');
            await nextTick();

            service.resetSettings();
            await nextTick();

            expect(locale.value).toBe('en');
            expect(document.documentElement.lang).toBe('en');
        });
    });

    describe('saveToProfile', () => {
        it('sends all the current settings', async () => {
            const service = new SettingsService(store, api, locale);
            store.update({ language: 'fr', gameList: ['MHW'], tableVisualAid: true });

            await service.saveToProfile();

            expect(api.updateSettings).toHaveBeenCalledExactlyOnceWith({
                language: 'fr',
                theme: null,
                gameList: ['MHW'],
                tableVisualAid: true,
            });
        });

        it('sends a copy, not the reactive state itself', async () => {
            const service = new SettingsService(store, api, locale);

            await service.saveToProfile();

            expect(api.updateSettings.mock.calls[0]![0]).not.toBe(store.$state);
        });

        it('lets the api error through', async () => {
            const error = new UnexpectedApiError('boom', 500);
            api.updateSettings.mockRejectedValue(error);
            const service = new SettingsService(store, api, locale);

            await expect(service.saveToProfile()).rejects.toBe(error);
        });
    });

    describe('loadProfile', () => {
        it('fetches the profile before switching identity', async () => {
            const service = new SettingsService(store, api, locale);

            await service.loadProfile(TARGET_UUID);

            expect(api.getProfile).toHaveBeenCalledExactlyOnceWith(TARGET_UUID);
            expect(api.loadUser).toHaveBeenCalledExactlyOnceWith(TARGET_UUID);
            expect(api.getProfile.mock.invocationCallOrder[0]).toBeLessThan(
                api.loadUser.mock.invocationCallOrder[0]!,
            );
        });

        it('applies the preferences of the profile', async () => {
            const service = new SettingsService(store, api, locale);

            await service.loadProfile(TARGET_UUID);

            expect(store.$state).toEqual({
                language: 'fr',
                theme: 'classic',
                gameList: ['MHWilds'],
                tableVisualAid: true,
            });
        });

        it('applies the language of the profile to i18n', async () => {
            const service = new SettingsService(store, api, locale);

            await service.loadProfile(TARGET_UUID);
            await nextTick();

            expect(locale.value).toBe('fr');
        });

        it.each([
            ['unsupported', 'de', 'unknown-theme'],
            ['missing', null, null],
        ])(
            'falls back to no explicit choice for an %s language or theme',
            async (_label, preferredLanguage, theme) => {
                api.getProfile.mockResolvedValue(
                    createProfile({
                        preferences: {
                            gameList: [],
                            tableVisualAid: false,
                            theme,
                            preferredLanguage,
                        },
                    }),
                );
                store.update({ language: 'en', theme: 'classic' });
                const service = new SettingsService(store, api, locale);

                await service.loadProfile(TARGET_UUID);

                expect(store.language).toBeNull();
                expect(store.theme).toBeNull();
            },
        );

        it('stores the current games of the profile in the cookies', async () => {
            api.getProfile.mockResolvedValue(
                createProfile({
                    currentDailyGameUuid: 'daily-1',
                    currentUnlimitedGameUuid: 'unlimited-1',
                }),
            );
            const service = new SettingsService(store, api, locale);

            await service.loadProfile(TARGET_UUID);

            expect(getCookie(CookieKeys.CURRENT_DAILY_GAME)).toBe('daily-1');
            expect(getCookie(CookieKeys.CURRENT_UNLIMITED_GAME)).toBe('unlimited-1');
        });

        it('removes the local current games when the profile has none', async () => {
            setCookie(CookieKeys.CURRENT_DAILY_GAME, 'local-daily');
            setCookie(CookieKeys.CURRENT_UNLIMITED_GAME, 'local-unlimited');
            const service = new SettingsService(store, api, locale);

            await service.loadProfile(TARGET_UUID);

            expect(getCookie(CookieKeys.CURRENT_DAILY_GAME)).toBeUndefined();
            expect(getCookie(CookieKeys.CURRENT_UNLIMITED_GAME)).toBeUndefined();
        });

        it('throws a LoadFailedError for an unknown profile, without switching identity', async () => {
            api.getProfile.mockResolvedValue(null);
            store.update({ gameList: ['MHW'] });
            const service = new SettingsService(store, api, locale);

            await expect(service.loadProfile(TARGET_UUID)).rejects.toBeInstanceOf(LoadFailedError);

            expect(api.loadUser).not.toHaveBeenCalled();
            expect(store.gameList).toEqual(['MHW']);
        });

        it('applies nothing when switching identity fails', async () => {
            const error = new UnexpectedApiError('boom', 500);
            api.loadUser.mockRejectedValue(error);
            setCookie(CookieKeys.CURRENT_DAILY_GAME, 'local-daily');
            store.update({ gameList: ['MHW'] });
            const service = new SettingsService(store, api, locale);

            await expect(service.loadProfile(TARGET_UUID)).rejects.toBe(error);

            expect(store.gameList).toEqual(['MHW']);
            expect(getCookie(CookieKeys.CURRENT_DAILY_GAME)).toBe('local-daily');
        });

        it('does not save anything to the profile', async () => {
            const service = new SettingsService(store, api, locale);

            await service.loadProfile(TARGET_UUID);

            expect(api.updateSettings).not.toHaveBeenCalled();
        });
    });
});
