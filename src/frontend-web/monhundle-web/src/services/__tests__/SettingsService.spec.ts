import { afterEach, beforeEach, describe, expect, it, vi, type Mocked } from 'vitest';
import { computed, nextTick, ref, type Ref } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { createDefaultSettings } from '@/domain/Settings';
import type { SettingsResponse } from '@/domain/ApiModels';
import type ISettingApi from '@/domain/interfaces/api-contracts/ISettingApi';
import { LoadFailedError } from '@/domain/errors/NotifiedError/LoadFailedError';
import { UnexpectedApiError } from '@/domain/errors/UnexpectedApiError';
import { CookieKeys, clearCookies, getCookie, setCookie } from '@/services/CookieService';
import { DEFAULT_THEME } from '@/domain/Theme';
import { SettingsService } from '@/services/SettingsService';
import { useSettingsStore, type SettingsStore } from '@/stores/SettingsStore';

const TARGET_UUID = '22222222-2222-2222-2222-222222222222';

function createProfile(overrides: Partial<SettingsResponse> = {}): SettingsResponse {
    return {
        preferences: {
            gameList: ['MHWilds'],
            tableVisualAid: true,
            theme: 'classic-dark',
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
    let browserLanguages: string[];

    beforeEach(() => {
        // no browser language by default, so that the tests don't depend on jsdom's ['en-US', 'en']
        browserLanguages = [];
        vi.spyOn(Navigator.prototype, 'languages', 'get').mockImplementation(
            () => browserLanguages,
        );
        setActivePinia(createPinia());
        store = useSettingsStore();
        api = {
            updateSettings: vi.fn<ISettingApi['updateSettings']>().mockResolvedValue(undefined),
            getProfile: vi.fn<ISettingApi['getProfile']>().mockResolvedValue(createProfile()),
            loadUser: vi.fn<ISettingApi['loadUser']>().mockResolvedValue(undefined),
        };
        locale = ref('');
        document.documentElement.lang = '';
        delete document.documentElement.dataset.theme;
        clearCookies();
    });

    afterEach(() => {
        clearCookies();
        vi.restoreAllMocks();
    });

    describe('setters', () => {
        it('update the matching setting in the store', () => {
            const service = new SettingsService(store, api, locale);

            service.setLanguage('fr');
            service.setTheme('classic-dark');
            service.setGameList(['MHW', 'MHR']);
            service.setTableVisualAid(true);

            expect(store.$state).toEqual({
                language: 'fr',
                theme: 'classic-dark',
                gameList: ['MHW', 'MHR'],
                tableVisualAid: true,
            });
        });

        it('can set the language and the theme back to no explicit choice', () => {
            const service = new SettingsService(store, api, locale);
            store.update({ language: 'fr', theme: 'classic-dark' });

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

        it('falls back to english when no language is chosen nor detected', () => {
            new SettingsService(store, api, locale);

            expect(locale.value).toBe('en');
            expect(document.documentElement.lang).toBe('en');
        });

        it('applies the browser language when no language is chosen', () => {
            browserLanguages = ['fr-CH', 'en'];

            new SettingsService(store, api, locale);

            expect(locale.value).toBe('fr');
            expect(document.documentElement.lang).toBe('fr');
        });

        it('prefers the chosen language over the browser one', () => {
            browserLanguages = ['fr-CH'];
            store.update({ language: 'en' });

            new SettingsService(store, api, locale);

            expect(locale.value).toBe('en');
        });

        it('falls back to english when no browser language is supported', () => {
            browserLanguages = ['de-CH', 'it'];

            new SettingsService(store, api, locale);

            expect(locale.value).toBe('en');
        });

        it('goes back to the browser language when the choice is removed', async () => {
            browserLanguages = ['fr'];
            store.update({ language: 'en' });
            const service = new SettingsService(store, api, locale);

            service.setLanguage(null);
            await nextTick();

            expect(locale.value).toBe('fr');
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
                theme: 'classic-dark',
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
                store.update({ language: 'en', theme: 'classic-dark' });
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

    describe('theme', () => {
        // with a single registered theme, a change of the *applied* theme can't be observed yet:
        // only the application at creation and the resolution are covered for now
        it('applies the default theme to the page as soon as the service is created', () => {
            new SettingsService(store, api, locale);

            expect(document.documentElement.dataset.theme).toBe(DEFAULT_THEME);
        });

        it('applies the chosen theme to the page', () => {
            store.update({ theme: 'classic-dark' });

            new SettingsService(store, api, locale);

            expect(document.documentElement.dataset.theme).toBe('classic-dark');
        });

        it('getCurrentTheme returns the chosen theme, or the default one', () => {
            const service = new SettingsService(store, api, locale);
            expect(service.getCurrentTheme()).toBe(DEFAULT_THEME);

            service.setTheme('classic-dark');

            expect(service.getCurrentTheme()).toBe('classic-dark');
            expect(store.theme).toBe('classic-dark');
        });
    });

    describe('getCurrentLanguage', () => {
        it('returns the chosen language', () => {
            browserLanguages = ['fr'];
            store.update({ language: 'en' });
            const service = new SettingsService(store, api, locale);

            expect(service.getCurrentLanguage()).toBe('en');
        });

        it('returns the detected language when no language is chosen', () => {
            browserLanguages = ['fr-FR'];
            const service = new SettingsService(store, api, locale);

            expect(service.getCurrentLanguage()).toBe('fr');
        });

        it('does not depend on a locale changed directly in i18n', () => {
            const service = new SettingsService(store, api, locale);

            locale.value = 'fr';

            expect(service.getCurrentLanguage()).toBe('en');
        });

        it('can be followed by a computed', () => {
            const service = new SettingsService(store, api, locale);
            const current = computed(() => service.getCurrentLanguage());
            expect(current.value).toBe('en');

            service.setLanguage('fr');

            expect(current.value).toBe('fr');
        });
    });
});
